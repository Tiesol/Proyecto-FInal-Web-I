from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.core.database import get_session
from app.core.security import get_current_active_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.donation import Donation, DonationCreate, DonationResponse

router = APIRouter(prefix="/donations", tags=["Donaciones"])

@router.post("/", response_model=DonationResponse)
async def create_donation(
    donation_data: DonationCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Crea una nueva donación a una campaña"""
    
    # Verificar que la campaña existe y está en progreso
    campaign = session.get(Campaign, donation_data.campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Verificar que la campaña está publicada y en progreso
    if campaign.workflow_state_id != 5 or campaign.campaign_state_id != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña no está disponible para recibir donaciones"
        )
    
    # No puedes donar a tu propia campaña
    if campaign.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes donar a tu propia campaña"
        )
    
    # Validar monto
    if donation_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El monto debe ser mayor a 0"
        )
    
    new_donation = Donation(
        amount=donation_data.amount,
        donation_state_id=2,  # Completada (simulamos pago exitoso)
        user_id=current_user.id,
        campaign_id=donation_data.campaign_id,
        payment_method_id=donation_data.payment_method_id,
        created_at=datetime.utcnow()
    )
    
    session.add(new_donation)
    
    # Actualizar monto recaudado de la campaña
    campaign.current_amount += donation_data.amount
    
    # Si se alcanzó la meta, finalizar la campaña
    if campaign.current_amount >= campaign.goal_amount:
        campaign.campaign_state_id = 4  # Finalizada
        campaign.end_date = datetime.utcnow().date()
    
    campaign.updated_at = datetime.utcnow()
    session.add(campaign)
    
    session.commit()
    session.refresh(new_donation)
    
    return DonationResponse(
        id=new_donation.id,
        amount=new_donation.amount,
        donation_state_id=new_donation.donation_state_id,
        user_id=new_donation.user_id,
        campaign_id=new_donation.campaign_id,
        payment_method_id=new_donation.payment_method_id,
        created_at=new_donation.created_at,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        campaign_title=campaign.tittle
    )

@router.get("/my-donations", response_model=List[DonationResponse])
async def get_my_donations(
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Obtiene todas las donaciones realizadas por el usuario"""
    
    statement = select(Donation).where(Donation.user_id == current_user.id).order_by(Donation.created_at.desc())
    donations = session.exec(statement).all()
    
    result = []
    for donation in donations:
        campaign = session.get(Campaign, donation.campaign_id)
        result.append(DonationResponse(
            id=donation.id,
            amount=donation.amount,
            donation_state_id=donation.donation_state_id,
            user_id=donation.user_id,
            campaign_id=donation.campaign_id,
            payment_method_id=donation.payment_method_id,
            created_at=donation.created_at,
            user_name=f"{current_user.first_name} {current_user.last_name}",
            campaign_title=campaign.tittle if campaign else None
        ))
    
    return result

@router.get("/campaign/{campaign_id}", response_model=List[DonationResponse])
async def get_campaign_donations(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Obtiene todas las donaciones de una campaña (solo el dueño puede ver)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Solo el dueño o admin puede ver las donaciones
    if campaign.user_id != current_user.id and current_user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta información"
        )
    
    statement = select(Donation).where(Donation.campaign_id == campaign_id).order_by(Donation.amount.desc())
    donations = session.exec(statement).all()
    
    result = []
    for donation in donations:
        user = session.get(Person, donation.user_id)
        result.append(DonationResponse(
            id=donation.id,
            amount=donation.amount,
            donation_state_id=donation.donation_state_id,
            user_id=donation.user_id,
            campaign_id=donation.campaign_id,
            payment_method_id=donation.payment_method_id,
            created_at=donation.created_at,
            user_name=f"{user.first_name} {user.last_name}" if user else "Anónimo",
            campaign_title=campaign.tittle
        ))
    
    return result

@router.get("/campaign/{campaign_id}/total")
async def get_campaign_total(
    campaign_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene el total recaudado de una campaña (público)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    return {
        "campaign_id": campaign_id,
        "total_amount": float(campaign.current_amount),
        "goal_amount": float(campaign.goal_amount),
        "progress_percentage": round(float(campaign.current_amount / campaign.goal_amount * 100), 2) if campaign.goal_amount > 0 else 0
    }

@router.get("/campaign/{campaign_id}/top-donors")
async def get_top_donors(
    campaign_id: int,
    limit: int = 10,
    session: Session = Depends(get_session)
):
    """Obtiene los top donadores de una campaña (público)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    statement = select(Donation).where(
        Donation.campaign_id == campaign_id,
        Donation.donation_state_id == 2  # Solo completadas
    ).order_by(Donation.amount.desc()).limit(limit)
    
    donations = session.exec(statement).all()
    
    result = []
    for donation in donations:
        user = session.get(Person, donation.user_id)
        result.append({
            "user_name": f"{user.first_name} {user.last_name}" if user else "Anónimo",
            "amount": float(donation.amount),
            "created_at": donation.created_at
        })
    
    return result

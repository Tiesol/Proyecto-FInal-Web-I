from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime
import httpx
import os

from app.core.database import get_session
from app.core.security import get_current_active_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.category import Category
from app.models.donation import Donation, DonationCreate, DonationResponse, MyDonationResponse
from app.models.donation_state import DonationState

router = APIRouter(prefix="/donations", tags=["Donaciones"])

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://gateway:3000/payments")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

@router.post("/", response_model=DonationResponse)
async def create_donation(
    donation_data: DonationCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    campaign = session.get(Campaign, donation_data.campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campaign.workflow_state_id != 5 or campaign.campaign_state_id != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña no está disponible para recibir donaciones"
        )

    if campaign.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes donar a tu propia campaña"
        )

    if donation_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El monto debe ser mayor a 0"
        )

    gateway_payment_id = None
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GATEWAY_URL,
                json={"monto": float(donation_data.amount)},
                timeout=10.0
            )
            if response.status_code == 201:
                gateway_data = response.json()
                gateway_payment_id = gateway_data.get("id")
    except Exception as e:
        print(f"Error llamando al gateway: {e}")

    new_donation = Donation(
        amount=donation_data.amount,
        donation_state_id=1 if gateway_payment_id else 2,
        user_id=current_user.id,
        campaign_id=donation_data.campaign_id,
        payment_method_id=donation_data.payment_method_id,
        gateway_payment_id=gateway_payment_id,
        created_at=datetime.utcnow()
    )

    session.add(new_donation)

    if not gateway_payment_id:
        campaign.current_amount += donation_data.amount
        if campaign.current_amount >= campaign.goal_amount:
            campaign.campaign_state_id = 4
            campaign.end_date = datetime.utcnow().date()
        campaign.updated_at = datetime.utcnow()
        session.add(campaign)

    session.commit()
    session.refresh(new_donation)

    payment_url = None
    if gateway_payment_id:
        payment_url = f"{FRONTEND_URL}/payment.html?donation_id={new_donation.id}&gateway_id={gateway_payment_id}&campaign_id={donation_data.campaign_id}"

    return DonationResponse(
        id=new_donation.id,
        amount=new_donation.amount,
        donation_state_id=new_donation.donation_state_id,
        user_id=new_donation.user_id,
        campaign_id=new_donation.campaign_id,
        payment_method_id=new_donation.payment_method_id,
        gateway_payment_id=new_donation.gateway_payment_id,
        created_at=new_donation.created_at,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        campaign_title=campaign.tittle,
        payment_url=payment_url
    )

@router.post("/confirm-payment")
async def confirm_payment(
    payment_data: dict,
    session: Session = Depends(get_session)
):

    gateway_id = payment_data.get("id")
    if not gateway_id:
        raise HTTPException(status_code=400, detail="ID de pago requerido")

    statement = select(Donation).where(Donation.gateway_payment_id == gateway_id)
    donation = session.exec(statement).first()

    if not donation:
        raise HTTPException(status_code=404, detail="Donación no encontrada")

    if donation.donation_state_id == 2:
        return {"message": "Pago ya confirmado"}

    donation.donation_state_id = 2
    session.add(donation)

    campaign = session.get(Campaign, donation.campaign_id)
    if campaign:
        campaign.current_amount += donation.amount
        if campaign.current_amount >= campaign.goal_amount:
            campaign.campaign_state_id = 4
            campaign.end_date = datetime.utcnow().date()
        campaign.updated_at = datetime.utcnow()
        session.add(campaign)

    session.commit()

    return {"message": "Pago confirmado", "donation_id": donation.id}

@router.get("/status/{donation_id}")
async def get_donation_status(
    donation_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    donation = session.get(Donation, donation_id)

    if not donation:
        raise HTTPException(status_code=404, detail="Donación no encontrada")

    if donation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    return {
        "id": donation.id,
        "amount": float(donation.amount),
        "state_id": donation.donation_state_id,
        "state": "Completada" if donation.donation_state_id == 2 else "Pendiente",
        "gateway_payment_id": donation.gateway_payment_id
    }

@router.get("/my-donations", response_model=List[MyDonationResponse])
async def get_my_donations(
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    statement = select(Donation).where(
        Donation.user_id == current_user.id,
        Donation.donation_state_id == 2
    ).order_by(Donation.created_at.desc())
    donations = session.exec(statement).all()

    result = []
    for donation in donations:
        campaign = session.get(Campaign, donation.campaign_id)
        if not campaign:
            continue

        donation_state = session.get(DonationState, donation.donation_state_id)

        category = session.get(Category, campaign.category_id) if campaign.category_id else None

        creator = session.get(Person, campaign.user_id)

        result.append(MyDonationResponse(
            id=donation.id,
            amount=donation.amount,
            donation_state_id=donation.donation_state_id,
            donation_state_name=donation_state.name if donation_state else None,
            created_at=donation.created_at,
            campaign_id=campaign.id,
            campaign_title=campaign.tittle,
            campaign_image=campaign.main_image_url,
            campaign_goal=campaign.goal_amount,
            campaign_current=campaign.current_amount,
            campaign_expiration=campaign.expiration_date,
            campaign_category=category.name if category else None,
            creator_name=f"{creator.first_name} {creator.last_name}" if creator else None
        ))

    return result

@router.put("/{donation_id}/cancel")
async def cancel_donation(
    donation_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    donation = session.get(Donation, donation_id)

    if not donation:
        raise HTTPException(status_code=404, detail="Donación no encontrada")

    if donation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    if donation.donation_state_id != 1:
        raise HTTPException(status_code=400, detail="Solo se pueden cancelar donaciones pendientes")

    donation.donation_state_id = 3
    session.add(donation)
    session.commit()

    return {"message": "Donación cancelada", "donation_id": donation.id}

@router.get("/campaign/{campaign_id}", response_model=List[DonationResponse])
async def get_campaign_donations(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

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

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    statement = select(Donation).where(
        Donation.campaign_id == campaign_id,
        Donation.donation_state_id == 2
    ).order_by(Donation.amount.desc()).limit(limit)

    donations = session.exec(statement).all()

    result = []
    for donation in donations:
        user = session.get(Person, donation.user_id)
        result.append({
            "user_name": f"{user.first_name} {user.last_name}" if user else "Anónimo",
            "user_image": user.profile_image_url if user else None,
            "amount": float(donation.amount),
            "created_at": donation.created_at
        })

    return result

@router.get("/campaign/{campaign_id}/all")
async def get_all_campaign_donations(
    campaign_id: int,
    session: Session = Depends(get_session)
):

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campaign.workflow_state_id != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Campaña no publicada"
        )

    category = session.get(Category, campaign.category_id) if campaign.category_id else None

    statement = select(Donation).where(
        Donation.campaign_id == campaign_id,
        Donation.donation_state_id == 2
    ).order_by(Donation.amount.desc())

    donations = session.exec(statement).all()

    donors = []
    for donation in donations:
        user = session.get(Person, donation.user_id)
        donors.append({
            "id": donation.id,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Anónimo",
            "user_image": user.profile_image_url if user else None,
            "amount": float(donation.amount),
            "created_at": donation.created_at.isoformat() if donation.created_at else None
        })

    return {
        "campaign": {
            "id": campaign.id,
            "title": campaign.tittle,
            "image": campaign.main_image_url,
            "goal_amount": float(campaign.goal_amount) if campaign.goal_amount else 0,
            "current_amount": float(campaign.current_amount) if campaign.current_amount else 0,
            "category": category.name if category else None
        },
        "donors": donors,
        "top_5": donors[:5] if len(donors) >= 5 else donors
    }

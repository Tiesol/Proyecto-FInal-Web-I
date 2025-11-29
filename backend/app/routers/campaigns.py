from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from datetime import datetime

from app.core.database import get_session
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.person import Person
from app.models.campaign import (
    Campaign, 
    CampaignCreate, 
    CampaignUpdate, 
    CampaignResponse, 
    CampaignPublic
)
from app.models.category import Category

router = APIRouter(prefix="/campaigns", tags=["Campañas"])

# ============== ENDPOINTS PÚBLICOS ==============

@router.get("/public", response_model=List[CampaignPublic])
async def get_public_campaigns(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    session: Session = Depends(get_session)
):
    """Obtiene campañas públicas (publicadas y con campaña en progreso)"""
    
    # Solo campañas publicadas (workflow_state_id = 5) y en progreso (campaign_state_id = 2)
    statement = select(Campaign).where(
        Campaign.workflow_state_id == 5,
        Campaign.campaign_state_id == 2
    )
    
    if category_id:
        statement = statement.where(Campaign.category_id == category_id)
    
    if search:
        statement = statement.where(
            Campaign.tittle.ilike(f"%{search}%") | 
            Campaign.description.ilike(f"%{search}%")
        )
    
    statement = statement.offset(offset).limit(limit)
    campaigns = session.exec(statement).all()
    
    result = []
    for campaign in campaigns:
        # Calcular porcentaje de progreso
        progress = 0.0
        if campaign.goal_amount and campaign.goal_amount > 0:
            progress = float(campaign.current_amount / campaign.goal_amount * 100)
        
        # Obtener datos del usuario
        user = session.get(Person, campaign.user_id)
        category = session.get(Category, campaign.category_id) if campaign.category_id else None
        
        result.append(CampaignPublic(
            id=campaign.id,
            tittle=campaign.tittle,
            description=campaign.description,
            goal_amount=campaign.goal_amount,
            current_amount=campaign.current_amount,
            expiration_date=campaign.expiration_date,
            main_image_url=campaign.main_image_url,
            view_counting=campaign.view_counting,
            favorites_counting=campaign.favorites_counting,
            user_first_name=user.first_name if user else None,
            user_last_name=user.last_name if user else None,
            category_name=category.name if category else None,
            progress_percentage=round(progress, 2)
        ))
    
    return result

@router.get("/featured", response_model=List[CampaignPublic])
async def get_featured_campaigns(
    limit: int = Query(default=6, le=20),
    session: Session = Depends(get_session)
):
    """Obtiene campañas destacadas (más vistas o con más favoritos)"""
    
    statement = select(Campaign).where(
        Campaign.workflow_state_id == 5,
        Campaign.campaign_state_id == 2
    ).order_by(Campaign.favorites_counting.desc(), Campaign.view_counting.desc()).limit(limit)
    
    campaigns = session.exec(statement).all()
    
    result = []
    for campaign in campaigns:
        progress = 0.0
        if campaign.goal_amount and campaign.goal_amount > 0:
            progress = float(campaign.current_amount / campaign.goal_amount * 100)
        
        user = session.get(Person, campaign.user_id)
        category = session.get(Category, campaign.category_id) if campaign.category_id else None
        
        result.append(CampaignPublic(
            id=campaign.id,
            tittle=campaign.tittle,
            description=campaign.description,
            goal_amount=campaign.goal_amount,
            current_amount=campaign.current_amount,
            expiration_date=campaign.expiration_date,
            main_image_url=campaign.main_image_url,
            view_counting=campaign.view_counting,
            favorites_counting=campaign.favorites_counting,
            user_first_name=user.first_name if user else None,
            user_last_name=user.last_name if user else None,
            category_name=category.name if category else None,
            progress_percentage=round(progress, 2)
        ))
    
    return result

@router.get("/public/{campaign_id}", response_model=CampaignResponse)
async def get_public_campaign_detail(
    campaign_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene el detalle de una campaña pública"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Solo campañas publicadas pueden verse públicamente
    if campaign.workflow_state_id != 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta campaña no está disponible públicamente"
        )
    
    # Incrementar contador de vistas
    campaign.view_counting += 1
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    
    return campaign

# ============== ENDPOINTS PARA USUARIOS AUTENTICADOS ==============

@router.get("/my-campaigns", response_model=List[CampaignResponse])
async def get_my_campaigns(
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Obtiene las campañas del usuario autenticado"""
    
    statement = select(Campaign).where(Campaign.user_id == current_user.id)
    campaigns = session.exec(statement).all()
    
    return campaigns

@router.post("/", response_model=CampaignResponse)
async def create_campaign(
    campaign_data: CampaignCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Crea una nueva campaña (en estado borrador)"""
    
    new_campaign = Campaign(
        tittle=campaign_data.tittle,
        description=campaign_data.description,
        goal_amount=campaign_data.goal_amount,
        expiration_date=campaign_data.expiration_date,
        main_image_url=campaign_data.main_image_url,
        rich_text=campaign_data.rich_text,
        category_id=campaign_data.category_id,
        user_id=current_user.id,
        workflow_state_id=1,  # Borrador
        campaign_state_id=1,  # No iniciada
        current_amount=0,
        view_counting=0,
        favorites_counting=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(new_campaign)
    session.commit()
    session.refresh(new_campaign)
    
    return new_campaign

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Obtiene una campaña del usuario autenticado"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Solo el dueño o admin puede ver campañas no publicadas
    if campaign.user_id != current_user.id and current_user.role_id != 1:
        if campaign.workflow_state_id != 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver esta campaña"
            )
    
    return campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: int,
    campaign_data: CampaignUpdate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Actualiza una campaña (solo si está en borrador u observado)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar esta campaña"
        )
    
    # Solo se puede editar en estados: Borrador (1) u Observado (3)
    if campaign.workflow_state_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes editar una campaña en este estado"
        )
    
    # Actualizar campos
    if campaign_data.tittle is not None:
        campaign.tittle = campaign_data.tittle
    if campaign_data.description is not None:
        campaign.description = campaign_data.description
    if campaign_data.goal_amount is not None:
        campaign.goal_amount = campaign_data.goal_amount
    if campaign_data.expiration_date is not None:
        campaign.expiration_date = campaign_data.expiration_date
    if campaign_data.main_image_url is not None:
        campaign.main_image_url = campaign_data.main_image_url
    if campaign_data.rich_text is not None:
        campaign.rich_text = campaign_data.rich_text
    if campaign_data.category_id is not None:
        campaign.category_id = campaign_data.category_id
    
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    
    return campaign

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Elimina una campaña (solo si está en borrador)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id and current_user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta campaña"
        )
    
    # Solo se puede eliminar en estado borrador
    if campaign.workflow_state_id != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes eliminar campañas en estado borrador"
        )
    
    session.delete(campaign)
    session.commit()
    
    return {"message": "Campaña eliminada exitosamente"}

@router.post("/{campaign_id}/submit-for-review")
async def submit_for_review(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Envía una campaña para revisión"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para esta acción"
        )
    
    # Solo desde Borrador (1) u Observado (3) se puede enviar a revisión
    if campaign.workflow_state_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes enviar esta campaña a revisión en su estado actual"
        )
    
    # Validar datos obligatorios
    if not campaign.tittle or not campaign.description or not campaign.goal_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña debe tener título, descripción y meta de financiación"
        )
    
    campaign.workflow_state_id = 2  # En Revisión
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña enviada para revisión exitosamente"}

# ============== CONTROL DE ESTADO DE CAMPAÑA DE RECAUDACIÓN ==============

@router.post("/{campaign_id}/start")
async def start_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Inicia la campaña de recaudación"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para esta acción"
        )
    
    # Solo campañas publicadas pueden iniciar recaudación
    if campaign.workflow_state_id != 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña debe estar publicada para iniciar la recaudación"
        )
    
    # Solo desde No Iniciada (1) o En Pausa (3)
    if campaign.campaign_state_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes iniciar la campaña en su estado actual"
        )
    
    campaign.campaign_state_id = 2  # En Progreso
    if not campaign.start_date:
        campaign.start_date = datetime.utcnow().date()
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña de recaudación iniciada exitosamente"}

@router.post("/{campaign_id}/pause")
async def pause_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Pausa la campaña de recaudación"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para esta acción"
        )
    
    # Solo desde En Progreso (2)
    if campaign.campaign_state_id != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes pausar una campaña en progreso"
        )
    
    campaign.campaign_state_id = 3  # En Pausa
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña pausada exitosamente"}

@router.post("/{campaign_id}/finish")
async def finish_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Finaliza la campaña de recaudación"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para esta acción"
        )
    
    # Solo desde En Progreso (2) o En Pausa (3)
    if campaign.campaign_state_id not in [2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes finalizar la campaña en su estado actual"
        )
    
    campaign.campaign_state_id = 4  # Finalizada
    campaign.end_date = datetime.utcnow().date()
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña finalizada exitosamente"}

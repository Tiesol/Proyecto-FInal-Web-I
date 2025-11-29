from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.campaign_observation import CampaignObservation, CampaignObservationCreate, CampaignObservationResponse
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Administración"])

class AdminUserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class CampaignAdminResponse(BaseModel):
    id: int
    tittle: str
    description: str
    goal_amount: float
    current_amount: float
    workflow_state_id: int
    workflow_state_name: str
    campaign_state_id: int
    user_name: str
    user_email: str
    created_at: datetime

class ApprovalAction(BaseModel):
    observation_text: str = ""

# ============== GESTIÓN DE ADMINISTRADORES ==============

@router.get("/users", response_model=List[dict])
async def get_admin_users(
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Lista todos los usuarios administradores"""
    
    statement = select(Person).where(Person.role_id == 1)
    admins = session.exec(statement).all()
    
    return [
        {
            "id": admin.id,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "email": admin.email,
            "is_active": admin.is_active,
            "created_at": admin.created_at
        }
        for admin in admins
    ]

@router.post("/users")
async def create_admin_user(
    user_data: AdminUserCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Crea un nuevo usuario administrador (no requiere verificación de email)"""
    from app.core.security import get_password_hash
    
    # Verificar si el email ya existe
    statement = select(Person).where(Person.email == user_data.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado"
        )
    
    new_admin = Person(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password=get_password_hash(user_data.password),
        is_active=True,  # Los admins no necesitan verificar email
        role_id=1,  # Admin
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)
    
    return {
        "message": "Administrador creado exitosamente",
        "id": new_admin.id
    }

@router.delete("/users/{user_id}")
async def delete_admin_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Elimina un usuario administrador"""
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminarte a ti mismo"
        )
    
    user = session.get(Person, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no es administrador"
        )
    
    session.delete(user)
    session.commit()
    
    return {"message": "Administrador eliminado exitosamente"}

# ============== GESTIÓN DE CAMPAÑAS ==============

@router.get("/campaigns", response_model=List[CampaignAdminResponse])
async def get_all_campaigns(
    workflow_state_id: int = None,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Lista todas las campañas con filtro opcional por estado de workflow"""
    
    statement = select(Campaign)
    
    if workflow_state_id:
        statement = statement.where(Campaign.workflow_state_id == workflow_state_id)
    
    campaigns = session.exec(statement).all()
    
    workflow_states = {
        1: "Borrador",
        2: "En Revisión",
        3: "Observado",
        4: "Rechazado",
        5: "Publicado"
    }
    
    result = []
    for campaign in campaigns:
        user = session.get(Person, campaign.user_id)
        result.append(CampaignAdminResponse(
            id=campaign.id,
            tittle=campaign.tittle,
            description=campaign.description,
            goal_amount=float(campaign.goal_amount),
            current_amount=float(campaign.current_amount),
            workflow_state_id=campaign.workflow_state_id,
            workflow_state_name=workflow_states.get(campaign.workflow_state_id, "Desconocido"),
            campaign_state_id=campaign.campaign_state_id,
            user_name=f"{user.first_name} {user.last_name}" if user else "Usuario desconocido",
            user_email=user.email if user else "",
            created_at=campaign.created_at
        ))
    
    return result

@router.post("/campaigns/{campaign_id}/approve")
async def approve_campaign(
    campaign_id: int,
    action_data: ApprovalAction,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Aprueba una campaña (cambia a estado Publicado)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.workflow_state_id != 2:  # Solo desde "En Revisión"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes aprobar campañas en estado 'En Revisión'"
        )
    
    # Crear observación de aprobación
    observation = CampaignObservation(
        observation_text=action_data.observation_text or "Campaña aprobada",
        user_id=current_user.id,
        campaign_id=campaign_id,
        action_id=3,  # Aprobado
        created_at=datetime.utcnow()
    )
    session.add(observation)
    
    campaign.workflow_state_id = 5  # Publicado
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña aprobada exitosamente"}

@router.post("/campaigns/{campaign_id}/observe")
async def observe_campaign(
    campaign_id: int,
    action_data: ApprovalAction,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Observa una campaña (requiere correcciones)"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.workflow_state_id != 2:  # Solo desde "En Revisión"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes observar campañas en estado 'En Revisión'"
        )
    
    if not action_data.observation_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes proporcionar un texto de observación"
        )
    
    # Crear observación
    observation = CampaignObservation(
        observation_text=action_data.observation_text,
        user_id=current_user.id,
        campaign_id=campaign_id,
        action_id=1,  # Observado
        created_at=datetime.utcnow()
    )
    session.add(observation)
    
    campaign.workflow_state_id = 3  # Observado
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña observada exitosamente"}

@router.post("/campaigns/{campaign_id}/reject")
async def reject_campaign(
    campaign_id: int,
    action_data: ApprovalAction,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Rechaza una campaña"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.workflow_state_id != 2:  # Solo desde "En Revisión"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes rechazar campañas en estado 'En Revisión'"
        )
    
    if not action_data.observation_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes proporcionar un motivo de rechazo"
        )
    
    # Crear observación de rechazo
    observation = CampaignObservation(
        observation_text=action_data.observation_text,
        user_id=current_user.id,
        campaign_id=campaign_id,
        action_id=2,  # Rechazado
        created_at=datetime.utcnow()
    )
    session.add(observation)
    
    campaign.workflow_state_id = 4  # Rechazado
    campaign.updated_at = datetime.utcnow()
    
    session.add(campaign)
    session.commit()
    
    return {"message": "Campaña rechazada"}

@router.get("/campaigns/{campaign_id}/observations", response_model=List[CampaignObservationResponse])
async def get_campaign_observations(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Obtiene el historial de observaciones de una campaña"""
    
    statement = select(CampaignObservation).where(
        CampaignObservation.campaign_id == campaign_id
    ).order_by(CampaignObservation.created_at.desc())
    
    observations = session.exec(statement).all()
    
    action_names = {
        1: "Observado",
        2: "Rechazado",
        3: "Aprobado"
    }
    
    result = []
    for obs in observations:
        admin = session.get(Person, obs.user_id) if obs.user_id else None
        result.append(CampaignObservationResponse(
            id=obs.id,
            observation_text=obs.observation_text,
            user_id=obs.user_id,
            campaign_id=obs.campaign_id,
            action_id=obs.action_id,
            created_at=obs.created_at,
            admin_name=f"{admin.first_name} {admin.last_name}" if admin else None,
            action_name=action_names.get(obs.action_id, "Desconocido")
        ))
    
    return result

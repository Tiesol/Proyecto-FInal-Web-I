from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.category import Category
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

@router.get("/users", response_model=List[dict])
async def get_admin_users(
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

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

    from app.core.security import get_password_hash

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
        is_active=True,
        role_id=1,
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

@router.get("/campaigns", response_model=List[CampaignAdminResponse])
async def get_all_campaigns(
    workflow_state_id: int = None,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    statement = select(Campaign)

    if workflow_state_id:
        statement = statement.where(Campaign.workflow_state_id == workflow_state_id)
    else:
        statement = statement.where(Campaign.workflow_state_id != 1)

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

@router.get("/campaigns/{campaign_id}")
async def get_campaign_detail(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    user = session.get(Person, campaign.user_id)
    category = session.get(Category, campaign.category_id) if campaign.category_id else None

    workflow_states = {
        1: "Borrador",
        2: "En Revisión",
        3: "Observado",
        4: "Rechazado",
        5: "Publicado"
    }

    return {
        "id": campaign.id,
        "tittle": campaign.tittle,
        "description": campaign.description,
        "goal_amount": float(campaign.goal_amount),
        "current_amount": float(campaign.current_amount),
        "expiration_date": str(campaign.expiration_date) if campaign.expiration_date else None,
        "main_image_url": campaign.main_image_url,
        "rich_text": campaign.rich_text,
        "workflow_state_id": campaign.workflow_state_id,
        "workflow_state_name": workflow_states.get(campaign.workflow_state_id, "Desconocido"),
        "campaign_state_id": campaign.campaign_state_id,
        "category_id": campaign.category_id,
        "category_name": category.name if category else None,
        "user_id": campaign.user_id,
        "user_name": f"{user.first_name} {user.last_name}" if user else "Usuario desconocido",
        "user_email": user.email if user else "",
        "created_at": campaign.created_at
    }

@router.post("/campaigns/{campaign_id}/approve")
async def approve_campaign(
    campaign_id: int,
    action_data: ApprovalAction = ApprovalAction(),
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campaign.workflow_state_id not in [2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes aprobar campañas en estado 'En Revisión' u 'Observado'"
        )

    observation = CampaignObservation(
        observation_text=action_data.observation_text or "Campaña aprobada",
        user_id=current_user.id,
        campaign_id=campaign_id,
        created_at=datetime.utcnow()
    )
    session.add(observation)

    campaign.workflow_state_id = 5
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

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campaign.workflow_state_id != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes observar campañas en estado 'En Revisión'"
        )

    if not action_data.observation_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes proporcionar un texto de observación"
        )

    observation = CampaignObservation(
        observation_text=action_data.observation_text,
        user_id=current_user.id,
        campaign_id=campaign_id,
        created_at=datetime.utcnow()
    )
    session.add(observation)

    campaign.workflow_state_id = 3
    campaign.updated_at = datetime.utcnow()

    session.add(campaign)
    session.commit()

    return {"message": "Campaña observada exitosamente"}

@router.post("/campaigns/{campaign_id}/reject")
async def reject_campaign(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    campaign = session.get(Campaign, campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campaign.workflow_state_id not in [2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes rechazar campañas en estado 'En Revisión' u 'Observado'"
        )

    campaign.workflow_state_id = 4
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

    statement = select(CampaignObservation).where(
        CampaignObservation.campaign_id == campaign_id
    ).order_by(CampaignObservation.created_at.desc())

    observations = session.exec(statement).all()

    result = []
    for obs in observations:
        admin = session.get(Person, obs.user_id) if obs.user_id else None
        result.append(CampaignObservationResponse(
            id=obs.id,
            observation_text=obs.observation_text,
            user_id=obs.user_id,
            campaign_id=obs.campaign_id,
            created_at=obs.created_at,
            admin_name=f"{admin.first_name} {admin.last_name}" if admin else None
        ))

    return result

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_session
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.category_requirement import CategoryRequirement
from app.models.campaign_requirement_response import (
    CampaignRequirementResponse, 
    RequirementResponseCreate
)
from app.models.requirement_type import RequirementType

router = APIRouter(prefix="/requirements", tags=["Requisitos"])


# Schema para crear/editar requisito
class RequirementCreate(BaseModel):
    name: str
    description: Optional[str] = None
    requirement_type_id: int = 1
    is_required: bool = False
    category_id: int


# Schema para respuesta de requisito con tipo
class RequirementWithType:
    def __init__(self, req: CategoryRequirement, type_name: str):
        self.id = req.id
        self.requirement_name = req.requirement_name
        self.description = req.description
        self.is_required = req.is_required
        self.order_index = req.order_index
        self.category_id = req.category_id
        self.type_id = req.requirements_type_id
        self.type_name = type_name


@router.get("/category/{category_id}")
async def get_requirements_by_category(
    category_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene los requisitos de una categoría"""
    
    statement = select(CategoryRequirement).where(
        CategoryRequirement.category_id == category_id
    ).order_by(CategoryRequirement.order_index)
    
    requirements = session.exec(statement).all()
    
    result = []
    for req in requirements:
        # Obtener tipo de requisito
        req_type = session.get(RequirementType, req.requirements_type_id)
        type_name = req_type.name if req_type else "Texto"
        
        result.append({
            "id": req.id,
            "name": req.requirement_name,
            "description": req.description,
            "is_required": req.is_required,
            "order_index": req.order_index,
            "category_id": req.category_id,
            "requirement_type_id": req.requirements_type_id,
            "type_name": type_name
        })
    
    return result


@router.post("")
async def create_requirement(
    data: RequirementCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Crea un nuevo requisito para una categoría"""
    
    # Obtener el mayor order_index
    statement = select(CategoryRequirement).where(
        CategoryRequirement.category_id == data.category_id
    ).order_by(CategoryRequirement.order_index.desc())
    last_req = session.exec(statement).first()
    next_order = (last_req.order_index + 1) if last_req else 1
    
    new_req = CategoryRequirement(
        requirement_name=data.name,
        description=data.description,
        requirements_type_id=data.requirement_type_id,
        is_required=data.is_required,
        category_id=data.category_id,
        order_index=next_order
    )
    
    session.add(new_req)
    session.commit()
    session.refresh(new_req)
    
    return {"message": "Requisito creado", "id": new_req.id}


@router.put("/{requirement_id}")
async def update_requirement(
    requirement_id: int,
    data: RequirementCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Actualiza un requisito"""
    
    req = session.get(CategoryRequirement, requirement_id)
    
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requisito no encontrado"
        )
    
    req.requirement_name = data.name
    req.description = data.description
    req.requirements_type_id = data.requirement_type_id
    req.is_required = data.is_required
    
    session.add(req)
    session.commit()
    
    return {"message": "Requisito actualizado"}


@router.delete("/{requirement_id}")
async def delete_requirement(
    requirement_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):
    """Elimina un requisito"""
    
    req = session.get(CategoryRequirement, requirement_id)
    
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requisito no encontrado"
        )
    
    session.delete(req)
    session.commit()
    
    return {"message": "Requisito eliminado"}


@router.get("/campaign/{campaign_id}")
async def get_campaign_requirement_responses(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Obtiene las respuestas de requisitos de una campaña"""
    
    campaign = session.get(Campaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Solo el dueño o admin puede ver las respuestas
    if campaign.user_id != current_user.id and current_user.role_id != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta información"
        )
    
    statement = select(CampaignRequirementResponse).where(
        CampaignRequirementResponse.campaign_id == campaign_id
    )
    
    responses = session.exec(statement).all()
    
    result = []
    for resp in responses:
        req = session.get(CategoryRequirement, resp.requirement_id)
        result.append({
            "id": resp.id,
            "campaign_id": resp.campaign_id,
            "requirement_id": resp.requirement_id,
            "requirement_name": req.requirement_name if req else None,
            "response_value": resp.response_value,
            "file_url": resp.file_url
        })
    
    return result


@router.post("/campaign/{campaign_id}")
async def save_campaign_requirement_responses(
    campaign_id: int,
    responses: List[RequirementResponseCreate],
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Guarda las respuestas de requisitos de una campaña"""
    
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
    
    # Solo se pueden guardar en estado borrador u observado
    if campaign.workflow_state_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes modificar los requisitos en este estado"
        )
    
    # Eliminar respuestas anteriores
    statement = select(CampaignRequirementResponse).where(
        CampaignRequirementResponse.campaign_id == campaign_id
    )
    existing = session.exec(statement).all()
    for r in existing:
        session.delete(r)
    
    # Guardar nuevas respuestas
    saved = []
    for resp in responses:
        # Verificar que el requisito existe
        req = session.get(CategoryRequirement, resp.requirement_id)
        if not req:
            continue
        
        new_response = CampaignRequirementResponse(
            campaign_id=campaign_id,
            requirement_id=resp.requirement_id,
            response_value=resp.response_value,
            file_url=resp.file_url,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(new_response)
        saved.append(new_response)
    
    session.commit()
    
    return {"message": f"Se guardaron {len(saved)} respuestas de requisitos"}


@router.post("/campaign/{campaign_id}/validate")
async def validate_campaign_requirements(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Valida que todos los requisitos obligatorios estén completados"""
    
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
    
    if not campaign.category_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña debe tener una categoría asignada"
        )
    
    # Obtener requisitos obligatorios de la categoría
    statement = select(CategoryRequirement).where(
        CategoryRequirement.category_id == campaign.category_id,
        CategoryRequirement.is_required == True
    )
    required_reqs = session.exec(statement).all()
    
    # Obtener respuestas de la campaña
    statement = select(CampaignRequirementResponse).where(
        CampaignRequirementResponse.campaign_id == campaign_id
    )
    responses = session.exec(statement).all()
    
    # Crear mapa de respuestas
    response_map = {r.requirement_id: r for r in responses}
    
    # Verificar requisitos faltantes
    missing = []
    for req in required_reqs:
        resp = response_map.get(req.id)
        if not resp or (not resp.response_value and not resp.file_url):
            missing.append({
                "id": req.id,
                "name": req.requirement_name
            })
    
    if missing:
        return {
            "valid": False,
            "missing_requirements": missing
        }
    
    return {
        "valid": True,
        "missing_requirements": []
    }

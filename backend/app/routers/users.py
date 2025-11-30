from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.person import Person, PersonPublic

router = APIRouter(prefix="/users", tags=["Usuarios"])

@router.get("/{user_id}", response_model=PersonPublic)
async def get_user_public(
    user_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene información pública de un usuario"""
    
    user = session.get(Person, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return PersonPublic(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        profile_image_url=user.profile_image_url,
        description=user.description
    )

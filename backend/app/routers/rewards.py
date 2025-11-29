from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_active_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.reward import Reward, RewardCreate, RewardUpdate, RewardResponse

router = APIRouter(prefix="/rewards", tags=["Recompensas"])

@router.get("/campaign/{campaign_id}", response_model=List[RewardResponse])
async def get_campaign_rewards(
    campaign_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene las recompensas de una campaña (público)"""
    
    statement = select(Reward).where(Reward.campaign_id == campaign_id).order_by(Reward.amount)
    rewards = session.exec(statement).all()
    
    return rewards

@router.post("/", response_model=RewardResponse)
async def create_reward(
    reward_data: RewardCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Crea una nueva recompensa para una campaña"""
    
    # Verificar que la campaña existe y pertenece al usuario
    campaign = session.get(Campaign, reward_data.campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear recompensas en esta campaña"
        )
    
    new_reward = Reward(
        tittle=reward_data.tittle,
        description=reward_data.description,
        amount=reward_data.amount,
        stock=reward_data.stock,
        campaign_id=reward_data.campaign_id,
        image_url=reward_data.image_url
    )
    
    session.add(new_reward)
    session.commit()
    session.refresh(new_reward)
    
    return new_reward

@router.put("/{reward_id}", response_model=RewardResponse)
async def update_reward(
    reward_id: int,
    reward_data: RewardUpdate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Actualiza una recompensa"""
    
    reward = session.get(Reward, reward_id)
    
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recompensa no encontrada"
        )
    
    # Verificar que la campaña pertenece al usuario
    campaign = session.get(Campaign, reward.campaign_id)
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar esta recompensa"
        )
    
    if reward_data.tittle is not None:
        reward.tittle = reward_data.tittle
    if reward_data.description is not None:
        reward.description = reward_data.description
    if reward_data.amount is not None:
        reward.amount = reward_data.amount
    if reward_data.stock is not None:
        reward.stock = reward_data.stock
    if reward_data.image_url is not None:
        reward.image_url = reward_data.image_url
    
    session.add(reward)
    session.commit()
    session.refresh(reward)
    
    return reward

@router.delete("/{reward_id}")
async def delete_reward(
    reward_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):
    """Elimina una recompensa"""
    
    reward = session.get(Reward, reward_id)
    
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recompensa no encontrada"
        )
    
    # Verificar que la campaña pertenece al usuario
    campaign = session.get(Campaign, reward.campaign_id)
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta recompensa"
        )
    
    session.delete(reward)
    session.commit()
    
    return {"message": "Recompensa eliminada exitosamente"}

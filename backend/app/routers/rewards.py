from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from decimal import Decimal

from app.core.database import get_session
from app.core.security import get_current_active_user
from app.models.person import Person
from app.models.campaign import Campaign
from app.models.reward import Reward, RewardCreate, RewardUpdate, RewardResponse
from app.models.reward_claim import RewardClaim, RewardClaimCreate, RewardClaimResponse
from app.models.donation import Donation

router = APIRouter(prefix="/rewards", tags=["Recompensas"])

@router.get("/campaign/{campaign_id}", response_model=List[RewardResponse])
async def get_campaign_rewards(
    campaign_id: int,
    session: Session = Depends(get_session)
):

    statement = select(Reward).where(Reward.campaign_id == campaign_id).order_by(Reward.amount)
    rewards = session.exec(statement).all()

    return rewards

@router.post("/", response_model=RewardResponse)
async def create_reward(
    reward_data: RewardCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

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

    reward = session.get(Reward, reward_id)

    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recompensa no encontrada"
        )

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

    reward = session.get(Reward, reward_id)

    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recompensa no encontrada"
        )

    campaign = session.get(Campaign, reward.campaign_id)
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta recompensa"
        )

    session.delete(reward)
    session.commit()

    return {"message": "Recompensa eliminada exitosamente"}

@router.get("/campaign/{campaign_id}/my-total")
async def get_my_campaign_total(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    statement = select(func.sum(Donation.amount)).where(
        Donation.campaign_id == campaign_id,
        Donation.user_id == current_user.id,
        Donation.donation_state_id == 2
    )
    total = session.exec(statement).first()

    return {
        "campaign_id": campaign_id,
        "user_id": current_user.id,
        "total_donated": float(total) if total else 0
    }

@router.get("/campaign/{campaign_id}/my-claims")
async def get_my_claims(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    statement = select(RewardClaim).where(
        RewardClaim.campaign_id == campaign_id,
        RewardClaim.user_id == current_user.id
    )
    claims = session.exec(statement).all()

    return [claim.reward_id for claim in claims]

@router.post("/claim", response_model=RewardClaimResponse)
async def claim_reward(
    claim_data: RewardClaimCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    reward = session.get(Reward, claim_data.reward_id)
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recompensa no encontrada"
        )

    if reward.campaign_id != claim_data.campaign_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La recompensa no pertenece a esta campaña"
        )

    existing_claim = session.exec(
        select(RewardClaim).where(
            RewardClaim.user_id == current_user.id,
            RewardClaim.reward_id == claim_data.reward_id
        )
    ).first()

    if existing_claim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has reclamado esta recompensa"
        )

    total_donated = session.exec(
        select(func.sum(Donation.amount)).where(
            Donation.campaign_id == claim_data.campaign_id,
            Donation.user_id == current_user.id,
            Donation.donation_state_id == 2
        )
    ).first() or Decimal(0)

    if total_donated < reward.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Necesitas donar ${float(reward.amount):.2f} para reclamar esta recompensa. Has donado ${float(total_donated):.2f}"
        )

    if reward.stock is not None and reward.stock <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta recompensa ya no está disponible"
        )

    new_claim = RewardClaim(
        user_id=current_user.id,
        reward_id=claim_data.reward_id,
        campaign_id=claim_data.campaign_id
    )

    session.add(new_claim)

    if reward.stock is not None:
        reward.stock -= 1
        session.add(reward)

    session.commit()
    session.refresh(new_claim)

    campaign = session.get(Campaign, claim_data.campaign_id)

    return RewardClaimResponse(
        id=new_claim.id,
        user_id=new_claim.user_id,
        reward_id=new_claim.reward_id,
        campaign_id=new_claim.campaign_id,
        claimed_at=new_claim.claimed_at,
        reward_title=reward.tittle,
        campaign_title=campaign.tittle if campaign else None
    )

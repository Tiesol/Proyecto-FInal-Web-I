from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.core.database import get_session
from app.core.security import get_current_active_user
from app.models.person import Person
from app.models.campaign import Campaign, CampaignPublic
from app.models.favorite import Favorite, FavoriteCreate, FavoriteResponse
from app.models.category import Category

router = APIRouter(prefix="/favorites", tags=["Favoritos"])

@router.post("/", response_model=FavoriteResponse)
async def add_favorite(
    favorite_data: FavoriteCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    campaign = session.get(Campaign, favorite_data.campaign_id)

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    statement = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.campaign_id == favorite_data.campaign_id
    )
    existing = session.exec(statement).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña ya está en tus favoritos"
        )

    new_favorite = Favorite(
        user_id=current_user.id,
        campaign_id=favorite_data.campaign_id,
        created_at=datetime.utcnow()
    )

    session.add(new_favorite)

    campaign.favorites_counting += 1
    session.add(campaign)

    session.commit()
    session.refresh(new_favorite)

    return FavoriteResponse(
        id=new_favorite.id,
        user_id=new_favorite.user_id,
        campaign_id=new_favorite.campaign_id,
        created_at=new_favorite.created_at
    )

@router.delete("/{campaign_id}")
async def remove_favorite(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    statement = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.campaign_id == campaign_id
    )
    favorite = session.exec(statement).first()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La campaña no está en tus favoritos"
        )

    campaign = session.get(Campaign, campaign_id)
    if campaign and campaign.favorites_counting > 0:
        campaign.favorites_counting -= 1
        session.add(campaign)

    session.delete(favorite)
    session.commit()

    return {"message": "Campaña eliminada de favoritos"}

@router.get("/", response_model=List[CampaignPublic])
async def get_my_favorites(
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    statement = select(Favorite).where(Favorite.user_id == current_user.id)
    favorites = session.exec(statement).all()

    result = []
    for favorite in favorites:
        campaign = session.get(Campaign, favorite.campaign_id)
        if campaign:
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

@router.get("/check/{campaign_id}")
async def check_favorite(
    campaign_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_active_user)
):

    statement = select(Favorite).where(
        Favorite.user_id == current_user.id,
        Favorite.campaign_id == campaign_id
    )
    favorite = session.exec(statement).first()

    return {"is_favorite": favorite is not None}

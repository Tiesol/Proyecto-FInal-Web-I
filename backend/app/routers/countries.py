from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.country import Country

router = APIRouter(prefix="/countries", tags=["Países"])

@router.get("/", response_model=List[dict])
async def get_countries(
    session: Session = Depends(get_session)
):

    statement = select(Country).order_by(Country.name)
    countries = session.exec(statement).all()

    return [
        {
            "id": country.id,
            "name": country.name,
            "code": country.code
        }
        for country in countries
    ]

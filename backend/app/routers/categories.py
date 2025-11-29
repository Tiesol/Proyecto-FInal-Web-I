from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.category import Category, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categorías"])

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    session: Session = Depends(get_session)
):
    """Obtiene todas las categorías"""
    
    statement = select(Category)
    categories = session.exec(statement).all()
    
    return [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            image_url=cat.image_url
        )
        for cat in categories
    ]

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    session: Session = Depends(get_session)
):
    """Obtiene una categoría por ID"""
    
    category = session.get(Category, category_id)
    
    if not category:
        return None
    
    return CategoryResponse(
        id=category.id,
        name=category.name,
        image_url=category.image_url
    )

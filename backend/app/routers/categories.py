from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from pydantic import BaseModel

from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.category import Category, CategoryResponse
from app.models.category_requirement import CategoryRequirement
from app.models.person import Person

router = APIRouter(prefix="/categories", tags=["Categorías"])

class CategoryCreate(BaseModel):
    name: str
    image_url: str = None

class CategoryUpdate(BaseModel):
    name: str = None
    image_url: str = None

@router.get("/")
async def get_categories(
    session: Session = Depends(get_session)
):

    statement = select(Category)
    categories = session.exec(statement).all()

    result = []
    for cat in categories:
        count_stmt = select(func.count(CategoryRequirement.id)).where(
            CategoryRequirement.category_id == cat.id
        )
        req_count = session.exec(count_stmt).one()

        result.append({
            "id": cat.id,
            "name": cat.name,
            "image_url": cat.image_url,
            "requirements_count": req_count
        })

    return result

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    session: Session = Depends(get_session)
):

    category = session.get(Category, category_id)

    if not category:
        return None

    return CategoryResponse(
        id=category.id,
        name=category.name,
        image_url=category.image_url
    )

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    statement = select(Category).where(Category.name == category_data.name)
    existing = session.exec(statement).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con ese nombre"
        )

    new_category = Category(
        name=category_data.name,
        image_url=category_data.image_url
    )

    session.add(new_category)
    session.commit()
    session.refresh(new_category)

    return CategoryResponse(
        id=new_category.id,
        name=new_category.name,
        image_url=new_category.image_url
    )

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    category = session.get(Category, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )

    if category_data.name is not None:
        category.name = category_data.name
    if category_data.image_url is not None:
        category.image_url = category_data.image_url

    session.add(category)
    session.commit()
    session.refresh(category)

    return CategoryResponse(
        id=category.id,
        name=category.name,
        image_url=category.image_url
    )

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: Person = Depends(get_current_admin_user)
):

    category = session.get(Category, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada"
        )

    from app.models.campaign import Campaign
    statement = select(Campaign).where(Campaign.category_id == category_id)
    campaigns_using = session.exec(statement).first()

    if campaigns_using:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar: hay campañas usando esta categoría"
        )

    session.delete(category)
    session.commit()

    return {"message": "Categoría eliminada exitosamente"}

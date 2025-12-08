from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.payment_method import PaymentMethod

router = APIRouter(prefix="/payment-methods", tags=["Métodos de Pago"])

@router.get("/", response_model=List[dict])
async def get_payment_methods(
    session: Session = Depends(get_session)
):

    statement = select(PaymentMethod)
    methods = session.exec(statement).all()

    return [
        {
            "id": method.id,
            "name": method.name
        }
        for method in methods
    ]

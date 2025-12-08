from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.donation import Donation

class PaymentMethod(SQLModel, table=True):
    __tablename__ = "payment_method"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)

    donations: List["Donation"] = Relationship(back_populates="payment_method")


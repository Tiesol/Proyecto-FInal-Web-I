from typing import Optional, TYPE_CHECKING
from datetime import datetime
from decimal import Decimal
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.campaign import Campaign

class Reward(SQLModel, table=True):
    __tablename__ = "reward"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tittle: str = Field(max_length=100)
    description: Optional[str] = None
    amount: Decimal = Field(decimal_places=2)
    stock: Optional[int] = None
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    image_url: Optional[str] = Field(default=None, max_length=500)
    created_ad: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    campaign: Optional["Campaign"] = Relationship(back_populates="rewards")

class RewardCreate(SQLModel):
    tittle: str
    description: Optional[str] = None
    amount: Decimal
    stock: Optional[int] = None
    campaign_id: int
    image_url: Optional[str] = None

class RewardUpdate(SQLModel):
    tittle: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None

class RewardResponse(SQLModel):
    id: int
    tittle: str
    description: Optional[str] = None
    amount: Decimal
    stock: Optional[int] = None
    campaign_id: Optional[int] = None
    image_url: Optional[str] = None
    created_ad: Optional[datetime] = None

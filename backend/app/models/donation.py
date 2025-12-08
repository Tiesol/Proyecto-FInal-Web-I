from typing import Optional, TYPE_CHECKING
from datetime import datetime
from decimal import Decimal
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.person import Person
    from app.models.campaign import Campaign
    from app.models.donation_state import DonationState
    from app.models.payment_method import PaymentMethod

class Donation(SQLModel, table=True):
    __tablename__ = "donation"

    id: Optional[int] = Field(default=None, primary_key=True)
    amount: Decimal = Field(decimal_places=2)
    donation_state_id: Optional[int] = Field(default=1, foreign_key="donation_state.id")
    user_id: Optional[int] = Field(default=None, foreign_key="person.id")
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    payment_method_id: Optional[int] = Field(default=None, foreign_key="payment_method.id")
    gateway_payment_id: Optional[str] = Field(default=None, max_length=100)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    user: Optional["Person"] = Relationship(back_populates="donations")
    campaign: Optional["Campaign"] = Relationship(back_populates="donations")
    donation_state: Optional["DonationState"] = Relationship(back_populates="donations")
    payment_method: Optional["PaymentMethod"] = Relationship(back_populates="donations")

class DonationCreate(SQLModel):
    amount: Decimal
    campaign_id: int
    payment_method_id: int

class DonationResponse(SQLModel):
    id: int
    amount: Decimal
    donation_state_id: Optional[int] = None
    user_id: Optional[int] = None
    campaign_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    gateway_payment_id: Optional[str] = None
    created_at: Optional[datetime] = None
    user_name: Optional[str] = None
    campaign_title: Optional[str] = None
    payment_url: Optional[str] = None

class MyDonationResponse(SQLModel):

    id: int
    amount: Decimal
    donation_state_id: Optional[int] = None
    donation_state_name: Optional[str] = None
    created_at: Optional[datetime] = None
    campaign_id: Optional[int] = None
    campaign_title: Optional[str] = None
    campaign_image: Optional[str] = None
    campaign_goal: Optional[Decimal] = None
    campaign_current: Optional[Decimal] = None
    campaign_expiration: Optional[datetime] = None
    campaign_category: Optional[str] = None
    creator_name: Optional[str] = None


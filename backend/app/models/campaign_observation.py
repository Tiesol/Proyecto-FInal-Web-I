from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.person import Person
    from app.models.campaign import Campaign

class CampaignObservation(SQLModel, table=True):
    __tablename__ = "campaign_observations"

    id: Optional[int] = Field(default=None, primary_key=True)
    observation_text: Optional[str] = None
    user_id: Optional[int] = Field(default=None, foreign_key="person.id")
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    user: Optional["Person"] = Relationship(back_populates="observations")
    campaign: Optional["Campaign"] = Relationship(back_populates="observations")

class CampaignObservationCreate(SQLModel):
    observation_text: str
    campaign_id: int

class CampaignObservationResponse(SQLModel):
    id: int
    observation_text: Optional[str] = None
    user_id: Optional[int] = None
    campaign_id: Optional[int] = None
    created_at: Optional[datetime] = None
    admin_name: Optional[str] = None

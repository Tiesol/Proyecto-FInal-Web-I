from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.campaign import Campaign

class CampaignState(SQLModel, table=True):
    __tablename__ = "campaign_state"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50)

    campaigns: List["Campaign"] = Relationship(back_populates="campaign_state")


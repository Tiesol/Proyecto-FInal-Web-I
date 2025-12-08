from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.person import Person
    from app.models.reward import Reward
    from app.models.campaign import Campaign

class RewardClaim(SQLModel, table=True):
    __tablename__ = "reward_claim"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="person.id")
    reward_id: int = Field(foreign_key="reward.id")
    campaign_id: int = Field(foreign_key="campaign.id")
    claimed_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class RewardClaimCreate(SQLModel):
    reward_id: int
    campaign_id: int

class RewardClaimResponse(SQLModel):
    id: int
    user_id: int
    reward_id: int
    campaign_id: int
    claimed_at: Optional[datetime] = None
    reward_title: Optional[str] = None
    campaign_title: Optional[str] = None

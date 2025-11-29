from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.campaign import Campaign
    from app.models.category_requirement import CategoryRequirement

class CampaignRequirementResponse(SQLModel, table=True):
    __tablename__ = "campaign_requirement_response"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    requirement_id: Optional[int] = Field(default=None, foreign_key="category_requirements.id")
    response_value: Optional[str] = None
    file_url: Optional[str] = Field(default=None, max_length=500)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    campaign: Optional["Campaign"] = Relationship(back_populates="requirement_responses")
    requirement: Optional["CategoryRequirement"] = Relationship(back_populates="responses")

class RequirementResponseCreate(SQLModel):
    requirement_id: int
    response_value: Optional[str] = None
    file_url: Optional[str] = None

class RequirementResponseUpdate(SQLModel):
    response_value: Optional[str] = None
    file_url: Optional[str] = None

from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime
from decimal import Decimal
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.person import Person
    from app.models.category import Category
    from app.models.workflow_state import WorkflowState
    from app.models.campaign_state import CampaignState
    from app.models.campaign_observation import CampaignObservation
    from app.models.favorite import Favorite
    from app.models.donation import Donation
    from app.models.reward import Reward
    from app.models.campaign_requirement_response import CampaignRequirementResponse

class CampaignBase(SQLModel):
    tittle: str = Field(max_length=200)
    description: str = Field(max_length=200)
    goal_amount: Decimal = Field(default=0, decimal_places=2)
    expiration_date: Optional[date] = None
    main_image_url: Optional[str] = Field(default=None, max_length=255)
    rich_text: Optional[str] = None

class Campaign(CampaignBase, table=True):
    __tablename__ = "campaign"

    id: Optional[int] = Field(default=None, primary_key=True)
    current_amount: Decimal = Field(default=0, decimal_places=2)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    view_counting: int = Field(default=0)
    favorites_counting: int = Field(default=0)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    workflow_state_id: int = Field(default=1, foreign_key="workflow_state.id")
    campaign_state_id: int = Field(default=1, foreign_key="campaign_state.id")
    user_id: int = Field(foreign_key="person.id")
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")

    user: Optional["Person"] = Relationship(back_populates="campaigns")
    category: Optional["Category"] = Relationship(back_populates="campaigns")
    workflow_state: Optional["WorkflowState"] = Relationship(back_populates="campaigns")
    campaign_state: Optional["CampaignState"] = Relationship(back_populates="campaigns")
    observations: List["CampaignObservation"] = Relationship(back_populates="campaign")
    favorites: List["Favorite"] = Relationship(back_populates="campaign")
    donations: List["Donation"] = Relationship(back_populates="campaign")
    rewards: List["Reward"] = Relationship(back_populates="campaign")
    requirement_responses: List["CampaignRequirementResponse"] = Relationship(back_populates="campaign")

class CampaignCreate(SQLModel):
    tittle: str
    description: str
    goal_amount: Decimal
    expiration_date: Optional[date] = None
    main_image_url: Optional[str] = None
    rich_text: Optional[str] = None
    category_id: Optional[int] = None

class CampaignUpdate(SQLModel):
    tittle: Optional[str] = None
    description: Optional[str] = None
    goal_amount: Optional[Decimal] = None
    expiration_date: Optional[date] = None
    main_image_url: Optional[str] = None
    rich_text: Optional[str] = None
    category_id: Optional[int] = None

class CampaignResponse(SQLModel):
    id: int
    tittle: str
    description: str
    goal_amount: Decimal
    current_amount: Decimal
    expiration_date: Optional[date] = None
    main_image_url: Optional[str] = None
    rich_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    view_counting: int
    favorites_counting: int
    workflow_state_id: int
    campaign_state_id: int
    user_id: int
    category_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CampaignPublic(SQLModel):

    id: int
    tittle: str
    description: str
    goal_amount: Decimal
    current_amount: Decimal
    expiration_date: Optional[date] = None
    main_image_url: Optional[str] = None
    view_counting: int
    favorites_counting: int
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None
    user_profile_image_url: Optional[str] = None
    category_name: Optional[str] = None
    progress_percentage: float = 0.0

class CampaignDetailPublic(SQLModel):

    id: int
    tittle: str
    description: str
    goal_amount: Decimal
    current_amount: Decimal
    expiration_date: Optional[date] = None
    main_image_url: Optional[str] = None
    rich_text: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    view_counting: int
    favorites_counting: int
    workflow_state_id: Optional[int] = None
    campaign_state_id: Optional[int] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    user_id: int
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None
    user_profile_image_url: Optional[str] = None
    progress_percentage: float = 0.0

class CampaignPaginatedResponse(SQLModel):

    items: List[CampaignPublic]
    total: int
    page: int
    page_size: int
    total_pages: int

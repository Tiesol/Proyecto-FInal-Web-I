from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.country import Country
    from app.models.role import Role
    from app.models.campaign import Campaign
    from app.models.campaign_observation import CampaignObservation
    from app.models.favorite import Favorite
    from app.models.donation import Donation

class PersonBase(SQLModel):
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: str = Field(max_length=100, unique=True, index=True)
    profile_image_url: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=200)
    birthday_date: Optional[date] = None
    country_id: Optional[int] = Field(default=None, foreign_key="country.id")

class Person(PersonBase, table=True):
    __tablename__ = "person"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    password: str = Field(max_length=100)
    is_active: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    role_id: Optional[int] = Field(default=2, foreign_key="role.id")  # Default: Usuario normal
    
    # Relationships
    country: Optional["Country"] = Relationship(back_populates="persons")
    role: Optional["Role"] = Relationship(back_populates="persons")
    campaigns: List["Campaign"] = Relationship(back_populates="user")
    observations: List["CampaignObservation"] = Relationship(back_populates="user")
    favorites: List["Favorite"] = Relationship(back_populates="user")
    donations: List["Donation"] = Relationship(back_populates="user")

class PersonCreate(SQLModel):
    first_name: str
    last_name: str
    email: str
    password: str
    country_id: Optional[int] = None

class PersonUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    description: Optional[str] = None
    birthday_date: Optional[date] = None
    country_id: Optional[int] = None

class PersonResponse(SQLModel):
    id: int
    first_name: str
    last_name: str
    email: str
    profile_image_url: Optional[str] = None
    description: Optional[str] = None
    birthday_date: Optional[date] = None
    is_active: bool
    country_id: Optional[int] = None
    role_id: Optional[int] = None
    created_at: Optional[datetime] = None

class PersonPublic(SQLModel):
    id: int
    first_name: str
    last_name: str
    profile_image_url: Optional[str] = None
    description: Optional[str] = None

from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.person import Person
    from app.models.campaign import Campaign

class Favorite(SQLModel, table=True):
    __tablename__ = "favorite"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="person.id")
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaign.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional["Person"] = Relationship(back_populates="favorites")
    campaign: Optional["Campaign"] = Relationship(back_populates="favorites")

class FavoriteCreate(SQLModel):
    campaign_id: int

class FavoriteResponse(SQLModel):
    id: int
    user_id: int
    campaign_id: int
    created_at: Optional[datetime] = None

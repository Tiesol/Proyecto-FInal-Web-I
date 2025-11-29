from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.campaign import Campaign
    from app.models.category_requirement import CategoryRequirement

class Category(SQLModel, table=True):
    __tablename__ = "category"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    image_url: Optional[str] = Field(default=None, max_length=255)
    
    # Relationships
    campaigns: List["Campaign"] = Relationship(back_populates="category")

class CategoryResponse(SQLModel):
    id: int
    name: str
    image_url: Optional[str] = None

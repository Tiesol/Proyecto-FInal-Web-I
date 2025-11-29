from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.person import Person

class Country(SQLModel, table=True):
    __tablename__ = "country"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    code: str = Field(max_length=100)
    
    # Relationships
    persons: List["Person"] = Relationship(back_populates="country")

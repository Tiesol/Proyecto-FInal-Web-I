from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.category_requirement import CategoryRequirement

class RequirementType(SQLModel, table=True):
    __tablename__ = "requeriment_type"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    
    # Relationships
    requirements: List["CategoryRequirement"] = Relationship(back_populates="requirement_type")

from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.requirement_type import RequirementType
    from app.models.campaign_requirement_response import CampaignRequirementResponse

class CategoryRequirement(SQLModel, table=True):
    __tablename__ = "category_requirements"

    id: Optional[int] = Field(default=None, primary_key=True)
    requirement_name: str = Field(max_length=255)
    is_required: bool = Field(default=True)
    description: Optional[str] = Field(default=None, max_length=255)
    order_index: Optional[int] = None
    requirements_type_id: Optional[int] = Field(default=None, foreign_key="requeriment_type.id")
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")

    requirement_type: Optional["RequirementType"] = Relationship(back_populates="requirements")
    responses: List["CampaignRequirementResponse"] = Relationship(back_populates="requirement")

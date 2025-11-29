from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.campaign import Campaign

class CampaignState(SQLModel, table=True):
    __tablename__ = "campaign_state"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50)
    
    # Relationships
    campaigns: List["Campaign"] = Relationship(back_populates="campaign_state")

# Estados de campaña:
# 1 - No Iniciada
# 2 - En Progreso
# 3 - En Pausa
# 4 - Finalizada

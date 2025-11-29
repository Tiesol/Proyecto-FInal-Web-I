from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.campaign_observation import CampaignObservation

class ObservationAction(SQLModel, table=True):
    __tablename__ = "observation_action"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    
    # Relationships
    observations: List["CampaignObservation"] = Relationship(back_populates="action")

# Acciones de observación:
# 1 - Observado
# 2 - Rechazado
# 3 - Aprobado

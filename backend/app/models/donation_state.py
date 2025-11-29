from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.donation import Donation

class DonationState(SQLModel, table=True):
    __tablename__ = "donation_state"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    
    # Relationships
    donations: List["Donation"] = Relationship(back_populates="donation_state")

# Estados de donación:
# 1 - Pendiente
# 2 - Completada
# 3 - Cancelada
# 4 - Reembolsada

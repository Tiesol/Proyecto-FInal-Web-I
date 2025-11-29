# Models module - Importar todos los modelos para que SQLModel registre las relaciones
from app.models.role import Role
from app.models.country import Country
from app.models.person import Person, PersonBase, PersonCreate, PersonUpdate, PersonResponse, PersonPublic
from app.models.category import Category
from app.models.requirement_type import RequirementType
from app.models.category_requirement import CategoryRequirement
from app.models.campaign_state import CampaignState
from app.models.workflow_state import WorkflowState
from app.models.observation_action import ObservationAction
from app.models.campaign import Campaign, CampaignCreate, CampaignUpdate, CampaignResponse
from app.models.campaign_observation import CampaignObservation
from app.models.campaign_requirement_response import CampaignRequirementResponse
from app.models.favorite import Favorite
from app.models.donation_state import DonationState
from app.models.payment_method import PaymentMethod
from app.models.donation import Donation, DonationCreate, DonationResponse
from app.models.reward import Reward, RewardCreate, RewardUpdate, RewardResponse

__all__ = [
    "Role",
    "Country", 
    "Person", "PersonBase", "PersonCreate", "PersonUpdate", "PersonResponse", "PersonPublic",
    "Category",
    "RequirementType",
    "CategoryRequirement",
    "CampaignState",
    "WorkflowState",
    "ObservationAction",
    "Campaign", "CampaignCreate", "CampaignUpdate", "CampaignResponse",
    "CampaignObservation",
    "CampaignRequirementResponse",
    "Favorite",
    "DonationState",
    "PaymentMethod",
    "Donation", "DonationCreate", "DonationResponse",
    "Reward", "RewardCreate", "RewardUpdate", "RewardResponse",
]

"""
Script para inicializar la base de datos con datos necesarios.
Ejecutar después de que la base de datos esté creada.
"""

from sqlmodel import Session, select
from app.core.database import engine
from app.models.country import Country
from app.models.role import Role
from app.models.category import Category
from app.models.requirement_type import RequirementType
from app.models.workflow_state import WorkflowState
from app.models.campaign_state import CampaignState
from app.models.donation_state import DonationState
from app.models.payment_method import PaymentMethod
from app.models.person import Person
from app.core.security import get_password_hash

def init_roles():
    """Inicializa los roles del sistema"""
    roles = [
        Role(id=1, name="Administrador"),
        Role(id=2, name="Usuario")
    ]
    return roles

def init_countries():
    """Inicializa la lista de países"""
    countries = [
        Country(name="Argentina", code="AR"),
        Country(name="Bolivia", code="BO"),
        Country(name="Brasil", code="BR"),
        Country(name="Chile", code="CL"),
        Country(name="Colombia", code="CO"),
        Country(name="Costa Rica", code="CR"),
        Country(name="Cuba", code="CU"),
        Country(name="Ecuador", code="EC"),
        Country(name="El Salvador", code="SV"),
        Country(name="España", code="ES"),
        Country(name="Estados Unidos", code="US"),
        Country(name="Guatemala", code="GT"),
        Country(name="Honduras", code="HN"),
        Country(name="México", code="MX"),
        Country(name="Nicaragua", code="NI"),
        Country(name="Panamá", code="PA"),
        Country(name="Paraguay", code="PY"),
        Country(name="Perú", code="PE"),
        Country(name="Puerto Rico", code="PR"),
        Country(name="República Dominicana", code="DO"),
        Country(name="Uruguay", code="UY"),
        Country(name="Venezuela", code="VE"),
    ]
    return countries

def init_categories():
    """Inicializa las categorías de proyectos"""
    categories = [
        Category(name="Tecnología", image_url="/assets/images/categories/tech.jpg"),
        Category(name="Arte", image_url="/assets/images/categories/art.jpg"),
        Category(name="Música", image_url="/assets/images/categories/music.jpg"),
        Category(name="Cine y Video", image_url="/assets/images/categories/film.jpg"),
        Category(name="Juegos", image_url="/assets/images/categories/games.jpg"),
        Category(name="Diseño", image_url="/assets/images/categories/design.jpg"),
        Category(name="Fotografía", image_url="/assets/images/categories/photo.jpg"),
        Category(name="Moda", image_url="/assets/images/categories/fashion.jpg"),
        Category(name="Comida", image_url="/assets/images/categories/food.jpg"),
        Category(name="Causas Sociales", image_url="/assets/images/categories/social.jpg"),
        Category(name="Educación", image_url="/assets/images/categories/education.jpg"),
        Category(name="Medio Ambiente", image_url="/assets/images/categories/environment.jpg"),
    ]
    return categories

def init_requirement_types():
    """Inicializa los tipos de requisitos"""
    types = [
        RequirementType(id=1, name="Texto"),
        RequirementType(id=2, name="Archivo"),
        RequirementType(id=3, name="Imagen"),
        RequirementType(id=4, name="URL"),
    ]
    return types

def init_workflow_states():
    """Inicializa los estados de workflow/aprobación"""
    states = [
        WorkflowState(id=1, name="Borrador"),
        WorkflowState(id=2, name="En Revisión"),
        WorkflowState(id=3, name="Observado"),
        WorkflowState(id=4, name="Rechazado"),
        WorkflowState(id=5, name="Publicado"),
    ]
    return states

def init_campaign_states():
    """Inicializa los estados de campaña de recaudación"""
    states = [
        CampaignState(id=1, name="No Iniciada"),
        CampaignState(id=2, name="En Progreso"),
        CampaignState(id=3, name="En Pausa"),
        CampaignState(id=4, name="Finalizada"),
    ]
    return states

def init_donation_states():
    """Inicializa los estados de donación"""
    states = [
        DonationState(id=1, name="Pendiente"),
        DonationState(id=2, name="Completada"),
        DonationState(id=3, name="Cancelada"),
        DonationState(id=4, name="Reembolsada"),
    ]
    return states

def init_payment_methods():
    """Inicializa los métodos de pago"""
    methods = [
        PaymentMethod(id=1, name="Tarjeta de Crédito"),
        PaymentMethod(id=2, name="Tarjeta de Débito"),
        PaymentMethod(id=3, name="PayPal"),
        PaymentMethod(id=4, name="Transferencia Bancaria"),
    ]
    return methods

def create_admin_user():
    """Crea un usuario administrador por defecto"""
    admin = Person(
        first_name="Admin",
        last_name="RiseUp",
        email="admin@riseup.com",
        password=get_password_hash("admin123"),
        is_active=True,
        role_id=1
    )
    return admin

def init_database():
    """Inicializa la base de datos con todos los datos necesarios"""
    with Session(engine) as session:
        # Verificar si ya hay datos
        existing_roles = session.exec(select(Role)).first()
        if existing_roles:
            print("La base de datos ya está inicializada.")
            return
        
        print("Inicializando base de datos...")
        
        # Insertar roles
        for role in init_roles():
            session.add(role)
        print("✓ Roles creados")
        
        # Insertar países
        for country in init_countries():
            session.add(country)
        print("✓ Países creados")
        
        # Insertar categorías
        for category in init_categories():
            session.add(category)
        print("✓ Categorías creadas")
        
        # Insertar tipos de requisitos
        for req_type in init_requirement_types():
            session.add(req_type)
        print("✓ Tipos de requisitos creados")
        
        # Insertar estados de workflow
        for state in init_workflow_states():
            session.add(state)
        print("✓ Estados de workflow creados")
        
        # Insertar estados de campaña
        for state in init_campaign_states():
            session.add(state)
        print("✓ Estados de campaña creados")
        
        # Insertar estados de donación
        for state in init_donation_states():
            session.add(state)
        print("✓ Estados de donación creados")
        
        # Insertar métodos de pago
        for method in init_payment_methods():
            session.add(method)
        print("✓ Métodos de pago creados")
        
        session.commit()
        
        # Crear admin por defecto
        admin = create_admin_user()
        session.add(admin)
        session.commit()
        print("✓ Usuario administrador creado (admin@riseup.com / admin123)")
        
        print("\n¡Base de datos inicializada correctamente!")

if __name__ == "__main__":
    init_database()

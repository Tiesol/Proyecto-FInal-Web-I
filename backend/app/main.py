from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import create_db_and_tables
from app.routers import auth, campaigns, donations, favorites, categories, rewards, countries, payment_methods, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: crear tablas si no existen
    create_db_and_tables()
    yield
    # Shutdown

app = FastAPI(
    title="RiseUp API",
    description="API para la plataforma de crowdfunding RiseUp",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(campaigns.router)
app.include_router(donations.router)
app.include_router(favorites.router)
app.include_router(categories.router)
app.include_router(rewards.router)
app.include_router(countries.router)
app.include_router(payment_methods.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {
        "message": "Bienvenido a RiseUp API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth
from app.core.database import Base, engine
from app.core.config import settings

# Create database tables
from app.models.user import User
from app.models.investigation import Investigation
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1 import auth, dashboard, investigation

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(investigation.router, prefix="/api/v1/investigation", tags=["investigation"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ThreatLens AI API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ThreatLens AI"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./threatlens.db")
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-dev-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    GROQ_API_KEY: str | None = None
    TAVILY_API_KEY: str | None = None
    OCR_LANGUAGE: str | None = "eng"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

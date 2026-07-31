import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ThreatLens AI"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./threatlens.db")
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-dev-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # Increased from 60 to 1440 (24 hours) for development
    
    GROQ_API_KEY: str | None = None
    TAVILY_API_KEY: str | None = None
    OCR_LANGUAGE: str | None = "eng"
    
    # Backup Configuration
    BACKUP_DIR: str = os.getenv("BACKUP_DIR", "./backups")
    BACKUP_CRON_HOUR: int = int(os.getenv("BACKUP_CRON_HOUR", "0"))
    BACKUP_CRON_MINUTE: int = int(os.getenv("BACKUP_CRON_MINUTE", "0"))
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

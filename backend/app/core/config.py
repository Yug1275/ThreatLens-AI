import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    PROJECT_NAME: str = "ThreatLens AI"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./threatlens.db")
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-dev-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # Increased from 60 to 1440 (24 hours) for development
    
    # SMTP Configuration for Email
    SMTP_SERVER: str | None = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str | None = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD")
    
    # Resend API Key for HTTP-based emails
    RESEND_API_KEY: str | None = os.getenv("RESEND_API_KEY")
    
    GROQ_API_KEY: str | None = None
    TAVILY_API_KEY: str | None = None
    OCR_LANGUAGE: str | None = "eng"
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str | None = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str | None = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str | None = os.getenv("CLOUDINARY_API_SECRET")
    
    # AI Intelligence Engine (Phase 9)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq")
    AI_MODEL: str = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
    AI_TIMEOUT: int = int(os.getenv("AI_TIMEOUT", "30"))
    AI_MAX_RETRIES: int = int(os.getenv("AI_MAX_RETRIES", "3"))
    AI_CACHE_TTL: int = int(os.getenv("AI_CACHE_TTL", "3600"))
    AI_ENABLED: bool = os.getenv("AI_ENABLED", "true").lower() == "true"
    AI_LOG_LEVEL: str = os.getenv("AI_LOG_LEVEL", "INFO")
    
    # Backup Configuration
    BACKUP_DIR: str = os.getenv("BACKUP_DIR", "./backups")
    BACKUP_CRON_HOUR: int = int(os.getenv("BACKUP_CRON_HOUR", "0"))
    BACKUP_CRON_MINUTE: int = int(os.getenv("BACKUP_CRON_MINUTE", "0"))

settings = Settings()

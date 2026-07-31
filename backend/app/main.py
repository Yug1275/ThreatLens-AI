from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth
from app.core.database import Base, engine
from app.core.config import settings

# Import all models so Base.metadata.create_all picks them up
from app.models.user import User, Profile
from app.models.investigation import Investigation
from app.models.notification import Notification, NotificationPreference
from app.models.workspace import WorkspaceFolder, SavedSearch
from app.models.security import AuditLog, UserSession

# Create any tables that don't exist yet (safe for existing tables)
Base.metadata.create_all(bind=engine)

# ── Safe schema migrations ───────────────────────────────────────────── #
# These ALTER TABLE statements are idempotent — they only add a column
# if it does not already exist, so they are safe to run on every startup.
def _run_migrations():
    from sqlalchemy import text
    with engine.connect() as conn:
        # Add is_deleted to existing investigations table (Phase 5A)
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='investigations' AND column_name='is_deleted'
                ) THEN
                    ALTER TABLE investigations ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
                END IF;
                
                -- Add folder_id and workflow_status (Phase 6D)
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='investigations' AND column_name='folder_id'
                ) THEN
                    ALTER TABLE investigations ADD COLUMN folder_id VARCHAR REFERENCES workspace_folders(id) ON DELETE SET NULL;
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='investigations' AND column_name='workflow_status'
                ) THEN
                    ALTER TABLE investigations ADD COLUMN workflow_status VARCHAR NOT NULL DEFAULT 'NEW';
                END IF;
            END$$;
        """))
        conn.commit()

# Only run migrations on PostgreSQL (skip for SQLite local fallback)
if not settings.DATABASE_URL.startswith("sqlite"):
    try:
        _run_migrations()
    except Exception as e:
        print(f"[migration] Warning: {e}")

# ── Application setup ────────────────────────────────────────────────── #
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.backup_service import backup_service
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schedule automated backups
    try:
        scheduler.add_job(
            backup_service.create_backup,
            'cron',
            hour=settings.BACKUP_CRON_HOUR,
            minute=settings.BACKUP_CRON_MINUTE,
            kwargs={'is_automated': True}
        )
        scheduler.start()
        logger.info("Backup scheduler started.")
    except Exception as e:
        logger.error(f"Failed to start backup scheduler: {e}")
    yield
    scheduler.shutdown()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)

# ── Middleware ───────────────────────────────────────────────────────── #
from app.core.middleware import APILoggingMiddleware, SecurityHeadersMiddleware, RateLimitMiddleware

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(APILoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1 import auth, dashboard, investigation, ioc, notifications, workspace, security, monitoring, backup

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(investigation.router, prefix="/api/v1/investigation", tags=["investigation"])
app.include_router(ioc.router, prefix="/api/v1/iocs", tags=["ioc"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(workspace.router, prefix="/api/v1/workspace", tags=["workspace"])
app.include_router(security.router, prefix="/api/v1/security", tags=["security"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["monitoring"])
app.include_router(backup.router, prefix="/api/v1/backup", tags=["backup"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ThreatLens AI API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

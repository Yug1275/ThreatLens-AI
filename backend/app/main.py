from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth
from app.core.database import Base, engine
from app.core.config import settings

# Import all models so Base.metadata.create_all picks them up
from app.models.user import User, Profile
from app.models.investigation import Investigation

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
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to the frontend URL
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

from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import hashlib

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User, Profile
from app.schemas.user import (
    UserCreate, UserResponse, ProfileUpdate,
    PasswordReset, ForgotPassword, ProfileResponse
)
from app.schemas.token import Token
from app.repositories.user_repository import user_repository
from app.services.security_service import SecurityService
from app.schemas.security import UserSessionCreate
from fastapi import Request

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = user_repository.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_by_uname = user_repository.get_by_username(db, username=user_in.username)
    if user_by_uname:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = user_repository.create(db, obj_in=user_in)
    return user

@router.post("/login", response_model=Token)
def login_access_token(
    request: Request,
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # OAuth2PasswordRequestForm uses 'username' field for the identifier. We treat it as email here.
    user = user_repository.get_by_email(db, email=form_data.username)
    if not user:
        # Fallback to check if they entered username instead of email
        user = user_repository.get_by_username(db, username=form_data.username)
        
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        user.id, expires_delta=access_token_expires
    )
    
    # Store session
    token_signature = token.split('.')[-1]
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    SecurityService.create_session(db, UserSessionCreate(
        user_id=user.id,
        token_signature=token_signature,
        ip_address=client_ip,
        user_agent=user_agent,
        expires_at=datetime.now(timezone.utc) + access_token_expires
    ))
    
    # Log audit
    from app.services.security_service import log_audit
    log_audit(db, user.id, "LOGIN", "AUTH", None, None, request)
    
    return {
        "access_token": token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    return current_user

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    profile = user_repository.update_profile(db, user_id=current_user.id, obj_in=profile_in)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/forgot-password")
def forgot_password(
    forgot_in: ForgotPassword,
    db: Session = Depends(get_db)
) -> Any:
    user = user_repository.get_by_email(db, email=forgot_in.email)
    if user:
        # Generate password reset token
        # For Phase 2, we simulate sending email.
        # token = generate_password_reset_token(email=user.email)
        # send_reset_password_email(email_to=user.email, email=user.email, token=token)
        print(f"Simulated Email to {user.email}: Password Reset Link. Use Token: SIMULATED_TOKEN_{user.id}")
        
    # Always return 200 to prevent user enumeration
    return {"message": "If an account with that email exists, we sent an email with password reset instructions."}

@router.post("/reset-password")
def reset_password(
    reset_in: PasswordReset,
    db: Session = Depends(get_db)
) -> Any:
    # Simulated validation of SIMULATED_TOKEN_{user.id}
    token = reset_in.token
    if not token.startswith("SIMULATED_TOKEN_"):
        raise HTTPException(status_code=400, detail="Invalid token")
        
    try:
        user_id = int(token.split("_")[-1])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user = user_repository.get(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_repository.update_password(db, user_id=user_id, new_password=reset_in.new_password)
    return {"message": "Password updated successfully"}

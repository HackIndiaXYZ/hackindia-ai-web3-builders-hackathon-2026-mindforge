import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, Workspace, AgentConfig, OTPVerification
from app.schemas.schemas import (
    UserRegisterRequest, RegisterResponse, VerifySignupOtpRequest,
    ForgotPasswordRequest, ResetPasswordRequest, UserLoginRequest,
    UserResponse, AuthTokenResponse, UserProfileResponse
)
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.core.password_policy import validate_strong_password
from app.services.resend_client import send_activation_otp_email, send_password_reset_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

def generate_otp_code() -> str:
    # 6-digit cryptographically secure code
    return str(secrets.randbelow(900000) + 100000)

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()

    # 1. Confirm passwords match if provided
    if payload.confirm_password and payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match. Please re-enter."
        )

    # 2. Enforce strong password policy
    pwd_error = validate_strong_password(payload.password)
    if pwd_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pwd_error
        )

    # 3. Check existing user
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing and existing.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    pwd_hash = hash_password(payload.password)
    user_name = payload.full_name.strip() if payload.full_name else None

    if existing:
        existing.password_hash = pwd_hash
        if user_name:
            existing.full_name = user_name
        existing.is_verified = False
        db.commit()
    else:
        user = User(
            email=clean_email,
            password_hash=pwd_hash,
            full_name=user_name,
            is_verified=False
        )
        db.add(user)
        db.commit()

    # 4. Invalidate older activation OTPs
    db.query(OTPVerification).filter(
        OTPVerification.email == clean_email,
        OTPVerification.purpose == "signup_activation",
        OTPVerification.is_used == False
    ).update({"is_used": True})
    db.commit()

    # 5. Generate and save 6-digit OTP (10 min expiry)
    otp_code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_record = OTPVerification(
        email=clean_email,
        otp_code=otp_code,
        purpose="signup_activation",
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_record)
    db.commit()

    # 6. Dispatch email via Resend
    await send_activation_otp_email(clean_email, otp_code, user_name)

    return RegisterResponse(
        message=f"Verification code sent to {clean_email}. Please enter the 6-digit code to activate your account.",
        email=clean_email,
        requires_otp=True
    )

@router.post("/verify-signup-otp", response_model=AuthTokenResponse)
def verify_signup_otp(payload: VerifySignupOtpRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    clean_otp = payload.otp.strip()

    # Check OTP
    now = datetime.now(timezone.utc)
    otp_entry = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.email == clean_email,
            OTPVerification.purpose == "signup_activation",
            OTPVerification.is_used == False,
            OTPVerification.expires_at > now
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )

    if not otp_entry or otp_entry.otp_code != clean_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new code."
        )

    otp_entry.is_used = True

    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.is_verified = True
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()

    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_verified:
        # Generate fresh activation OTP
        otp_code = generate_otp_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        otp_record = OTPVerification(
            email=clean_email,
            otp_code=otp_code,
            purpose="signup_activation",
            expires_at=expires_at,
            is_used=False
        )
        db.add(otp_record)
        db.commit()
        await send_activation_otp_email(clean_email, otp_code, user.full_name)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not verified yet. A new 6-digit activation code has been sent to your email."
        )

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if user:
        # Invalidate older reset OTPs
        db.query(OTPVerification).filter(
            OTPVerification.email == clean_email,
            OTPVerification.purpose == "password_reset",
            OTPVerification.is_used == False
        ).update({"is_used": True})
        db.commit()

        # Generate new reset OTP
        otp_code = generate_otp_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        otp_record = OTPVerification(
            email=clean_email,
            otp_code=otp_code,
            purpose="password_reset",
            expires_at=expires_at,
            is_used=False
        )
        db.add(otp_record)
        db.commit()

        await send_password_reset_otp_email(clean_email, otp_code, user.full_name)

    return {
        "message": f"If an account exists for {clean_email}, a 6-digit password reset code has been sent to your email.",
        "email": clean_email
    }

@router.post("/reset-password", response_model=AuthTokenResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    clean_otp = payload.otp.strip()

    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match. Please re-enter."
        )

    pwd_error = validate_strong_password(payload.new_password)
    if pwd_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pwd_error
        )

    now = datetime.now(timezone.utc)
    otp_entry = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.email == clean_email,
            OTPVerification.purpose == "password_reset",
            OTPVerification.is_used == False,
            OTPVerification.expires_at > now
        )
        .order_by(OTPVerification.created_at.desc())
        .first()
    )

    if not otp_entry or otp_entry.otp_code != clean_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Please request a new code."
        )

    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    otp_entry.is_used = True
    user.password_hash = hash_password(payload.new_password)
    user.is_verified = True
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspaces = db.query(Workspace).filter(Workspace.user_id == current_user.id).order_by(Workspace.created_at.desc()).all()
    
    workspaces_data = []
    for ws in workspaces:
        agent = db.query(AgentConfig).filter(AgentConfig.workspace_id == ws.id).first()
        workspaces_data.append({
            "id": str(ws.id),
            "name": ws.name,
            "slug": ws.slug,
            "category": ws.category,
            "website_url": ws.website_url,
            "status": ws.status,
            "is_public": ws.is_public,
            "agent_status": agent.status if agent else "draft",
            "dedicated_url": f"https://agentforge.onrender.com/{ws.slug}" if ws.slug else None,
            "admin_url": f"https://agentforge.onrender.com/{ws.slug}/admin" if ws.slug else None,
            "created_at": ws.created_at.isoformat() if ws.created_at else None
        })

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        workspaces=workspaces_data,
        created_at=current_user.created_at
    )

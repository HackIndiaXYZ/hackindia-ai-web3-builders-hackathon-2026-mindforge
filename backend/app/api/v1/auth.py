from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Workspace, AgentConfig
from app.schemas.schemas import (
    UserRegisterRequest, UserLoginRequest, UserResponse,
    AuthTokenResponse, UserProfileResponse
)
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    pwd_hash = hash_password(payload.password)
    user = User(
        email=clean_email,
        password_hash=pwd_hash,
        full_name=payload.full_name.strip() if payload.full_name else None
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, email=user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthTokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()

    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.models import Workspace, BusinessProfile, AgentConfig
from app.schemas.schemas import WorkspaceCreate, WorkspaceResponse, BusinessProfileResponse, BusinessProfileUpdate

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

import re

@router.post("", response_model=WorkspaceResponse)
def create_workspace(payload: WorkspaceCreate, db: Session = Depends(get_db)):
    base_slug = payload.slug or re.sub(r'[^a-zA-Z0-9]+', '-', payload.name.lower()).strip('-')
    if not base_slug:
        base_slug = "agent"

    candidate_slug = base_slug
    counter = 1
    while db.query(Workspace).filter(Workspace.slug == candidate_slug).first():
        candidate_slug = f"{base_slug}-{counter}"
        counter += 1

    ws = Workspace(
        name=payload.name,
        slug=candidate_slug,
        category=payload.category,
        website_url=payload.website_url,
        status="active"
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    # Initialize default business profile
    profile = BusinessProfile(
        workspace_id=ws.id,
        summary=f"{ws.name} business profile.",
        tone="friendly, professional, concise"
    )
    db.add(profile)

    # Initialize default agent config
    agent_config = AgentConfig(
        workspace_id=ws.id,
        slug=candidate_slug,
        name=f"{ws.name} AI Employee",
        system_policy="Answer grounded in facts. Always be helpful, precise, and polite."
    )
    db.add(agent_config)
    db.commit()

    return ws

@router.get("/by-slug/{slug}")
def get_workspace_by_slug(slug: str, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.slug == slug).first()
    if not ws:
        raise HTTPException(status_code=404, detail=f"AI Agent with slug '{slug}' not found")

    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == ws.id).first()
    agent_config = db.query(AgentConfig).filter(AgentConfig.workspace_id == ws.id).first()

    return {
        "workspace": {
            "id": str(ws.id),
            "name": ws.name,
            "slug": ws.slug,
            "category": ws.category,
            "website_url": ws.website_url,
            "status": ws.status,
            "created_at": ws.created_at
        },
        "profile": {
            "summary": profile.summary if profile else "",
            "products": profile.products if profile else [],
            "services": profile.services if profile else [],
            "hours": profile.hours if profile else {},
            "policies": profile.policies if profile else {},
            "tone": profile.tone if profile else "friendly, professional",
            "contact": profile.contact if profile else {},
            "version": profile.version if profile else 1
        } if profile else None,
        "agent": {
            "id": str(agent_config.id) if agent_config else None,
            "name": agent_config.name if agent_config else "AI Employee",
            "slug": agent_config.slug if agent_config else ws.slug,
            "system_policy": agent_config.system_policy if agent_config else "",
            "tools": agent_config.tools if agent_config else [],
            "status": agent_config.status if agent_config else "draft",
            "config_hash": agent_config.config_hash if agent_config else None,
            "published_at": agent_config.published_at if agent_config else None
        } if agent_config else None
    }

@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(db: Session = Depends(get_db)):
    return db.query(Workspace).order_by(Workspace.created_at.desc()).all()

@router.get("/{id}", response_model=WorkspaceResponse)
def get_workspace(id: UUID, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws

@router.get("/{id}/profile", response_model=BusinessProfileResponse)
def get_business_profile(id: UUID, db: Session = Depends(get_db)):
    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("/{id}/profile", response_model=BusinessProfileResponse)
def update_business_profile(id: UUID, payload: BusinessProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    profile.version += 1
    db.commit()
    db.refresh(profile)
    return profile

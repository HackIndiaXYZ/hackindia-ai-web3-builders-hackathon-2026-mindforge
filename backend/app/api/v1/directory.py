from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from app.core.database import get_db
from app.models.models import Workspace, BusinessProfile, AgentConfig
from app.schemas.schemas import DirectoryListResponse, DirectoryAgentItem

router = APIRouter(prefix="/directory", tags=["Public Directory"])

@router.get("", response_model=DirectoryListResponse)
def list_public_agents(
    limit: int = Query(10, ge=1, le=100, description="Number of agents to return (e.g. 2 for homepage showcase)"),
    offset: int = Query(0, ge=0, description="Number of agents to skip for pagination"),
    category: Optional[str] = Query(None, description="Filter by business category"),
    search: Optional[str] = Query(None, description="Search by name, summary, or category"),
    db: Session = Depends(get_db)
):
    query = db.query(Workspace).filter(
        Workspace.status == "active",
        Workspace.slug.isnot(None),
        Workspace.is_public == True
    )

    if category:
        query = query.filter(Workspace.category.ilike(f"%{category.strip()}%"))

    if search:
        term = f"%{search.strip()}%"
        query = query.join(BusinessProfile, BusinessProfile.workspace_id == Workspace.id, isouter=True).filter(
            or_(
                Workspace.name.ilike(term),
                Workspace.category.ilike(term),
                BusinessProfile.summary.ilike(term)
            )
        )

    total = query.count()
    workspaces = query.order_by(Workspace.created_at.desc()).offset(offset).limit(limit).all()

    items = []
    for ws in workspaces:
        profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == ws.id).first()
        agent = db.query(AgentConfig).filter(AgentConfig.workspace_id == ws.id).first()

        summary_text = profile.summary if profile and profile.summary else f"Autonomous AI employee representing {ws.name}."
        
        # Build dynamic capability tags based on configured profile and tools
        capabilities = ["24/7 Web Chat"]
        if agent and agent.tools:
            if "book_appointment" in agent.tools:
                capabilities.append("Appointment Booking")
            if "create_lead" in agent.tools:
                capabilities.append("Lead Capture")
        else:
            capabilities.extend(["Lead Capture", "Appointment Booking"])

        items.append(
            DirectoryAgentItem(
                id=ws.id,
                name=ws.name,
                slug=ws.slug or "agent",
                category=ws.category or "Business Services",
                summary=summary_text,
                website_url=ws.website_url,
                dedicated_url=f"https://agentforge.onrender.com/{ws.slug}",
                status=agent.status if agent else "published",
                capabilities=capabilities,
                created_at=ws.created_at
            )
        )

    return DirectoryListResponse(total=total, items=items)

@router.get("/categories", response_model=List[str])
def list_directory_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(Workspace.category)
        .filter(Workspace.category.isnot(None), Workspace.is_public == True)
        .distinct()
        .all()
    )
    return [c[0] for c in categories if c[0]]

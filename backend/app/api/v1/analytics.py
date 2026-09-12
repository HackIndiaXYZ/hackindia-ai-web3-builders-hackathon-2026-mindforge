from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from app.core.database import get_db
from app.models.models import Conversation, Message, Lead, Appointment, AuditEvent
from app.schemas.schemas import AnalyticsSummaryResponse

router = APIRouter(prefix="/workspaces/{id}", tags=["Analytics & Audit"])

@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(id: UUID, db: Session = Depends(get_db)):
    total_convs = db.query(func.count(Conversation.id)).filter(Conversation.workspace_id == id).scalar() or 0
    
    total_msgs = db.query(func.count(Message.id)).join(
        Conversation, Message.conversation_id == Conversation.id
    ).filter(Conversation.workspace_id == id).scalar() or 0

    total_leads = db.query(func.count(Lead.id)).filter(Lead.workspace_id == id).scalar() or 0
    total_appts = db.query(func.count(Appointment.id)).filter(Appointment.workspace_id == id).scalar() or 0

    avg_latency = db.query(func.avg(Message.latency_ms)).join(
        Conversation, Message.conversation_id == Conversation.id
    ).filter(Conversation.workspace_id == id, Message.latency_ms.isnot(None)).scalar() or 0.0

    escalated = db.query(func.count(Conversation.id)).filter(
        Conversation.workspace_id == id, Conversation.outcome == "escalated"
    ).scalar() or 0

    resolved = db.query(func.count(Conversation.id)).filter(
        Conversation.workspace_id == id, Conversation.outcome == "resolved"
    ).scalar() or 0

    rate = (resolved / total_convs * 100.0) if total_convs > 0 else 100.0

    return AnalyticsSummaryResponse(
        total_conversations=total_convs,
        total_messages=total_msgs,
        total_leads=total_leads,
        total_appointments=total_appts,
        resolution_rate=round(rate, 1),
        avg_latency_ms=round(float(avg_latency), 1),
        escalation_count=escalated
    )

@router.get("/audit")
def list_audit_events(id: UUID, db: Session = Depends(get_db)):
    return db.query(AuditEvent).filter(
        AuditEvent.workspace_id == id
    ).order_by(AuditEvent.created_at.desc()).limit(50).all()

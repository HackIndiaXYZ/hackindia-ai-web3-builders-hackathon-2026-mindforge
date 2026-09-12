from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.models.models import Conversation, Message, Workspace, AgentConfig, BusinessProfile
from app.schemas.schemas import (
    ChatSessionCreate, ChatSessionResponse, ChatMessageCreate,
    ChatMessageResponse, Citation
)
from app.services.agent_runtime import process_chat_message

router = APIRouter(prefix="/chat", tags=["Customer Chat Widget"])

@router.post("/sessions", response_model=ChatSessionResponse)
def create_chat_session(payload: ChatSessionCreate, db: Session = Depends(get_db)):
    # If slug is given, resolve workspace and agent by slug
    workspace = None
    agent = None
    if payload.slug:
        workspace = db.query(Workspace).filter(Workspace.slug == payload.slug).first()
        if workspace:
            agent = db.query(AgentConfig).filter(AgentConfig.workspace_id == workspace.id).first()
        else:
            agent = db.query(AgentConfig).filter(AgentConfig.slug == payload.slug).first()
            if agent:
                workspace = db.query(Workspace).filter(Workspace.id == agent.workspace_id).first()
    elif payload.agent_id:
        agent = db.query(AgentConfig).filter(AgentConfig.id == payload.agent_id).first()
        if agent:
            workspace = db.query(Workspace).filter(Workspace.id == agent.workspace_id).first()

    if not workspace:
        workspace = db.query(Workspace).filter(Workspace.status == "active").order_by(Workspace.created_at.desc()).first()
        if not workspace:
            raise HTTPException(status_code=400, detail="No active workspace found")
        agent = db.query(AgentConfig).filter(AgentConfig.workspace_id == workspace.id).first()

    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == workspace.id).first()

    conv = Conversation(
        workspace_id=workspace.id,
        channel=payload.channel,
        customer_identifier=payload.customer_identifier,
        outcome="in_progress"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return ChatSessionResponse(
        session_id=conv.id,
        workspace_id=workspace.id,
        agent_name=agent.name if agent else "AI Employee",
        business_name=workspace.name,
        tone=profile.tone if profile else "friendly, professional"
    )

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(session_id: UUID, payload: ChatMessageCreate, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == session_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Chat session not found")

    result = await process_chat_message(db, session_id, payload.content)
    return ChatMessageResponse(**result)

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_session_messages(session_id: UUID, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.conversation_id == session_id
    ).order_by(Message.created_at.asc()).all()

    return [
        ChatMessageResponse(
            message_id=m.id,
            role=m.role,
            content=m.content,
            citations=m.citations or [],
            action_required=None,
            latency_ms=m.latency_ms
        )
        for m in messages
    ]

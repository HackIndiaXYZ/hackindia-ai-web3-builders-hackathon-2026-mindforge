from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any
from app.core.database import get_db
from app.models.models import Workspace, BusinessProfile, AgentConfig, Conversation, Message
from app.services.agent_runtime import retrieve_knowledge_chunks
from app.services.groq_client import call_groq

router = APIRouter(prefix="/voice", tags=["Voice Channel Integration"])

@router.post("/webhook")
async def handle_vapi_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook handler for Vapi voice calls.
    Supports assistant prompt requests and dynamic function calls.
    """
    body = await request.json()
    message = body.get("message", {})
    msg_type = message.get("type")

    # 1. Handle Vapi Assistant Request (fetching dynamic prompt & knowledge)
    if msg_type == "assistant-request":
        # Resolve active workspace
        ws = db.query(Workspace).filter(Workspace.status == "active").order_by(Workspace.created_at.desc()).first()
        profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == ws.id).first() if ws else None
        
        business_name = ws.name if ws else "AgentForge Business"
        summary = profile.summary if profile else "AI Business Employee"
        
        return {
            "assistant": {
                "name": f"{business_name} Voice Agent",
                "model": {
                    "provider": "custom-llm",
                    "url": "https://api.groq.com/openai/v1",
                    "model": "openai/gpt-oss-120b"
                },
                "firstMessage": f"Hello! Thanks for calling {business_name}. How can I help you today?",
                "systemPrompt": f"You are the voice phone employee for {business_name}. {summary}. Keep spoken answers very concise (under 2 sentences) and natural."
            }
        }

    # 2. Handle voice message / function call / dynamic response
    if msg_type == "function-call":
        func = message.get("functionCall", {})
        func_name = func.get("name")
        args = func.get("parameters", {})
        # Tool response for voice
        return {
            "result": f"Executed {func_name} with parameters: {args}"
        }

    # Default acknowledgement
    return {"status": "received", "type": msg_type}

@router.get("/workspaces/{id}/config")
def get_voice_agent_config(id: UUID, db: Session = Depends(get_db)):
    """Provides Vapi assistant setup payload for this workspace."""
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return {
        "workspace_id": str(ws.id),
        "business_name": ws.name,
        "first_message": f"Hello! Thanks for calling {ws.name}. How can I assist you today?",
        "suggested_voice": "jennifer",
        "system_prompt": f"You are the voice assistant for {ws.name}. {profile.summary if profile else ''}. Be polite, concise, and helpful."
    }

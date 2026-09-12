import json
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Lead, Appointment, ToolExecution, AuditEvent, Conversation

# Tool Schemas for Groq / OpenAI-compatible tool calling
AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_lead",
            "description": "Capture visitor contact details and product/service interests as a prospective business lead.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Full name of the visitor/customer"},
                    "email": {"type": "string", "description": "Email address of the customer"},
                    "phone": {"type": "string", "description": "Phone or WhatsApp number of the customer"},
                    "interest": {"type": "string", "description": "Specific product, service, or request they are interested in"}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book a scheduled meeting, consultation, or service appointment for a customer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {"type": "string", "description": "Full name of the client"},
                    "customer_contact": {"type": "string", "description": "Email or phone number for confirmation"},
                    "slot_time": {"type": "string", "description": "Desired appointment date and time in ISO-8601 format or readable date/time"},
                    "service_requested": {"type": "string", "description": "Service name or topic of the appointment"},
                    "notes": {"type": "string", "description": "Any additional notes or customer requests"}
                },
                "required": ["customer_name", "customer_contact", "slot_time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "human_handoff",
            "description": "Escalate the conversation to a human team member when the customer explicitly asks or when a dispute/complaint arises.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string", "description": "Reason for human escalation"},
                    "contact_info": {"type": "string", "description": "Best way to reach the customer"}
                },
                "required": ["reason"]
            }
        }
    }
]

def execute_create_lead(db: Session, workspace_id: Any, conversation_id: Any, args: Dict[str, Any]) -> Dict[str, Any]:
    lead = Lead(
        workspace_id=workspace_id,
        conversation_id=conversation_id,
        name=args.get("name", "Unknown Visitor"),
        email=args.get("email"),
        phone=args.get("phone"),
        interest=args.get("interest"),
        status="new"
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # Log audit event
    audit = AuditEvent(
        workspace_id=workspace_id,
        actor_type="agent",
        event_type="tool_call",
        target_id=str(lead.id),
        metadata_={"tool": "create_lead", "lead_name": lead.name}
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "lead_id": str(lead.id),
        "message": f"Lead created successfully for {lead.name}."
    }

def execute_book_appointment(db: Session, workspace_id: Any, conversation_id: Any, args: Dict[str, Any]) -> Dict[str, Any]:
    slot_str = args.get("slot_time")
    try:
        # Try parsing ISO or fallback to current + offset
        slot_dt = datetime.fromisoformat(slot_str.replace("Z", "+00:00"))
    except Exception:
        slot_dt = datetime.now(timezone.utc)

    appointment = Appointment(
        workspace_id=workspace_id,
        conversation_id=conversation_id,
        customer_name=args.get("customer_name", "Valued Client"),
        customer_contact=args.get("customer_contact", ""),
        slot_time=slot_dt,
        service_requested=args.get("service_requested", "General Consultation"),
        notes=args.get("notes", ""),
        status="confirmed"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Log audit event
    audit = AuditEvent(
        workspace_id=workspace_id,
        actor_type="agent",
        event_type="tool_call",
        target_id=str(appointment.id),
        metadata_={"tool": "book_appointment", "customer": appointment.customer_name}
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "appointment_id": str(appointment.id),
        "slot_time": str(appointment.slot_time),
        "message": f"Appointment booked successfully for {appointment.customer_name} at {appointment.slot_time}."
    }

def execute_human_handoff(db: Session, workspace_id: Any, conversation_id: Any, args: Dict[str, Any]) -> Dict[str, Any]:
    if conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.outcome = "escalated"
            db.commit()

    audit = AuditEvent(
        workspace_id=workspace_id,
        actor_type="agent",
        event_type="escalation",
        target_id=str(conversation_id) if conversation_id else None,
        metadata_={"reason": args.get("reason"), "contact": args.get("contact_info")}
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "escalated": True,
        "message": "The conversation has been routed to human support. A team member will follow up shortly."
    }

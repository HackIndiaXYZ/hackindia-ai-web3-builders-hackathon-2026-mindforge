from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.models import ToolExecution, Appointment, Lead, Message
from app.schemas.schemas import ActionConfirmRequest
from app.services.tools import execute_book_appointment

router = APIRouter(tags=["Actions & Operations"])

@router.post("/actions/confirm")
def confirm_action(payload: ActionConfirmRequest, db: Session = Depends(get_db)):
    execution = db.query(ToolExecution).filter(ToolExecution.id == payload.execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Action execution not found")

    if execution.status != "pending_confirmation":
        raise HTTPException(status_code=400, detail=f"Action is already in '{execution.status}' state")

    if not payload.confirm:
        execution.status = "rejected"
        db.commit()
        return {"success": True, "status": "rejected", "message": "Action was cancelled by user."}

    # Execute approved action
    if execution.tool_name == "book_appointment":
        result = execute_book_appointment(
            db=db,
            workspace_id=execution.workspace_id,
            conversation_id=execution.conversation_id,
            args=execution.args_json
        )
        execution.status = "executed"
        execution.result_meta = result
        db.commit()

        # Add assistant confirmation message to the conversation
        confirm_msg = Message(
            conversation_id=execution.conversation_id,
            role="assistant",
            content=f"Appointment confirmed for {result.get('slot_time')}! We look forward to meeting with you."
        )
        db.add(confirm_msg)
        db.commit()

        return {"success": True, "status": "executed", "result": result}
    
    return {"success": False, "message": "Unsupported tool for confirmation"}

@router.get("/workspaces/{id}/leads")
def list_leads(id: UUID, db: Session = Depends(get_db)):
    return db.query(Lead).filter(Lead.workspace_id == id).order_by(Lead.created_at.desc()).all()

@router.get("/workspaces/{id}/appointments")
def list_appointments(id: UUID, db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.workspace_id == id).order_by(Appointment.created_at.desc()).all()

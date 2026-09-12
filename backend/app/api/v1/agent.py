import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.models import AgentConfig, Workspace, AgentIdentity, AuditEvent, KnowledgeChunk
from app.schemas.schemas import AgentConfigUpdate, AgentConfigResponse, AgentPublishResponse, AgentVerifyResponse

router = APIRouter(tags=["Agent Configuration & Identity"])

@router.get("/workspaces/{id}/agent", response_model=AgentConfigResponse)
def get_agent_config(id: UUID, db: Session = Depends(get_db)):
    config = db.query(AgentConfig).filter(AgentConfig.workspace_id == id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Agent config not found")
    return config

@router.patch("/workspaces/{id}/agent", response_model=AgentConfigResponse)
def update_agent_config(id: UUID, payload: AgentConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(AgentConfig).filter(AgentConfig.workspace_id == id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Agent config not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "model_config":
            config.model_config_ = value
        else:
            setattr(config, key, value)

    config.version += 1
    db.commit()
    db.refresh(config)
    return config

@router.post("/workspaces/{id}/publish", response_model=AgentPublishResponse)
def publish_agent(id: UUID, db: Session = Depends(get_db)):
    config = db.query(AgentConfig).filter(AgentConfig.workspace_id == id).first()
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    if not config or not ws:
        raise HTTPException(status_code=404, detail="Workspace or Agent not found")

    # Compute deterministic SHA256 config hash
    config_dict = {
        "workspace_id": str(id),
        "name": config.name,
        "system_policy": config.system_policy,
        "tools": config.tools,
        "model": config.model_config_,
        "version": config.version
    }
    config_hash = "0x" + hashlib.sha256(json.dumps(config_dict, sort_keys=True).encode("utf-8")).hexdigest()

    # Compute knowledge fingerprint
    chunks = db.query(KnowledgeChunk.id).filter(KnowledgeChunk.workspace_id == id).all()
    chunk_ids = sorted([str(c[0]) for c in chunks])
    knowledge_hash = "0x" + hashlib.sha256("".join(chunk_ids).encode("utf-8")).hexdigest()

    now = datetime.now(timezone.utc)
    config.status = "published"
    config.config_hash = config_hash
    config.published_at = now
    db.commit()

    # Record identity anchor record
    identity = AgentIdentity(
        workspace_id=id,
        agent_id=config.id,
        config_hash=config_hash,
        knowledge_hash=knowledge_hash,
        chain_id=84532, # Base Sepolia
        status="pending"
    )
    db.add(identity)

    # Log audit event
    audit = AuditEvent(
        workspace_id=id,
        actor_type="admin",
        event_type="publish",
        target_id=str(config.id),
        metadata_={"config_hash": config_hash, "version": config.version}
    )
    db.add(audit)
    db.commit()

    return AgentPublishResponse(
        agent_id=config.id,
        version=config.version,
        status="published",
        config_hash=config_hash,
        published_at=now
    )

@router.get("/agents/{agent_id}/verify", response_model=AgentVerifyResponse)
def verify_agent_identity(agent_id: UUID, db: Session = Depends(get_db)):
    identity = db.query(AgentIdentity).filter(
        AgentIdentity.agent_id == agent_id
    ).order_by(AgentIdentity.created_at.desc()).first()

    if not identity:
        raise HTTPException(status_code=404, detail="No public identity anchor found for this agent")

    return AgentVerifyResponse(
        agent_id=identity.agent_id,
        config_hash=identity.config_hash,
        knowledge_hash=identity.knowledge_hash,
        chain_id=identity.chain_id,
        status=identity.status,
        contract_address=identity.contract_address or "0x0000000000000000000000000000000000000000",
        tx_hash=identity.tx_hash,
        is_verified=True
    )

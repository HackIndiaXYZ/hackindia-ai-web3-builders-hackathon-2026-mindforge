import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, ForeignKey,
    DateTime, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, index=True)
    otp_code = Column(String, nullable=False)
    purpose = Column(String, nullable=False, default="signup_activation") # 'signup_activation', 'password_reset'
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=True, index=True)
    category = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    is_public = Column(Boolean, nullable=False, default=True)
    status = Column(String, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    summary = Column(Text, nullable=True)
    products = Column(JSONB, nullable=False, default=list)
    services = Column(JSONB, nullable=False, default=list)
    location = Column(JSONB, nullable=False, default=dict)
    hours = Column(JSONB, nullable=False, default=dict)
    policies = Column(JSONB, nullable=False, default=dict)
    tone = Column(String, nullable=False, default="friendly, professional, concise")
    contact = Column(JSONB, nullable=False, default=dict)
    escalation = Column(JSONB, nullable=False, default=lambda: {"triggers": ["complaint", "refund dispute", "human requested"]})
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False, default="url") # 'url', 'text', 'faq'
    url = Column(String, nullable=True)
    title = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending") # 'pending', 'crawling', 'indexed', 'failed'
    checksum = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_sources.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(384), nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=False, default=dict)
    knowledge_version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class AgentConfig(Base):
    __tablename__ = "agent_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False, default="AI Employee")
    slug = Column(String, unique=True, nullable=True, index=True)
    system_policy = Column(Text, nullable=True)
    tools = Column(JSONB, nullable=False, default=lambda: ["create_lead", "book_appointment", "human_handoff"])
    escalation_rules = Column(JSONB, nullable=False, default=lambda: {"max_clarifications": 2, "notify_email": True})
    model_config_ = Column("model_config", JSONB, nullable=False, default=lambda: {"provider": "groq", "model": "openai/gpt-oss-120b", "temperature": 0.2})
    version = Column(Integer, nullable=False, default=1)
    status = Column(String, nullable=False, default="draft") # 'draft', 'published'
    config_hash = Column(String, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    channel = Column(String, nullable=False, default="web_chat") # 'web_chat', 'voice'
    customer_identifier = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    outcome = Column(String, nullable=False, default="in_progress")
    metadata_ = Column("metadata", JSONB, nullable=False, default=dict)


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False) # 'user', 'assistant', 'system', 'tool'
    content = Column(Text, nullable=False)
    citations = Column(JSONB, nullable=False, default=list)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class ToolExecution(Base):
    __tablename__ = "tool_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String, nullable=False)
    args_json = Column(JSONB, nullable=False, default=dict)
    args_hash = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending") # 'pending', 'confirmed', 'executed', 'rejected', 'failed'
    result_meta = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    interest = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="new")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String, nullable=False)
    customer_contact = Column(String, nullable=False)
    slot_time = Column(DateTime(timezone=True), nullable=False)
    service_requested = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="confirmed")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    actor_type = Column(String, nullable=False) # 'admin', 'agent', 'system', 'customer'
    event_type = Column(String, nullable=False) # 'config_change', 'tool_call', 'publish', 'escalation', 'anchor'
    target_id = Column(String, nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class AgentIdentity(Base):
    __tablename__ = "agent_identities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), nullable=False)
    config_hash = Column(String, nullable=False)
    knowledge_hash = Column(String, nullable=False)
    chain_id = Column(Integer, nullable=False, default=84532) # Base Sepolia
    contract_address = Column(String, nullable=True)
    tx_hash = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

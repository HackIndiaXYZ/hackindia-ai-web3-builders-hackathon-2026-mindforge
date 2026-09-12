from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

# Auth schemas
class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    confirm_password: Optional[str] = Field(None, description="Confirm password")
    full_name: Optional[str] = Field(None, description="User's full name")

class RegisterResponse(BaseModel):
    message: str
    email: str
    requires_otp: bool = True
    dev_otp: Optional[str] = None

class VerifySignupOtpRequest(BaseModel):
    email: str = Field(..., description="User email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="User email address")

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="User email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit reset code")
    new_password: str = Field(..., description="New strong password")
    confirm_password: str = Field(..., description="Confirm new password")

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    is_verified: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    workspaces: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Directory schemas
class DirectoryAgentItem(BaseModel):
    id: UUID
    name: str
    slug: str
    category: Optional[str] = None
    summary: Optional[str] = None
    website_url: Optional[str] = None
    dedicated_url: str
    status: str = "published"
    capabilities: List[str] = ["24/7 Web Chat", "Lead Capture", "Appointment Booking"]
    created_at: datetime

class DirectoryListResponse(BaseModel):
    total: int
    items: List[DirectoryAgentItem]

# Workspace schemas
class WorkspaceCreate(BaseModel):
    name: str = Field(..., description="Name of the business or workspace")
    slug: Optional[str] = Field(None, description="Unique slug/handle for the AI (e.g. crusty-bakery)")
    category: Optional[str] = Field(None, description="Industry or business category")
    website_url: Optional[str] = Field(None, description="Primary website URL to ingest")
    is_public: Optional[bool] = Field(True, description="Whether agent is listed in public directory")

class WorkspaceResponse(BaseModel):
    id: UUID
    name: str
    slug: Optional[str] = None
    category: Optional[str]
    website_url: Optional[str]
    is_public: bool = True
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Business Profile schemas
class BusinessProfileResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    summary: Optional[str]
    products: List[Dict[str, Any]] = []
    services: List[str] = []
    location: Dict[str, Any] = {}
    hours: Dict[str, Any] = {}
    policies: Dict[str, Any] = {}
    tone: str
    contact: Dict[str, Any] = {}
    escalation: Dict[str, Any] = {}
    version: int

    class Config:
        from_attributes = True

class BusinessProfileUpdate(BaseModel):
    summary: Optional[str] = None
    products: Optional[List[Dict[str, Any]]] = None
    services: Optional[List[str]] = None
    location: Optional[Dict[str, Any]] = None
    hours: Optional[Dict[str, Any]] = None
    policies: Optional[Dict[str, Any]] = None
    tone: Optional[str] = None
    contact: Optional[Dict[str, Any]] = None
    escalation: Optional[Dict[str, Any]] = None

# Onboarding Interview schemas
class OnboardingInitRequest(BaseModel):
    website_url: str = Field(..., description="Business website URL to crawl")
    business_name: Optional[str] = Field(None, description="Optional name override")
    category: Optional[str] = Field(None, description="Optional business category")
    business_notes: Optional[str] = Field(None, description="Additional context or notes")

class OnboardingInitResponse(BaseModel):
    workspace_id: UUID
    slug: str
    business_name: str
    status: str # 'interviewing', 'ready_for_review'
    assistant_message: str
    detected_profile: Optional[Dict[str, Any]] = None
    missing_fields: List[str] = []
    suggested_questions: List[str] = []

class OnboardingStartRequest(BaseModel):
    website_url: Optional[str] = None
    business_notes: Optional[str] = None

class OnboardingMessageRequest(BaseModel):
    message: str
    interview_history: List[Dict[str, str]] = []

class OnboardingResponse(BaseModel):
    status: str # 'interviewing', 'ready_for_review', 'completed'
    assistant_message: str
    detected_profile: Optional[Dict[str, Any]] = None
    missing_fields: List[str] = []
    suggested_questions: List[str] = []

class OnboardingDeployResponse(BaseModel):
    agent_id: UUID
    workspace_id: UUID
    slug: str
    status: str
    dedicated_url: str
    admin_url: str
    embed_code: str
    published_at: datetime

# Knowledge schemas
class KnowledgeSourceCreate(BaseModel):
    type: str = "url" # 'url', 'text', 'faq'
    url: Optional[str] = None
    title: Optional[str] = None
    raw_content: Optional[str] = None

class KnowledgeSourceResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    type: str
    url: Optional[str]
    title: Optional[str]
    status: str
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class KnowledgeChunkResponse(BaseModel):
    id: UUID
    content: str
    metadata: Dict[str, Any]
    score: Optional[float] = None

# Agent Config schemas
class AgentConfigUpdate(BaseModel):
    name: Optional[str] = None
    system_policy: Optional[str] = None
    tools: Optional[List[str]] = None
    escalation_rules: Optional[Dict[str, Any]] = None
    llm_config: Optional[Dict[str, Any]] = Field(default=None, alias="model_config")

    model_config = {"populate_by_name": True}

class AgentConfigResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    name: str
    system_policy: Optional[str]
    tools: List[str]
    escalation_rules: Dict[str, Any]
    llm_config: Dict[str, Any] = Field(default_factory=dict, alias="model_config")
    version: int
    status: str
    config_hash: Optional[str]
    published_at: Optional[datetime]

    model_config = {"populate_by_name": True, "from_attributes": True}

class AgentPublishResponse(BaseModel):
    agent_id: UUID
    version: int
    status: str
    config_hash: str
    published_at: datetime

# Chat & Message schemas
class ChatSessionCreate(BaseModel):
    agent_id: Optional[UUID] = None
    slug: Optional[str] = None
    channel: str = "web_chat"
    customer_identifier: Optional[str] = None

class ChatSessionResponse(BaseModel):
    session_id: UUID
    workspace_id: UUID
    agent_name: str
    business_name: str
    tone: str

class Citation(BaseModel):
    source_id: str
    title: Optional[str] = None
    url: Optional[str] = None
    snippet: str

class ChatMessageCreate(BaseModel):
    content: str

class ActionConfirmationPrompt(BaseModel):
    tool_name: str
    action_type: str
    prompt_text: str
    payload: Dict[str, Any]
    execution_id: UUID

class ChatMessageResponse(BaseModel):
    message_id: UUID
    role: str
    content: str
    citations: List[Citation] = []
    action_required: Optional[ActionConfirmationPrompt] = None
    latency_ms: Optional[int] = None

# Tool Execution & Action schemas
class ActionConfirmRequest(BaseModel):
    execution_id: UUID
    confirm: bool

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    interest: Optional[str] = None

class AppointmentCreate(BaseModel):
    customer_name: str
    customer_contact: str
    slot_time: datetime
    service_requested: Optional[str] = None
    notes: Optional[str] = None

# Analytics schemas
class AnalyticsSummaryResponse(BaseModel):
    total_conversations: int
    total_messages: int
    total_leads: int
    total_appointments: int
    resolution_rate: float
    avg_latency_ms: float
    escalation_count: int

# Web3 schemas
class AgentVerifyResponse(BaseModel):
    agent_id: UUID
    config_hash: str
    knowledge_hash: str
    chain_id: int
    status: str
    contract_address: Optional[str] = None
    tx_hash: Optional[str] = None
    is_verified: bool

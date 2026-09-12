import json
import re
import hashlib
from urllib.parse import urlparse
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.auth import get_optional_current_user
from app.models.models import (
    Workspace, BusinessProfile, AgentConfig,
    KnowledgeSource, KnowledgeChunk, User, AuditEvent
)
from app.schemas.schemas import (
    OnboardingInitRequest, OnboardingInitResponse,
    OnboardingStartRequest, OnboardingMessageRequest,
    OnboardingResponse, OnboardingDeployResponse,
    VerifyUrlRequest, VerifyUrlResponse
)
from app.services.crawler import crawl_website, verify_website_url
from app.services.chunker import chunk_text
from app.services.embedder import compute_embeddings
from app.services.gemini_client import call_gemini

router = APIRouter(tags=["AI Onboarding"])

@router.post("/onboarding/verify-url", response_model=VerifyUrlResponse)
async def verify_url_endpoint(payload: VerifyUrlRequest):
    """Verifies whether a provided website URL is live, reachable, and has a real domain."""
    result = await verify_website_url(payload.website_url)
    return result

EXTRACTOR_SYSTEM_PROMPT = """You are an expert AI business onboarding analyst.
Your task is to analyze the provided raw website text and notes from a business owner, and extract a structured Business Profile in JSON format.

Return ONLY valid JSON matching this exact structure:
{
  "name": "Business Name",
  "summary": "1-2 paragraph description of the business, its value proposition, and audience",
  "products": [{"name": "Item Name", "price": "Price if known", "notes": "Details"}],
  "services": ["Service 1", "Service 2"],
  "location": {"city": "City name", "address": "Address if known", "service_area": "Local/Global"},
  "hours": {"schedule": "e.g. Mon-Fri 9AM-6PM"},
  "policies": {"cancellation": "Policy if mentioned", "refunds": "Policy if mentioned"},
  "tone": "friendly, concise, professional",
  "contact": {"email": "email if found", "phone": "phone if found"},
  "missing_fields": ["List of critical fields that were missing or ambiguous, e.g. hours, exact pricing, cancellation policy"],
  "first_question": "A natural, warm conversational question asking the business owner about the most important missing details."
}
"""

def sanitize_slug(base_name: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9]+', '-', base_name.lower()).strip('-')
    return cleaned if cleaned else "business"

def generate_unique_slug(base_name: str, db: Session) -> str:
    candidate = sanitize_slug(base_name)
    return candidate

@router.post("/onboarding/init", response_model=OnboardingInitResponse)
async def init_onboarding_from_url(
    payload: OnboardingInitRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Primary endpoint for the Onboarding Page:
    Accepts website URL, crawls pages, indexes into pgvector, extracts initial Business Brain,
    and returns the first dynamic interview question with the generated workspace & slug.
    Enforces unique slug per business without generating duplicate -1, -2 workspaces.
    """
    target_url = payload.website_url.strip()
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "https://" + target_url

    # Verify that the website is real and accessible
    url_check = await verify_website_url(target_url)
    if not url_check.get("is_real"):
        raise HTTPException(
            status_code=400,
            detail=f"The website '{target_url}' is unreachable or does not exist. {url_check.get('error', 'Please enter a live, public website.')}"
        )

    # Deduce initial business name if not supplied
    inferred_name = payload.business_name
    if not inferred_name:
        domain = urlparse(target_url).netloc.replace("www.", "")
        inferred_name = domain.split(".")[0].replace("-", " ").title()
        if not inferred_name:
            inferred_name = "My Business"

    inferred_category = payload.category or "Commercial & Professional Services"
    
    # Determine candidate slug: prefer user-specified custom_slug, else use inferred name
    raw_slug = payload.custom_slug.strip() if payload.custom_slug and payload.custom_slug.strip() else inferred_name
    slug_candidate = sanitize_slug(raw_slug)

    # 1. Resolve or Create Workspace with strict unique slug enforcement
    existing_ws = db.query(Workspace).filter(Workspace.slug == slug_candidate).first()

    if current_user:
        # Check if current user already owns this workspace (by slug or exact business name)
        user_ws = db.query(Workspace).filter(
            Workspace.user_id == current_user.id,
            (Workspace.slug == slug_candidate) | (Workspace.name.ilike(inferred_name))
        ).first()

        if user_ws:
            # Reuse existing workspace owned by this user
            ws = user_ws
            ws.name = inferred_name
            ws.slug = slug_candidate
            ws.category = inferred_category
            ws.website_url = target_url
            db.commit()
            db.refresh(ws)
        elif existing_ws:
            # Slug taken by another user or organization
            if existing_ws.user_id != current_user.id:
                raise HTTPException(
                    status_code=409,
                    detail=f"The slug '{slug_candidate}' is already claimed by another business. Please choose a unique name or custom slug."
                )
            else:
                ws = existing_ws
                ws.name = inferred_name
                ws.category = inferred_category
                ws.website_url = target_url
                db.commit()
                db.refresh(ws)
        else:
            # Create new workspace for current user
            ws = Workspace(
                user_id=current_user.id,
                name=inferred_name,
                slug=slug_candidate,
                category=inferred_category,
                website_url=target_url,
                is_public=True,
                status="active"
            )
            db.add(ws)
            db.commit()
            db.refresh(ws)
    else:
        # Anonymous / unauthenticated session
        if existing_ws:
            if existing_ws.user_id is not None:
                raise HTTPException(
                    status_code=409,
                    detail=f"The slug '{slug_candidate}' is already claimed by a registered business. Please log in or choose a unique slug."
                )
            else:
                ws = existing_ws
                ws.name = inferred_name
                ws.category = inferred_category
                ws.website_url = target_url
                db.commit()
                db.refresh(ws)
        else:
            ws = Workspace(
                user_id=None,
                name=inferred_name,
                slug=slug_candidate,
                category=inferred_category,
                website_url=target_url,
                is_public=True,
                status="active"
            )
            db.add(ws)
            db.commit()
            db.refresh(ws)

    # 2. Get or Create Profile & Agent Config
    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == ws.id).first()
    if not profile:
        profile = BusinessProfile(
            workspace_id=ws.id,
            summary=f"{ws.name} is a premier business dedicated to quality and service.",
            tone="friendly, professional, concise"
        )
        db.add(profile)

    agent_config = db.query(AgentConfig).filter(AgentConfig.workspace_id == ws.id).first()
    if not agent_config:
        agent_config = AgentConfig(
            workspace_id=ws.id,
            slug=ws.slug,
            name=f"{ws.name} AI Employee",
            system_policy=f"You are the autonomous AI employee representing {ws.name}. Answer grounded in factual knowledge.",
            tools=["create_lead", "book_appointment", "human_handoff"],
            status="draft"
        )
        db.add(agent_config)
    else:
        agent_config.slug = ws.slug
        agent_config.name = f"{ws.name} AI Employee"
    db.commit()

    # 3. Crawl Website & Build Vector Knowledge Base (deduplicating sources)
    aggregated_text = ""
    try:
        crawled_pages = await crawl_website(target_url, max_pages=4)
        for page in crawled_pages:
            if not page.get("content"):
                continue
            page_title = page.get("title") or ws.name
            aggregated_text += f"\n\n--- PAGE: {page_title} ({page.get('url')}) ---\n" + page.get("content")

            # Check if source already exists to prevent duplicate entries
            source = db.query(KnowledgeSource).filter(
                KnowledgeSource.workspace_id == ws.id,
                KnowledgeSource.url == page.get("url")
            ).first()

            if not source:
                source = KnowledgeSource(
                    workspace_id=ws.id,
                    type="url",
                    url=page.get("url"),
                    title=page_title,
                    status="indexed"
                )
                db.add(source)
                db.commit()
                db.refresh(source)

                chunks = chunk_text(page.get("content"))
                if chunks:
                    texts = [c["content"] for c in chunks]
                    embeddings = compute_embeddings(texts)
                    for c, emb in zip(chunks, embeddings):
                        chunk_obj = KnowledgeChunk(
                            workspace_id=ws.id,
                            source_id=source.id,
                            content=c["content"],
                            embedding=emb,
                            metadata_={"url": page.get("url"), "title": page_title, "chunk_idx": c["index"]}
                        )
                        db.add(chunk_obj)
                    db.commit()
    except Exception as e:
        # Fallback gracefully if network/website is offline or blocks scraping
        aggregated_text = f"Website: {target_url}. Business: {ws.name}."

    if payload.business_notes:
        aggregated_text += f"\n\n--- OWNER NOTES ---\n{payload.business_notes}"

    # 4. Extract initial profile with Gemini
    messages = [
        {"role": "system", "content": EXTRACTOR_SYSTEM_PROMPT},
        {"role": "user", "content": f"Analyze this content for {ws.name} ({ws.category}) and extract the business profile:\n\n{aggregated_text[:8000]}"}
    ]

    extracted_json = {}
    try:
        gemini_resp = await call_gemini(messages=messages, temperature=0.2)
        raw_content = gemini_resp["choices"][0]["message"]["content"].strip()
        clean_json = raw_content
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
        json_match = re.search(r"\{.*\}", clean_json, re.DOTALL)
        if json_match:
            extracted_json = json.loads(json_match.group(0))
        else:
            extracted_json = {
                "name": ws.name,
                "summary": f"{ws.name} is a premier {ws.category} dedicated to quality products and customer service.",
                "missing_fields": ["hours", "policies", "contact"],
                "first_question": f"Welcome to {ws.name}! What are your standard operating hours and primary service location?"
            }
    except Exception:
        extracted_json = {
            "name": ws.name,
            "summary": f"{ws.name} is a premier {ws.category} dedicated to quality products and customer service.",
            "missing_fields": ["hours", "policies", "contact"],
            "first_question": f"Welcome to {ws.name}! What are your standard operating hours and primary service location?"
        }

    # Update profile in DB
    if extracted_json.get("name") and extracted_json["name"] != ws.name:
        ws.name = extracted_json["name"]
    profile.summary = extracted_json.get("summary", profile.summary)
    profile.products = extracted_json.get("products", profile.products or [])
    profile.services = extracted_json.get("services", profile.services or [])
    profile.location = extracted_json.get("location", profile.location or {})
    profile.hours = extracted_json.get("hours", profile.hours or {})
    profile.policies = extracted_json.get("policies", profile.policies or {})
    profile.tone = extracted_json.get("tone", profile.tone or "friendly, professional")
    profile.contact = extracted_json.get("contact", profile.contact or {})
    db.commit()

    missing = extracted_json.get("missing_fields", ["hours", "policies"])
    first_q = extracted_json.get("first_question") or f"Welcome to {ws.name}! What are your typical operating hours and main services?"

    return OnboardingInitResponse(
        workspace_id=ws.id,
        slug=ws.slug,
        business_name=ws.name,
        status="interviewing",
        assistant_message=f"I've analyzed your website ({target_url}) and created your business profile foundation! Let's do a quick 3-question check to fine-tune your AI employee:\n\n{first_q}",
        detected_profile=extracted_json,
        missing_fields=missing,
        suggested_questions=[
            "What are your business hours?",
            "What is your cancellation or refund policy?",
            "What are your top products or services?"
        ]
    )

@router.post("/workspaces/{id}/onboarding/start", response_model=OnboardingResponse)
async def start_onboarding_existing(id: UUID, payload: OnboardingStartRequest, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    aggregated_text = ""
    target_url = payload.website_url or ws.website_url

    if target_url:
        ws.website_url = target_url
        crawled_pages = await crawl_website(target_url, max_pages=4)
        for page in crawled_pages:
            if not page.get("content"):
                continue
            aggregated_text += f"\n\n--- PAGE: {page.get('title')} ({page.get('url')}) ---\n" + page.get("content")

            source = KnowledgeSource(
                workspace_id=ws.id,
                type="url",
                url=page.get("url"),
                title=page.get("title"),
                status="indexed"
            )
            db.add(source)
            db.commit()
            db.refresh(source)

            chunks = chunk_text(page.get("content"))
            if chunks:
                texts = [c["content"] for c in chunks]
                embeddings = compute_embeddings(texts)
                for c, emb in zip(chunks, embeddings):
                    chunk_obj = KnowledgeChunk(
                        workspace_id=ws.id,
                        source_id=source.id,
                        content=c["content"],
                        embedding=emb,
                        metadata_={"url": page.get("url"), "title": page.get("title"), "chunk_idx": c["index"]}
                    )
                    db.add(chunk_obj)
                db.commit()

    if payload.business_notes:
        aggregated_text += f"\n\n--- OWNER NOTES ---\n{payload.business_notes}"

    if not aggregated_text.strip():
        aggregated_text = f"Business Name: {ws.name}. Category: {ws.category or 'General Business'}."

    messages = [
        {"role": "system", "content": EXTRACTOR_SYSTEM_PROMPT},
        {"role": "user", "content": f"Analyze this content for {ws.name} ({ws.category or 'Business'}) and extract the business profile:\n\n{aggregated_text[:8000]}"}
    ]

    extracted_json = {}
    try:
        gemini_resp = await call_gemini(messages=messages, temperature=0.2)
        raw_content = gemini_resp["choices"][0]["message"]["content"].strip()
        clean_json = raw_content
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
        json_match = re.search(r"\{.*\}", clean_json, re.DOTALL)
        if json_match:
            extracted_json = json.loads(json_match.group(0))
        else:
            extracted_json = {
                "name": ws.name,
                "summary": f"{ws.name} is a premier {ws.category or 'business'} dedicated to quality products and customer service.",
                "missing_fields": ["hours", "policies", "contact"],
                "first_question": f"Welcome to {ws.name}! What are your standard operating hours and primary location or service area?"
            }
    except Exception:
        extracted_json = {
            "name": ws.name,
            "summary": f"{ws.name} is a premier {ws.category or 'business'} dedicated to quality products and customer service.",
            "missing_fields": ["hours", "policies", "contact"],
            "first_question": f"Welcome to {ws.name}! What are your standard operating hours and primary location or service area?"
        }

    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == ws.id).first()
    if profile:
        profile.summary = extracted_json.get("summary", profile.summary)
        profile.products = extracted_json.get("products", profile.products or [])
        profile.services = extracted_json.get("services", profile.services or [])
        profile.location = extracted_json.get("location", profile.location or {})
        profile.hours = extracted_json.get("hours", profile.hours or {})
        profile.policies = extracted_json.get("policies", profile.policies or {})
        profile.tone = extracted_json.get("tone", profile.tone or "friendly, professional")
        profile.contact = extracted_json.get("contact", profile.contact or {})
        db.commit()

    missing = extracted_json.get("missing_fields", ["hours", "policies"])
    first_q = extracted_json.get("first_question") or f"Welcome to {ws.name}! What are your typical operating hours and main services?"

    return OnboardingResponse(
        status="interviewing",
        assistant_message=f"I've analyzed {ws.name} and initiated your business profile draft. Let's do a quick 3-step check to fine-tune your AI employee:\n\n{first_q}",
        detected_profile=extracted_json,
        missing_fields=missing,
        suggested_questions=[
            "What are your business hours?",
            "What is your cancellation or refund policy?",
            "What are your top products or services?"
        ]
    )

@router.post("/workspaces/{id}/onboarding/message", response_model=OnboardingResponse)
async def continue_onboarding_interview(id: UUID, payload: OnboardingMessageRequest, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == id).first()
    if not ws or not profile:
        raise HTTPException(status_code=404, detail="Workspace or profile not found")

    user_turns = len([h for h in payload.interview_history if h.get("role") == "user"]) + 1
    is_final_turn = user_turns >= 3

    system_prompt = f"""You are the friendly, expert AgentForge AI onboarding specialist for {ws.name} ({ws.category or 'Business'}).

Current Business Profile:
- Summary: {profile.summary}
- Hours: {profile.hours}
- Services/Products: {profile.services}
- Policies: {profile.policies}
- Contact: {profile.contact}

Interview Progress: Question {user_turns} of 3.
The owner answered: "{payload.message}".

Instructions:
1. Warmly and concisely acknowledge the owner's answer (1-2 sentences).
2. If Question 1 (user_turns == 1): Ask about their core products or services, key prices, and what customers usually inquire about.
3. If Question 2 (user_turns == 2): Ask about their cancellation policy, advance notice requirements, or escalation phone/email.
4. If Question 3 or final (user_turns >= 3): Congratulate them, give a 1-sentence summary of the configured business brain, and say that their AI employee is ready for review and launch!

Return JSON ONLY matching:
{{
  "assistant_message": "Your warm response and next question or final congratulations",
  "extracted_hours": "Extracted hours if mentioned, or null",
  "extracted_policies": "Extracted policy rules if mentioned, or null",
  "extracted_services": "Extracted services if mentioned, or null",
  "is_complete": {"true" if is_final_turn else "false"}
}}
"""

    messages = [{"role": "system", "content": system_prompt}]
    for h in payload.interview_history[-6:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": payload.message})

    result_json = {}
    try:
        gemini_resp = await call_gemini(messages=messages, temperature=0.3)
        raw_content = gemini_resp["choices"][0]["message"]["content"].strip()
        clean_json = raw_content
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
        json_match = re.search(r"\{.*\}", clean_json, re.DOTALL)
        if json_match:
            result_json = json.loads(json_match.group(0))
        else:
            result_json = {
                "assistant_message": raw_content,
                "is_complete": is_final_turn
            }
    except Exception:
        fallback_msg = (
            f"Wonderful! I've noted that down for {ws.name}. Your AI employee's Business Brain is fully configured and ready for launch!"
            if is_final_turn else
            "Got it! What is your policy regarding appointment cancellations, advance notice, or customer refunds?"
        )
        result_json = {
            "assistant_message": fallback_msg,
            "is_complete": is_final_turn
        }

    # Update profile in DB
    if result_json.get("extracted_hours"):
        profile.hours = {"schedule": str(result_json["extracted_hours"])}
    if result_json.get("extracted_policies"):
        profile.policies = {"cancellation": str(result_json["extracted_policies"])}
    if result_json.get("extracted_services"):
        profile.services = [str(result_json["extracted_services"])]
    db.commit()

    is_complete = bool(result_json.get("is_complete", is_final_turn))

    return OnboardingResponse(
        status="ready_for_review" if is_complete else "interviewing",
        assistant_message=result_json.get("assistant_message", "Thank you! Let's continue."),
        detected_profile={
            "summary": profile.summary,
            "hours": profile.hours,
            "policies": profile.policies,
            "services": profile.services,
            "contact": profile.contact
        },
        missing_fields=[] if is_complete else ["policies"],
        suggested_questions=[]
    )

@router.post("/workspaces/{id}/onboarding/deploy", response_model=OnboardingDeployResponse)
async def deploy_onboarded_agent(id: UUID, db: Session = Depends(get_db)):
    """
    Finalize system prompt from the completed Business Brain using Gemini,
    set status to 'published', and return the dedicated URL and embed snippet.
    """
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    profile = db.query(BusinessProfile).filter(BusinessProfile.workspace_id == id).first()
    config = db.query(AgentConfig).filter(AgentConfig.workspace_id == id).first()

    if not ws or not config:
        raise HTTPException(status_code=404, detail="Workspace or Agent not found")

    # Construct synthesized system prompt
    hours_info = profile.hours.get("schedule", "Regular business hours") if profile and profile.hours else "Regular business hours"
    policies_info = profile.policies.get("cancellation", "Standard customer satisfaction policy") if profile and profile.policies else "Standard customer policy"
    services_info = ", ".join(profile.services) if profile and profile.services else "Comprehensive services"

    final_system_policy = f"""You are the official autonomous AI Employee for {ws.name}.
Business Category: {ws.category or 'Business'}
Business Summary: {profile.summary if profile else ''}
Operating Hours: {hours_info}
Services & Offerings: {services_info}
Customer Policies: {policies_info}
Tone & Style: {profile.tone if profile else 'friendly, concise, professional'}

Instructions:
1. Ground all answers in the business knowledge base. Never hallucinate facts or false pricing.
2. If the customer wants to book a time or schedule an appointment, collect their name, contact, and requested time, then invoke the appointment booking tool.
3. If the customer expresses interest in products or quotes, capture their contact details as a lead.
4. If a question is outside your knowledge, politely offer human escalation.
"""

    try:
        synth_messages = [
            {"role": "system", "content": "You are a master AI agent architect. Generate an authoritative, comprehensive operational system policy prompt for an autonomous AI business employee representing this company."},
            {"role": "user", "content": f"Business Name: {ws.name}\nCategory: {ws.category}\nSummary: {profile.summary}\nHours: {hours_info}\nServices: {services_info}\nPolicies: {policies_info}\nTone: {profile.tone}\n\nGenerate the complete operational policy prompt for the agent runtime."}
        ]
        synth_resp = await call_gemini(synth_messages, temperature=0.2)
        custom_policy = synth_resp["choices"][0]["message"]["content"].strip()
        if len(custom_policy) > 100:
            final_system_policy = custom_policy
    except Exception:
        pass

    now = datetime.now(timezone.utc)
    config.system_policy = final_system_policy
    config.status = "published"
    config.published_at = now
    
    # Generate config hash
    h = hashlib.sha256(final_system_policy.encode("utf-8")).hexdigest()
    config.config_hash = f"0x{h}"
    
    ws.is_public = True
    db.commit()

    slug = ws.slug or str(ws.id)
    dedicated_url = f"https://agentforge.onrender.com/{slug}"
    admin_url = f"https://agentforge.onrender.com/{slug}/admin"
    embed_code = f'<script src="https://agentforge.onrender.com/static/widget.js" data-slug="{slug}" defer></script>'

    return OnboardingDeployResponse(
        agent_id=config.id,
        workspace_id=ws.id,
        slug=slug,
        status="published",
        dedicated_url=dedicated_url,
        admin_url=admin_url,
        embed_code=embed_code,
        published_at=now
    )

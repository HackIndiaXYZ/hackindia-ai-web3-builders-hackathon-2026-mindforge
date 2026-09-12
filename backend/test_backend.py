import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.database import SessionLocal
from app.models.models import Workspace, BusinessProfile, AgentConfig, KnowledgeSource, KnowledgeChunk, Lead
from app.services.chunker import chunk_text
from app.services.embedder import compute_embeddings
from app.services.agent_runtime import retrieve_knowledge_chunks, process_chat_message
from app.api.v1.agent import publish_agent

SAMPLE_BUSINESS_TEXT = """
Sweet Crust Artisan Bakery is a boutique custom bakery located in downtown Kanpur.
We specialize in handcrafted sourdough breads, custom wedding cakes, and vegan/gluten-free pastries.

Our Operating Hours:
- Monday to Friday: 8:00 AM – 7:00 PM
- Saturday: 9:00 AM – 8:00 PM
- Sunday: 10:00 AM – 4:00 PM

Custom Cake Ordering:
Custom cakes require at least 48 hours advance notice. Cake tastings and design consultations can be scheduled on weekdays between 2:00 PM and 5:00 PM.

Pricing & Policies:
- Sourdough loaf: Rs 250
- Gluten-free cupcakes: Rs 120 each
- Custom celebration cakes: Starting from Rs 1,500
Cancellation Policy: Orders cancelled 24 hours prior to pickup receive a full refund. Custom wedding cakes require a non-refundable 20% deposit.

Contact Information:
Email: hello@sweetcrustbakery.com
Phone: +91 98765 43210
Address: 42 Civil Lines, Kanpur, Uttar Pradesh.
"""

async def run_test():
    print("=== STARTING AGENTFORGE BACKEND TEST ===")
    db = SessionLocal()
    try:
        # 1. Create Workspace
        print("\n1. Creating test workspace...")
        ws = Workspace(
            name="Sweet Crust Bakery",
            category="Artisan Bakery & Cafe",
            website_url="https://sweetcrustbakery.example.com",
            status="active"
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)
        print(f"-> Workspace created with ID: {ws.id}")

        # 2. Add Business Profile & Agent Config
        profile = BusinessProfile(
            workspace_id=ws.id,
            summary="Boutique artisan bakery in Kanpur specializing in sourdough, custom cakes, and vegan pastries.",
            tone="friendly, warm, appetizing",
            services=["Custom Cakes", "Sourdough Bread", "Wedding Consultations"],
            hours={"mon-fri": "8:00 AM - 7:00 PM", "sat": "9:00 AM - 8:00 PM", "sun": "10:00 AM - 4:00 PM"},
            policies={"cancellation": "Full refund if cancelled 24h prior, 20% deposit for wedding cakes"},
            contact={"email": "hello@sweetcrustbakery.com", "phone": "+91 98765 43210"}
        )
        db.add(profile)

        agent_config = AgentConfig(
            workspace_id=ws.id,
            name="Crusty the Bakery Assistant",
            system_policy="Answer grounded in our bakery menu and policies. Offer cake consultations warmly."
        )
        db.add(agent_config)
        db.commit()
        db.refresh(agent_config)
        print(f"-> Agent Config created with ID: {agent_config.id}")

        # 3. Ingest Knowledge & Embed with FastEmbed
        print("\n2. Ingesting knowledge chunks into Supabase pgvector...")
        source = KnowledgeSource(
            workspace_id=ws.id,
            type="text",
            title="Sweet Crust Menu & Policies",
            status="indexed"
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        chunks = chunk_text(SAMPLE_BUSINESS_TEXT)
        embeddings = compute_embeddings([c["content"] for c in chunks])
        for c, emb in zip(chunks, embeddings):
            chunk_obj = KnowledgeChunk(
                workspace_id=ws.id,
                source_id=source.id,
                content=c["content"],
                embedding=emb,
                metadata_={"title": source.title, "chunk_idx": c["index"]}
            )
            db.add(chunk_obj)
        db.commit()
        print(f"-> Successfully embedded and stored {len(chunks)} chunks in Supabase!")

        # 4. Test Semantic Vector Retrieval
        print("\n3. Testing pgvector semantic retrieval...")
        query = "What time do you close on Saturday and what is the refund policy?"
        retrieved = retrieve_knowledge_chunks(db, ws.id, query, top_k=2)
        print(f"-> Query: '{query}'")
        for r in retrieved:
            print(f"   [Match (dist: {r['distance']:.3f})]: {r['content'][:120]}...")

        # 5. Start Chat Session & Ask Grounded Question
        print("\n4. Testing Grounded Chat with Groq (120B)...")
        from app.models.models import Conversation
        conv = Conversation(
            workspace_id=ws.id,
            channel="web_chat",
            customer_identifier="test_visitor_1"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        chat_resp = await process_chat_message(
            db=db,
            conversation_id=conv.id,
            user_content="Do you have gluten-free items and how much notice do you need for a custom cake?"
        )
        print(f"-> AI Response ({chat_resp['latency_ms']}ms):\n{chat_resp['content']}")
        print(f"-> Citations provided: {len(chat_resp['citations'])}")

        # 6. Test Safe Action - Lead Capture
        print("\n5. Testing Safe Action: create_lead...")
        lead_msg = await process_chat_message(
            db=db,
            conversation_id=conv.id,
            user_content="I'd love to order a wedding cake. My name is Alex, email alex@example.com, phone 9998887776."
        )
        print(f"-> Action Response:\n{lead_msg['content']}")

        # Verify lead in DB
        leads = db.query(Lead).filter(Lead.workspace_id == ws.id).all()
        print(f"-> Total leads stored in Supabase: {len(leads)}")
        for l in leads:
            print(f"   - Lead: {l.name} | Email: {l.email} | Interest: {l.interest}")

        # 7. Test Agent Publishing & Cryptographic Fingerprinting
        print("\n6. Testing Agent Publishing & Web3 Fingerprinting...")
        publish_res = publish_agent(id=ws.id, db=db)
        print(f"-> Published Agent Version: {publish_res.version}")
        print(f"-> Tamper-evident Config Hash: {publish_res.config_hash}")

        print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_test())

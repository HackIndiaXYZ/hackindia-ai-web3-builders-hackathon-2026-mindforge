# AgentForge (MindForge) — HackIndia 2026

> Hackathon repository for Team MindForge — `[hackindia-team:hackindia-ai-web3-builders-hackathon-2026:mindforge]`

---

# AgentForge: AI Business Employee Platform

> **Turn any business website or application into a personalized AI employee that understands, supports, and operates the business across chat and voice.**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Database](https://img.shields.io/badge/Database-Supabase_PG17-emerald.svg)]()
[![Vector](https://img.shields.io/badge/pgvector-HNSW_384d-blue.svg)]()
[![LLM](https://img.shields.io/badge/LLM-Groq_120B-purple.svg)]()
[![Blockchain](https://img.shields.io/badge/Chain-Base_Sepolia-cyan.svg)]()

---

## 🌟 Overview

AgentForge eliminates the technical friction of prompt engineering, vector database syncing, and manual chatbot configuration for businesses. By simply providing a website URL, AgentForge:
1. **Crawls & Indexes Content**: Automatically extracts readable sections and computes 384-dimensional dense vectors using **FastEmbed** into **Supabase PostgreSQL (`pgvector`)**.
2. **AI-Led Gap-Resolution Interview**: Analyzes scraped data, detects ambiguities or missing operational details (e.g. hours, refund policies, booking procedures), and asks the business owner 2–3 targeted questions.
3. **Builds a Central Business Brain**: A unified, versioned single-source-of-truth governing tone, facts, hours, and policies across all communication channels.
4. **Enforces Deterministic Action Guardrails**: Allows safe operational actions (e.g., `create_lead`, `book_appointment`) with interactive human-in-the-loop confirmation cards for high-risk operations.
5. **Anchors Web3 Identity**: Cryptographically hashes published agent policies and knowledge states directly onto the **Base Sepolia** blockchain via `AgentRegistry.sol`, ensuring tamper-evident provenance without leaking any private business data or PII.

---

## 🏗️ Architecture

```
                                  +---------------------------+
                                  |      Business Owner       |
                                  +-------------+-------------+
                                                |
                                                v
                                    +-----------------------+
                                    |   Next.js 14 Console  |
                                    +-----------+-----------+
                                                |
                                                v
    +-----------------------+       +-----------------------+       +-----------------------+
    | Embeddable Web Widget | ----> |      FastAPI API      | <---> |   PostgreSQL + pgvector|
    | (1-Script Tag)        |       |   (Port 8000 / Cloud) |       |   (Supabase PG17)     |
    +-----------------------+       +-----------+-----------+       +-----------------------+
                                                |
                      +-------------------------+-------------------------+
                      |                         |                         |
                      v                         v                         v
            +-------------------+     +-------------------+     +-------------------+
            |  Groq LPU (120B)  |     | FastEmbed (Local) |     | Base Sepolia EVM  |
            |  Sub-100ms LLM    |     | 384d Dense Vector |     | AgentRegistry.sol |
            +-------------------+     +-------------------+     +-------------------+
```

---

## 🚀 Key Features

- **AI-Led Onboarding Loop**: Automatically extracts hours, products, services, and policies from URLs; actively interviews the owner to resolve gaps.
- **Shared Multi-Channel Brain**: Web chat widget and Vapi voice channels share identical knowledge, persona, and action capabilities.
- **pgvector Cosine Retrieval**: High-performance semantic vector similarity using HNSW indexing in Supabase PostgreSQL.
- **Zero-Cost Local Embeddings**: Built-in `bge-small-en-v1.5` embeddings running on CPU with zero external API fees or token consumption.
- **Deterministic Action Engine**: Real-world operations like lead capture and calendar scheduling with confirmation gates.
- **Single-Script Integration**: Install onto WordPress, Shopify, Next.js, or static HTML with one line:
  ```html
  <script src="http://localhost:8000/static/widget.js" data-agent-id="agt_your_id" defer></script>
  ```
- **Web3 Provenance Anchor**: `AgentRegistry.sol` smart contract provides tamper-proof identity tracking on EVM testnets.

---

## 📁 Repository Structure

```
AgentForge/
├── backend/                             # FastAPI Backend Engine
│   ├── app/
│   │   ├── api/v1/                     # REST routes (workspaces, onboarding, chat, actions, voice, analytics)
│   │   ├── core/                       # Supabase connection pooling & configuration
│   │   ├── models/                     # SQLAlchemy models for 12 relational + vector tables
│   │   ├── schemas/                    # Pydantic v2 schemas
│   │   ├── services/                   # Crawler, Chunker, FastEmbed, Groq LLM, Safe Tools, Runtime
│   │   ├── static/                     # Standalone embed widget.js & demo.html
│   │   └── main.py                     # FastAPI application entrypoint
│   ├── migrations/                     # Initial PostgreSQL schema with pgvector
│   ├── test_backend.py                 # Automated integration test suite
│   ├── requirements.txt
│   └── .env
├── frontend/                            # Next.js 14 Web Console
│   ├── src/app/page.tsx                # Tabbed Operator Console (Onboarding, Brain, Test Lab, CRM, Web3)
│   ├── package.json
│   └── tailwind.config.ts
├── contracts/                           # Web3 Provenance Anchor
│   └── AgentRegistry.sol               # Solidity smart contract for Base Sepolia
└── AgentForge_Documentation_Pack/      # 12-document product & engineering specification
```

---

## ⚡ Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python test_backend.py       # Runs end-to-end integration test against Supabase & Groq
python app/main.py           # Starts API server on http://localhost:8000
```
- Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Live Embed Widget Demo: [http://localhost:8000/static/demo.html](http://localhost:8000/static/demo.html)

### 2. Frontend Console Setup
```bash
cd frontend
npm install
npm run dev                  # Starts Next.js Console on http://localhost:3000
```

---

## 🔒 Security & Privacy

- **Tenant Isolation**: Every database query is strictly scoped by `workspace_id`.
- **Anti-Prompt-Injection**: Retrieved web contexts are safely delimited using `<knowledge_source>` markers and treated strictly as passive data.
- **Zero PII On-Chain**: The smart contract stores only SHA-256 cryptographic fingerprints (`keccak256(config_json + knowledge_hash)`), ensuring all personal and proprietary information remains off-chain.

---

## 📄 License
MIT License. Built for the **AgentForge** hackathon build plan.
>>>>>>> 8961e9e (feat: AgentForge autonomous AI employee engine, onboarding RAG, auth, directory APIs and integration guide)

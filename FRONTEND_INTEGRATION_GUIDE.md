# AgentForge: Frontend Developer Specification & API Integration Guide

Welcome to the **AgentForge Frontend Integration Guide**! This document provides everything you need to build, connect, and style the complete AgentForge frontend web application.

---

## 1. High-Level Architecture & Page Flow

```mermaid
flowchart TD
    subgraph App Navigation Flow
        Home["1. Home Page (/) \n• Hero (Welcome)\n• About\n• Showcase (Top 2 AIs + View More)\n• Onboard CTA Section"]
        Directory["2. Directory Page (/directory)\n• Full catalog of all public AIs\n• Category filters & Search\n• 'Chat Now' buttons"]
        Pricing["3. Pricing Page (/pricing)\n• Tier cards\n• 'Onboard your own AI' button"]
        Auth["4. Login/Signup (/login)\n• Email + Password (No OTP)\n• Tab to switch Login / Register"]
        Onboarding["5. Onboarding (/onboarding)\n• Enter Website URL\n• Real-time crawl & RAG build\n• 3-Step AI Gap Interview\n• Deploy with Slug & Embed Code"]
        Dedicated["6. Dedicated AI Page (/:slug)\n• Customer Chat & Voice Toggle\n• Business hours & info\n• Embed code modal"]
        Admin["7. Admin Dashboard (/:slug/admin)\n• Edit Business Brain\n• CRM Leads & Appointments\n• Knowledge base & analytics"]
    end

    Home -->|Click 'View More'| Directory
    Home -->|Click 'Onboard' CTA| Pricing
    Pricing -->|Click 'Onboard AI' (if signed in)| Onboarding
    Pricing -->|Click 'Onboard AI' (if NOT signed in)| Auth
    Auth -->|On successful login/signup| Onboarding
    Directory -->|Click 'Chat Now'| Dedicated
    Onboarding -->|On completion| Dedicated
    Dedicated -->|Manage Agent| Admin
```

---

## 2. Base Configuration & Environments

| Environment | Backend API Base URL | Embed Script Host |
| :--- | :--- | :--- |
| **Production (Render)** | `https://agentforge.onrender.com/api/v1` | `https://agentforge.onrender.com/static/widget.js` |
| **Local Development** | `http://localhost:8000/api/v1` | `http://localhost:8000/static/widget.js` |

> [!NOTE]
> All endpoints use standard JSON requests and responses. Authenticated endpoints require standard Bearer tokens: `Authorization: Bearer <access_token>`.

---

## 3. Detailed Screen-by-Screen Specifications

### Screen 1: Home Page (`/`)
A clean, scrollable animation landing page divided into 4 full sections:
1. **Section 1: Hero (Welcome to AgentForge)**
   - Headline: *"Deploy Autonomous AI Employees for Any Business in 60 Seconds"*.
   - Subtitle: *"Crawl your website, train your AI on your exact business policies, and launch a 24/7 sales and support employee."*
   - CTA Buttons:
     - `[Onboard Your AI Employee]` $\rightarrow$ redirects to `/pricing`.
     - `[Explore Live Directory]` $\rightarrow$ smooth scroll to Section 3 or links to `/directory`.
2. **Section 2: About AgentForge**
   - 3 Feature Cards:
     - **Instant Website Ingestion**: Deep crawling with dense vector search (FastEmbed + pgvector).
     - **Autonomous Gap Resolution**: The AI interviews you to fill knowledge holes before launch.
     - **Safe Action Execution**: Books real appointments and captures sales leads with confirmation gates.
3. **Section 3: AI Showcase (Created AI Employees)**
   - Call `GET /api/v1/directory?limit=2` on page load.
   - Render **2 AI Cards** displaying:
     - Business Name & Category badge.
     - Summary description.
     - Capability pills (e.g. `24/7 Web Chat`, `Appointment Booking`, `Lead Capture`).
     - `[Chat with AI]` button $\rightarrow$ links to `/:slug`.
   - **"View More" Button** $\rightarrow$ redirects to `/directory`.
4. **Section 4: Onboard CTA & Footer**
   - Headline: *"Ready to automate your customer interactions?"*
   - Button: `[Onboard Your Own AI Employee]` $\rightarrow$ redirects to `/pricing`.
   - Footer links: Terms of Service, Privacy Policy, Documentation, GitHub.

---

### Screen 2: Directory Page (`/directory`)
- **Header**: Title *"Explore Public AI Employees"* with dynamic search bar (`?search=...`).
- **Category Filter Tabs**: Call `GET /api/v1/directory/categories` to render filter buttons (`All`, `Bakery`, `Healthcare`, `Legal`, etc.).
- **Grid View**: Call `GET /api/v1/directory?category=...&search=...&limit=12&offset=...`.
  - Cards show avatar/icon, business name, category, summary, capabilities, and a direct `[Chat Now]` button pointing to `/:slug`.

---

### Screen 3: Pricing Page (`/pricing`)
- 3 Clear Pricing Tier Cards:
  - **Starter ($0 / Free)**: 1 AI Employee, 500 conversations/mo, Web Chat widget.
  - **Growth ($49 / mo)**: 3 AI Employees, Unlimited conversations, Custom Domain, Lead & Appointment CRM.
  - **Enterprise ($199 / mo)**: Custom Knowledge integration, Web3 Identity Anchor, Voice Calling agent.
- Every tier card includes an **"Onboard Your Own AI"** CTA button.
  - **Frontend Logic**:
    ```ts
    const handleOnboardClick = () => {
      const token = localStorage.getItem("agentforge_token");
      if (token) {
        router.push("/onboarding");
      } else {
        router.push("/login?redirect=/onboarding");
      }
    };
    ```

---

### Screen 4: Login / Sign Up Page (`/login`)
- **Single Page with 2 Tabs**: `[Sign In]` and `[Create Account]`.
- **Form Fields**:
  - Email address (`type="email"`).
  - Password (`type="password"`, min 6 characters).
  - Full Name (only shown on Sign Up tab).
- **Authentication Rules**:
  - **No OTP required**. Direct email + password authentication.
  - On submit, call `POST /api/v1/auth/login` or `POST /api/v1/auth/register`.
  - Store returned `access_token` in `localStorage.setItem("agentforge_token", token)`.
  - Redirect to `/onboarding` (or previous redirected page).

---

### Screen 5: Onboarding Page (`/onboarding`)
A seamless multi-phase flow in one clean page:

```
[Phase 1: URL Input] ──> [Phase 2: Crawling & RAG] ──> [Phase 3: 3-Turn Interview] ──> [Phase 4: Brain Review & Deploy]
```

1. **Phase 1: URL Input**
   - User enters website URL (e.g. `https://sweetcrustbakery.com`).
   - Optional expandable fields: Business Name override, Category, Extra Notes.
   - Click `[Start AI Training]`.
2. **Phase 2: Crawling & Context Extraction**
   - Call `POST /api/v1/onboarding/init`:
     ```json
     {
       "website_url": "https://sweetcrustbakery.com",
       "business_name": "Sweet Crust Bakery",
       "category": "Artisan Bakery"
     }
     ```
   - Show nice animated progress: *"Crawling website pages..."* $\rightarrow$ *"Generating embeddings..."* $\rightarrow$ *"Synthesizing Business Profile..."*.
   - Backend returns `workspace_id`, `slug`, `assistant_message` (first question), and initial `detected_profile`.
3. **Phase 3: Interactive 3-Turn Interview**
   - Chat-style question card showing:
     - Question counter badge (e.g. `Question 1 of 3`).
     - AI assistant prompt bubble.
     - User input text box + `[Send Answer]` button.
     - Optional `[Skip / Use Default]` button.
   - On each message, call `POST /api/v1/workspaces/:id/onboarding/message`.
   - Update interview history state. When turn 3 completes, backend returns `status: "ready_for_review"`.
4. **Phase 4: Business Brain Review & Deployment**
   - Display editable summary cards:
     - **Hours of Operation**
     - **Core Products / Services**
     - **Customer Policies (Cancellations/Refunds)**
     - **Contact & Escalation**
   - Click **`[Deploy AI Employee]`** $\rightarrow$ calls `POST /api/v1/workspaces/:id/onboarding/deploy`.
5. **Phase 5: Success Modal**
   - Displays:
     - **Dedicated Page**: `https://agentforge.onrender.com/:slug` with a `[Visit AI]` button.
     - **Admin Page**: `https://agentforge.onrender.com/:slug/admin` with a `[Manage Agent]` button.
     - **Embed Script Snippet**:
       ```html
       <script src="https://agentforge.onrender.com/static/widget.js" data-slug="sweet-crust-bakery" defer></script>
       ```
     - One-click `[Copy Embed Code]` button with toast notification.

---

### Screen 6: Dedicated AI Page (`/:slug`)
The public-facing customer interface for this specific business:
- Call `GET /api/v1/workspaces/by-slug/:slug` to get business info, hours, and agent config.
- **Header**: Warm business banner with business name, category, and hours badge.
- **Main Chat Window**:
  - Start session: `POST /api/v1/chat/sessions` with `{ "slug": slug }`.
  - Send message: `POST /api/v1/chat/sessions/:session_id/messages` with `{ "content": "..." }`.
  - Displays citations, source tags, and latency badge.
  - If AI triggers an action confirmation (e.g. Booking appointment), renders confirmation card with `[Confirm]` and `[Cancel]` buttons calling `POST /api/v1/actions/confirm`.
- **Top Action**: `[Get Embed Code]` button opening modal with `<script>` tag.

---

### Screen 7: Dedicated Admin Dashboard (`/:slug/admin`)
- Accessible by the business owner.
- **Tabs**:
  1. **Overview / KPIs**: Total conversations, captured leads, booked appointments (from `GET /api/v1/workspaces/:id/analytics/summary`).
  2. **Business Brain Editor**: View and edit hours, services, and policies (`GET / PATCH /api/v1/workspaces/:id/profile`).
  3. **CRM Leads**: Table of captured customer names, emails, and phone numbers (`GET /api/v1/workspaces/:id/leads`).
  4. **Appointments**: Table of booked customer slots and services (`GET /api/v1/workspaces/:id/appointments`).
  5. **Knowledge Hub**: Test vector similarity search directly with test queries (`POST /api/v1/workspaces/:id/knowledge/search`).

---

## 4. Complete REST API Specification

### Authentication Endpoints

#### 1. Register User
- **POST** `/auth/register`
- **Request Body**:
  ```json
  {
    "email": "owner@bakery.com",
    "password": "SecretPassword123!",
    "full_name": "Jane Baker"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": "b1ea2340-87ae-4b90-b207-034e7ea0b645",
      "email": "owner@bakery.com",
      "full_name": "Jane Baker",
      "created_at": "2026-09-12T04:50:00Z"
    }
  }
  ```

#### 2. Login User
- **POST** `/auth/login`
- **Request Body**:
  ```json
  {
    "email": "owner@bakery.com",
    "password": "SecretPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": "b1ea2340-87ae-4b90-b207-034e7ea0b645",
      "email": "owner@bakery.com",
      "full_name": "Jane Baker",
      "created_at": "2026-09-12T04:50:00Z"
    }
  }
  ```

#### 3. Get Current User Profile & Workspaces
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
  ```json
  {
    "id": "b1ea2340-87ae-4b90-b207-034e7ea0b645",
    "email": "owner@bakery.com",
    "full_name": "Jane Baker",
    "workspaces": [
      {
        "id": "c026299e-8d6f-47eb-9a3b-9d61578694ac",
        "name": "Sweet Crust Bakery",
        "slug": "sweet-crust-bakery",
        "category": "Artisan Bakery",
        "status": "active",
        "dedicated_url": "https://agentforge.onrender.com/sweet-crust-bakery",
        "admin_url": "https://agentforge.onrender.com/sweet-crust-bakery/admin"
      }
    ]
  }
  ```

---

### Directory Endpoints

#### 4. List Public AI Employees (Directory & Home Showcase)
- **GET** `/directory`
- **Query Parameters**:
  - `limit`: `number` (default: 10, use `2` for Home Page showcase)
  - `offset`: `number` (default: 0)
  - `category`: `string` (optional filter)
  - `search`: `string` (optional query for name, summary, category)
- **Response (200 OK)**:
  ```json
  {
    "total": 8,
    "items": [
      {
        "id": "c026299e-8d6f-47eb-9a3b-9d61578694ac",
        "name": "Sweet Crust Artisan Bakery",
        "slug": "sweet-crust-artisan-bakery",
        "category": "Artisan Bakery & Cafe",
        "summary": "Handcrafted sourdoughs, fresh morning pastries, and custom wedding cakes.",
        "website_url": "https://sweetcrustbakery.example.com",
        "dedicated_url": "https://agentforge.onrender.com/sweet-crust-artisan-bakery",
        "status": "published",
        "capabilities": ["24/7 Web Chat", "Appointment Booking", "Lead Capture"],
        "created_at": "2026-09-12T04:45:00Z"
      }
    ]
  }
  ```

#### 5. List Categories
- **GET** `/directory/categories`
- **Response (200 OK)**: `["Artisan Bakery & Cafe", "Wood-Fired Pizzeria", "Dental Clinic"]`

---

### Onboarding Endpoints

#### 6. Initialize Onboarding (Crawl & First Question)
- **POST** `/onboarding/init`
- **Headers** *(optional)*: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "website_url": "https://sweetcrustbakery.example.com",
    "business_name": "Sweet Crust Bakery",
    "category": "Artisan Bakery & Cafe",
    "business_notes": "We bake fresh daily at 5 AM. Custom wedding cake consultations required."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "workspace_id": "c026299e-8d6f-47eb-9a3b-9d61578694ac",
    "slug": "sweet-crust-bakery",
    "business_name": "Sweet Crust Bakery",
    "status": "interviewing",
    "assistant_message": "I've analyzed your website and initiated your business profile draft! What are your standard operating hours and primary service location?",
    "detected_profile": {
      "name": "Sweet Crust Bakery",
      "summary": "Premier artisan bakery specializing in traditional sourdoughs.",
      "services": ["Artisan Baking", "Wedding Cakes"],
      "missing_fields": ["hours", "policies"]
    },
    "missing_fields": ["hours", "policies"],
    "suggested_questions": ["What are your business hours?"]
  }
  ```

#### 7. Continue Interview Turn
- **POST** `/workspaces/{id}/onboarding/message`
- **Request Body**:
  ```json
  {
    "message": "We are open Tuesday to Sunday from 7 AM to 6 PM, closed Mondays.",
    "interview_history": [
      {
        "role": "assistant",
        "content": "What are your standard operating hours and primary service location?"
      }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "interviewing",
    "assistant_message": "Got it! Tuesday to Sunday, 7 AM to 6 PM. What is your cancellation or advance notice policy for special orders?",
    "detected_profile": {
      "hours": {"schedule": "Tuesday to Sunday 7 AM - 6 PM"}
    },
    "missing_fields": ["policies"]
  }
  ```

#### 8. Deploy Agent
- **POST** `/workspaces/{id}/onboarding/deploy`
- **Response (200 OK)**:
  ```json
  {
    "agent_id": "3bb609b1-561b-4171-be17-fef3c1b64dfc",
    "workspace_id": "c026299e-8d6f-47eb-9a3b-9d61578694ac",
    "slug": "sweet-crust-bakery",
    "status": "published",
    "dedicated_url": "https://agentforge.onrender.com/sweet-crust-bakery",
    "admin_url": "https://agentforge.onrender.com/sweet-crust-bakery/admin",
    "embed_code": "<script src=\"https://agentforge.onrender.com/static/widget.js\" data-slug=\"sweet-crust-bakery\" defer></script>",
    "published_at": "2026-09-12T04:52:00Z"
  }
  ```

---

### AI Employee Page & Chat Endpoints

#### 9. Get Workspace by Slug
- **GET** `/workspaces/by-slug/{slug}`
- **Response (200 OK)**:
  ```json
  {
    "workspace": {
      "id": "c026299e-8d6f-47eb-9a3b-9d61578694ac",
      "name": "Sweet Crust Bakery",
      "slug": "sweet-crust-bakery",
      "category": "Artisan Bakery",
      "website_url": "https://sweetcrustbakery.example.com",
      "status": "active"
    },
    "profile": {
      "summary": "Handcrafted sourdoughs and artisan pastries.",
      "hours": {"schedule": "Tue-Sun 7AM-6PM"},
      "services": ["Sourdough", "Pastries", "Wedding Cakes"],
      "policies": {"cancellation": "48 hours advance notice"}
    },
    "agent": {
      "id": "3bb609b1-561b-4171-be17-fef3c1b64dfc",
      "name": "Sweet Crust Bakery AI Employee",
      "slug": "sweet-crust-bakery",
      "status": "published"
    }
  }
  ```

#### 10. Start Customer Chat Session
- **POST** `/chat/sessions`
- **Request Body**:
  ```json
  {
    "slug": "sweet-crust-bakery",
    "channel": "web_chat"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "session_id": "67e10daa-766a-4202-83fe-9339baa39e89",
    "workspace_id": "c026299e-8d6f-47eb-9a3b-9d61578694ac",
    "agent_name": "Sweet Crust Bakery AI Employee",
    "business_name": "Sweet Crust Bakery",
    "tone": "friendly, professional, concise"
  }
  ```

#### 11. Send Message
- **POST** `/chat/sessions/{session_id}/messages`
- **Request Body**:
  ```json
  {
    "content": "Do you offer vegan or gluten-free sourdough bread?"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message_id": "f5e4d3c2-b1a0-4899-8765-43210fedcba9",
    "role": "assistant",
    "content": "Yes! We bake 100% naturally fermented vegan sourdough every morning. For gluten-sensitive guests, we offer seed loaves on Fridays.",
    "citations": [
      {
        "source_title": "Menu & Ingredients",
        "url": "https://sweetcrustbakery.example.com/menu",
        "snippet": "All our classic sourdoughs are vegan-friendly."
      }
    ],
    "action_required": null,
    "latency_ms": 1140
  }
  ```

#### 12. Confirm Tool Action (e.g. Appointment Booking)
- **POST** `/actions/confirm`
- **Request Body**:
  ```json
  {
    "execution_id": "uuid-here",
    "confirm": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": "executed",
    "result": {
      "customer_name": "Sarah Connor",
      "slot_time": "2026-09-15T10:00:00Z"
    }
  }
  ```

---

### Admin Dashboard Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/workspaces/{id}/profile` | `GET` | Get current Business Brain profile details |
| `/workspaces/{id}/profile` | `PATCH` | Update Business Brain (hours, policies, services) |
| `/workspaces/{id}/leads` | `GET` | List captured customer leads (name, email, phone) |
| `/workspaces/{id}/appointments` | `GET` | List booked customer appointments |
| `/workspaces/{id}/analytics/summary`| `GET` | Total conversations, leads, resolution rate, latency |
| `/workspaces/{id}/knowledge/search` | `POST` | Live pgvector similarity search test |

---

## 5. Embeddable Widget Integration

Any business website can embed the AI employee with just **one line of HTML**:

```html
<script 
  src="https://agentforge.onrender.com/static/widget.js" 
  data-slug="sweet-crust-bakery" 
  defer>
</script>
```

The script automatically injects a floating chat bubble in the lower-right corner of their website that loads this specific AI employee.

---

## 6. Ready-to-Copy TypeScript API Client

Save this as `src/lib/api.ts` in your frontend:

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://agentforge.onrender.com/api/v1";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("agentforge_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("agentforge_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("agentforge_token");
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Network request failed" }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}
```

---

## 7. Recommended Color Palette & Style (Artisan Clean Aesthetic)

Match the clean, high-contrast, artisan design system of the demo bakery:
- **Background**: `#FAFAFA` (Slate light: `#F8FAFC`)
- **Primary Gradient**: `linear-gradient(135deg, #d97706 0%, #b45309 100%)` (Warm honey amber)
- **Primary Text**: `#1E293B` (Slate-900)
- **Secondary Text**: `#475569` (Slate-600)
- **Border / Divider**: `#E2E8F0` / `#E5E7EB`
- **Cards**: Pure White `#FFFFFF` with `rounded-xl`, subtle border, and soft shadow `shadow-sm`.
- **Badges**:
  - Amber badge: background `#FEF3C7`, text `#92400E`.
  - Emerald active badge: background `#DCFCE7`, text `#166534`.

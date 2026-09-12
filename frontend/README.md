# AgentForge — Frontend Application

High-end, production-grade business AI-agent configuration and operations platform built strictly according to the **AgentForge Frontend Master PRD**.

## UX Principle

> **"Make the product feel like configuring an employee, not configuring an LLM."**
> Clean, tactile, trustworthy, professional, and human-designed.

---

## Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with strict custom design tokens
- **Icons**: [Lucide React](https://lucide.dev/) (consistent 16–20px functional icons)
- **Charts**: [Recharts](https://recharts.org/) (clean, restrained, no rainbow dashboards)
- **State & Storage**: React Context with `localStorage` persistence and signature *Configuration Pulse*

---

## Design System & Tokens

### Light Mode
- **Background**: `#F7F7F5`
- **Surface**: `#FFFFFF`
- **Secondary Surface**: `#F1F1EE`
- **Border**: `#E5E5E1`
- **Primary Text**: `#171717`
- **Secondary Text**: `#6B6B68`
- **Muted Text**: `#9A9A95`

### Dark Mode
- **Background**: `#0D0D0D`
- **Surface**: `#151515`
- **Secondary Surface**: `#1B1B1B`
- **Border**: `#292929`
- **Primary Text**: `#F5F5F5`
- **Secondary Text**: `#A1A1A1`
- **Muted Text**: `#686868`

---

## Features & Routes

### 1. Landing Page (`/`)
- Hero: *"Build an AI employee for your business."*
- Interactive product preview demonstrating live state synchronization without giant AI tropes.

### 2. 7-Step Onboarding Flow (`/onboarding/*`)
- Persistent 7-step progress indicator (`01 Business` → `07 Deploy`).
- Focus animations, validation states, and progressive disclosure employee interview.
- Simulated knowledge crawler with animated 62% progress bar and vector indexer.

### 3. Dashboard Shell & Core Screens (`/dashboard/*`)
- **Collapsible Sidebar**: 240px expanded / 72px collapsed with smooth width transition.
- **Top Header**: Minimal breadcrumbs, draft/live status dot, search trigger (`⌘K`), theme toggle.
- **Command Menu**: Fast modal spotlight (`⌘K` / `Ctrl+K`) for instant navigation and actions.
- **Business Brain**: The signature screen with `✦ AI generated` indicators, in-place editing, and the signature **Configuration Pulse** animation (`dot` → `pulse` → `✓ Updated`).
- **Agent Test Console**: Two-column layout with customer chat on the left and transparent "Why this answer?" grounding trace on the right. Handles insufficient knowledge trust state with human escalation fallback.
- **Knowledge Base**: Source list, crawler simulator, add source modal (Website, PDF, Document, Manual facts).
- **Guarded Actions**: Action management with explicit confirmation modal for sensitive mutations (e.g. ₹1,299 refund).
- **Conversations**: Searchable customer ticket logs with master-detail transcript inspector.
- **Analytics**: Restrained time-series graphs with 7d/30d/90d filters.
- **Identity**: Verified cryptographic fingerprint (`•••• •••• •••• 84F2`), Agent ID `AGT-48291`.
- **Deploy**: Production pre-flight checklist and copyable web widget script tag with toast notification.
- **Settings**: Workspace team members, secret keys, model defaults, and theme switcher.

---

## Getting Started

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

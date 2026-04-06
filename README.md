# Partner Credit Hub

**Live Demo → [partner-credits-demo.lovable.app](https://partner-credits-demo.lovable.app)**

## The Problem

AWS Marketplace partner credits are managed through spreadsheets, email chains, and tribal knowledge. Partners fly blind on request status, partner managers lack visibility, and finance teams waste hours on manual tracking.

## What This Solves

A dual-portal credit management system that gives every stakeholder — customers, partner managers, and finance — real-time visibility into credit requests from submission to payout.

### Customer Portal
- Submit credit requests with guided forms
- Track request status with a visual timeline
- View historical requests filtered by persona (demo mode)

### Internal Finance Portal
- Queue-based workflow with tier-based routing (< $10K → Finance, $10–50K → + Director, > $50K → + VP)
- One-click approve/deny with audit trail
- Send-back workflow with editable action items
- OOO delegation for approvers
- Reports, user management, and settings pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui |
| Backend | Supabase (Postgres, Edge Functions, RLS) |
| Charts | Recharts |
| Routing | React Router v6 |
| State | TanStack React Query |
| Platform | Lovable |

## Running Locally

```bash
git clone <repo-url>
cd partner-credit-hub
cp .env.example .env   # Fill in your Supabase credentials
npm install
npm run dev
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layouts/      # CustomerLayout, InternalLayout
│   └── ui/           # shadcn/ui primitives
├── contexts/         # PersonaContext for demo switching
├── pages/            # Route-level page components
│   ├── Index.tsx             # Landing page with stats + narrative
│   ├── CustomerDashboard.tsx # Customer portal home
│   ├── CustomerSubmit.tsx    # Credit request form
│   ├── CustomerRequests.tsx  # Request history
│   ├── CustomerStatus.tsx    # Request timeline tracker
│   ├── InternalDashboard.tsx # Finance queue
│   ├── DealDetail.tsx        # Request detail + approval workflow
│   ├── ApproverView.tsx      # Approver-specific view
│   ├── InternalReports.tsx   # Analytics dashboard
│   ├── InternalUsers.tsx     # User management
│   └── InternalSettings.tsx  # System settings
├── integrations/     # Supabase client + types (auto-generated)
└── hooks/            # Custom React hooks
```

## Demo Features

- **5 customer personas** with a switcher in the header — each shows different request histories
- **25 seeded deals** across all statuses for realistic data
- **OOO delegation** — Priya Patel is marked OOO with Marcus Chen as delegate
- **Tier-based routing** automatically assigns approval chains based on credit amount

---

Built as a vibe coding demonstration for a Senior Partner Manager interview.

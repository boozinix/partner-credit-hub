

# Partner Credit Funding Portal — Revised Plan

## UX Direction (from reference screenshots)

The reference designs show a polished, institutional finance aesthetic. Key patterns to adopt:

- **Light, clean canvas** — white/light gray backgrounds, card-based sections with subtle borders and rounded corners
- **Large typographic hierarchy** — oversized dollar amounts and tracking IDs as hero elements, uppercase small labels (CUSTOMER, REQUESTED AMOUNT, PRODUCTS INCLUDED, etc.)
- **Two-column layouts** — main content left (~65%), contextual sidebar cards right (~35%)
- **Vertical timeline with circles** — colored filled circles (green=done, blue=current with progress bar, gray=future), connecting vertical line, timestamps/estimates on the right
- **Approval chain as a compact right-sidebar card** — role label, name, status (Approved/OOO badge), reassign dropdown inline
- **Sticky bottom action bar** on deal detail (Deny | Send Back to Customer | Approve & Route)
- **Product chips** — rounded pill badges for selected products
- **Blockquote-style justification** — left blue/indigo border, italic quoted text
- **Single-page submit form** (not a multi-step wizard) with a right sidebar showing "Submission Guidelines" tips and a trust badge/image. Progress indicator still shown at top but all sections visible on one scrollable page.
- **Email Composer modal** — tabbed (Variant A: Send Back / Variant B: Approval), rich text area with action items callout block, Send Message button
- **Finance Dashboard** — donut chart with center label ($1.0M FY2026 POOL), legend with amounts and percentages, indigo/purple "Active Queue Health" card with stats, filter bar, paginated table
- **Indigo/navy as primary accent**, red for destructive, green for success, amber for warnings/OOO

## Technical Implementation

### 1. Database Setup (Supabase)
Four tables: `credit_requests`, `approvers`, `approval_steps`, `status_history` — schema as previously specified. No RLS (prototype). Pre-seed 20 PAID_OUT + 5 active deals + 4 approvers automatically via Edge Function or migration seed.

### 2. Routes & Pages

**Landing `/`** — Storytelling hero, problem cards, solution table, animated counters, CTAs. No changes from original spec.

**Submit `/submit`** — Single scrollable page (not multi-step wizard, per reference). Top: 4-step progress indicator (visual only, all sections visible). Sections stacked vertically:
- AWS Account Information (2-col grid)
- AWS Marketplace Deal Parameters (credit type dropdown, amount, dates, invoice)
- Target Red Hat Products (clickable chip toggles)
- Marketplace Business Case (textarea + optional file upload area)
- Right sidebar: "Submission Guidelines" card with tips, "Need Red Hat Support?" help card, trust image block
- Bottom: Save Draft (text link) + Submit Marketplace Request (indigo button)

**Status `/status/:trackingId`** — Two-column layout:
- Left: Large tracking ID + "Last updated" badge, Action Required banner (amber, with CTA button) when NEEDS_CHANGES, "Funding Lifecycle" vertical timeline with 5 steps, descriptions under each, progress bar on current step
- Right: "Partnership Summary" card (amount, primary service, customer, fiscal year), "Modernization ROI" card (indigo bg, projected savings stat), "Your AWS Partner Manager" card with avatar and contact button

**My Requests `/my-requests`** — Email lookup, card grid with status badges, tabs. Same as original spec.

**Finance Dashboard `/internal`** — Sidebar layout (Finance Queue, Reports, Settings, User Management). Main area:
- Header: "Finance Queue" title + subtitle + Export CSV / New Entry buttons
- Top row: Donut chart card (FY2026 Credit Pool with $1.0M center label, Paid Out/In Queue/Remaining legend) + Active Queue Health card (indigo bg, pending count, avg deal, SLA met)
- Filter bar: search input + Stage/Tier/Approver dropdowns
- Table: Tracking ID (link), Customer, Amount, Red Hat Solution, Tier Badge, Stage (dot + label), Approver, Status icon, 3-dot actions
- Pagination with page numbers
- Bottom-left: Admin User avatar + role

**Deal Detail `/internal/deals/:trackingId`** — Two-column:
- Left: Tracking ID badge + Tier badge, large customer name, submitted date. Cards: Account Information (2x2 grid), Products & Services (with icons and amounts if available), Business Justification (blockquote), Internal Notes textarea with "Stakeholder Share" link
- Right: Large dollar amount display, Approval Chain card (vertical: Finance/Director/VP with names, dates, OOO badges, reassign dropdown), Risk Assessment bar (optional nice touch)
- Sticky bottom bar: "You are approving as [role]" + Deny (red) | Send Back to Customer (amber outline) | Approve & Route (indigo filled)

**Approver View `/internal/approver/:trackingId`** — Minimal top bar (Red Hat | FINANCIAL SERVICES PORTAL | role badge). Two-column:
- Left: "PENDING REQUEST #ID" label, large deal title, card with customer/amount/tier/products chips, justification blockquote, credit type + impact forecast, "Mandatory Approval Workflow" timeline
- Right: "Reviewer Decision" card with Executive Notes textarea, Approve Allocation (indigo) + Reject Request (red outline) buttons, audit disclaimer text, Supporting Materials card
- Footer with compliance links

**Email Composer Modal** — Triggered from deal detail. Header: icon + "Email Composer / Internal Finance Dispatch". Tabs: "Variant A: Send Back" (active, red accent) | "Variant B: Approval" (check icon). Shows Recipient, Subject (pre-filled), rich text body with "Required Action Items" callout block (amber/red bg). Bottom: Schedule Send link, Cancel, Send Message button (indigo). Auto-saved draft indicator.

### 3. Supabase Integration
- Edge functions for all mutations (create, approve, deny, send-back, return-to-finance, resubmit)
- Direct client queries for reads (credit_requests with joins)
- Budget calculation from aggregated paid_out amounts
- Tier logic enforced server-side in edge functions

### 4. Component Architecture
- Shared: `StatusBadge`, `TierBadge`, `ProductChip`, `TimelineStep`, `ApprovalChainCard`, `ActionBar`
- Layout: `InternalLayout` (with sidebar), `PublicLayout` (with simple header/footer)
- Forms: React Hook Form + Zod for submit page
- Charts: Recharts PieChart for budget donut

### 5. Seed Data
Pre-seed automatically on first load or via edge function: 4 approvers, 20 PAID_OUT deals with full approval chains and status histories, 5 active deals at various stages.


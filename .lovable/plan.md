

# Consolidated Plan — 4 Feature Requests

## Feature 1: Excel vs Portal Toggle on Landing Page

Insert a new section between Section 1 (Problem Cards) and Section 2 (What This Fixes) in `src/pages/Index.tsx`.

**What it contains:**
- A centered toggle switch with "Before" (red) on the left and "After" (green) on the right
- **Excel state** (toggle left): A fake Excel UI with grey borders, Calibri font, frozen header row, alternating row colors, 8 rows using deals AWZ-2026-0001 through 0008. Status column shows messy manual text ("check with Sarah", "waiting on director", etc.). A red banner above it: "This is how it worked before..." A fake Excel toolbar: File | Edit | View | Insert
- **Portal state** (toggle right, default): The 3 solution cards already on the page + green banner "Real-time. Automated. Zero spreadsheets."
- 300ms fade transition between states

**File**: `src/pages/Index.tsx` — new `ExcelVsPortalToggle` component inserted after Section 1.

---

## Feature 2: Budget Runway Alert on Finance Dashboard

Add a prominent alert card at the top of the Finance Queue, above the donut chart, in `src/pages/InternalDashboard.tsx`.

**Logic:**
- Total paid out from PAID_OUT deals (sum `credit_amount`)
- Months elapsed = months since Jan 2026 (FY start) to today (April = 3 months)
- Monthly burn = paidOut / monthsElapsed
- Remaining = $1M - paidOut
- Months remaining = remaining / monthlyBurn
- Projected exhaustion date = today + monthsRemaining months
- Color: green if >12 months, amber if 6-12, red if <6

**Display:** Headline "Budget Runway Alert", large bold projected date, explanation line with calculated values.

**File**: `src/pages/InternalDashboard.tsx`

---

## Feature 3: "Why Stuck?" Expandable Rows in Finance Queue

Enhance the overdue badge in the Finance Queue table to be clickable, expanding an amber-background detail row below the deal.

**Logic per expanded row:**
- If assigned approver `is_ooo` AND no alternate → "OOO — no backup assigned" + "Reassign Now" button
- If status is `NEEDS_CHANGES` → "Awaiting customer since [date]" + "Send Reminder" button
- If `DIRECTOR_PENDING` or `VP_PENDING` for 5+ days → "Approval stalled — [approver name] has not acted" + "Escalate" button

Requires fetching approvers data alongside requests. Expandable row toggled by clicking the overdue badge.

**File**: `src/pages/InternalDashboard.tsx`

---

## Feature 4: OOO Crisis Banner + Reassignment Flow

### A. Crisis Banner on Finance Dashboard

A red/amber full-width banner at the very top of the dashboard (above demo banner), data-driven:
- Query: deals where status is `DIRECTOR_PENDING` or `VP_PENDING`, assigned approver is OOO, and deal has been in that status 5+ days
- Uses actual data: AWZ-2026-0043 ($37,500, GlobalEdge Networks) is `DIRECTOR_PENDING`, Priya Sharma is OOO
- Shows: "SLA Breach — Deal AWZ-2026-0043 has been waiting X days... Priya Sharma is OOO... $37,500 at risk."
- "Resolve Now →" button links to `/internal/deals/AWZ-2026-0043`
- Banner disappears when no qualifying deals exist

**File**: `src/pages/InternalDashboard.tsx`

### B. OOO Reassignment on Deal Detail

On the DealDetail page, when the assigned approver is OOO:
- Show an amber "OOO Alert" card at top of right sidebar with context
- Dropdown with alternate approver (Marcus Chen — Director)
- "Reassign to Marcus Chen" button that:
  1. Updates `assigned_approver_id` on the credit request
  2. Inserts a `status_history` entry documenting the reassignment
  3. Shows success toast
  4. Refreshes the page data

**File**: `src/pages/DealDetail.tsx` — add OOO alert card above the Amount card in the right sidebar, conditioned on the current approver being OOO.

---

## Files to Change

| File | Changes |
|---|---|
| `src/pages/Index.tsx` | Add ExcelVsPortalToggle component between Section 1 and Section 2 |
| `src/pages/InternalDashboard.tsx` | Add budget runway alert card, crisis OOO banner, expandable "Why stuck?" rows with action buttons |
| `src/pages/DealDetail.tsx` | Add OOO alert card + reassignment dropdown/button in right sidebar |

## Technical Notes
- AWZ-2026-0043 is the real OOO crisis deal: `DIRECTOR_PENDING`, Priya Sharma (OOO), updated 2026-03-30 (8+ days ago)
- Marcus Chen (Director, available) is the reassignment target — his ID is `a1000000-0000-0000-0000-000000000004`
- Priya's ID is `a1000000-0000-0000-0000-000000000002`, she has `ooo_delegate_id` pointing to Marcus
- Budget: need to query actual PAID_OUT sum for burn rate calculation
- No DB schema changes needed — all features use existing tables


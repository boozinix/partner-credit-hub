

# Pre-Demo Critical Fixes

## Issue 1 — Landing Page Stats Show Zeros
The stats are hardcoded with correct values (line 118-123: `end: 1000000`, `end: 847`, etc.) but the `AnimatedCounter` starts at 0 and only animates when scrolled into view (IntersectionObserver with threshold 0.3). The counters likely never trigger because the stats section may not intersect properly on certain viewports.

**Fix**: Wire the stats to pull live data from Supabase on mount. Fetch counts from `credit_requests` table:
- FY2026 Credit Pool = hardcoded $1,000,000
- Credits Processed = `SELECT COUNT(*) FROM credit_requests WHERE status = 'PAID_OUT'`
- Approval Rate = `SELECT (COUNT(*) FILTER (WHERE status IN ('APPROVED','PAID_OUT')) * 100 / COUNT(*)) FROM credit_requests`
- Avg Processing Time = `SELECT AVG(EXTRACT(DAY FROM updated_at - created_at)) FROM credit_requests WHERE status IN ('APPROVED','PAID_OUT')`

Also fix the AnimatedCounter to start animation immediately if already visible on mount (not just on scroll).

**File**: `src/pages/Index.tsx`

---

## Issue 2 — Add "Why I Built This" Narrative
Add a new section between the hero and the portal selector cards with:
1. A personal narrative paragraph (first-person voice from a Senior Partner Manager)
2. Three problem cards: "Customers Fly Blind", "Partner Managers Have Zero Visibility", "Finance Runs on Spreadsheets"
3. A "What This Solves" row showing how each problem maps to a solution

**File**: `src/pages/Index.tsx`

---

## Issue 3 — Send Back Modal
Currently "Send Back to Customer" in the action bar (line 341) calls `performAction("send_back")` directly. Need to intercept this to open a modal first with:
- Pre-filled subject: `Action Required: Credit Request [trackingId]`
- Body textarea pre-filled with customer name and request ID
- Amber-bordered editable action items list
- Cancel / Send & Notify buttons
- Only update status to NEEDS_CHANGES on confirm

**File**: `src/pages/DealDetail.tsx`

---

## Issue 4 — Fix "Red Hat AI/ML Suite" Product Name
Database has `Red Hat AI/ML Suite` in AWZ-2026-0044's products array. Need to update this to `Red Hat OpenShift AI` in the database.

**Action**: Database UPDATE via insert tool to fix the product name in credit_requests.

---

## Minor Polish

### Status tracker — estimated future dates
In `CustomerStatus.tsx`, add "+X business days" estimates on pending/upcoming timeline steps based on average processing times.

**File**: `src/pages/CustomerStatus.tsx`

### Approval chain — "Awaiting" label + pulse
In `DealDetail.tsx`, add an "Awaiting" label and subtle pulse animation on the currently active approval step (non-approved, non-completed steps).

**File**: `src/pages/DealDetail.tsx`

### "Edit with Lovable" badge
Hide the badge via the publish settings tool.

---

## Files to Change

| File | Changes |
|---|---|
| `src/pages/Index.tsx` | Add Supabase data fetch for stats, add "Why I Built This" narrative section, fix AnimatedCounter visibility |
| `src/pages/DealDetail.tsx` | Add Send Back modal with editable action items, add "Awaiting" label + pulse on active approval step |
| `src/pages/CustomerStatus.tsx` | Add "+X business days" estimates on pending timeline steps |
| Database (UPDATE) | Fix `Red Hat AI/ML Suite` → `Red Hat OpenShift AI` in credit_requests products |
| Publish settings | Hide "Edit with Lovable" badge |




# Mobile-Only Responsive Fixes

All changes use Tailwind responsive prefixes so desktop UI is untouched.

## 1. Customer Layout — Mobile Hamburger Menu
**File:** `src/components/layouts/CustomerLayout.tsx`

- Import `Sheet`, `SheetContent`, `SheetTrigger` and `Menu` icon
- Wrap existing nav links, view toggle, and persona switcher in `hidden md:flex`
- Add a `md:hidden` hamburger button that opens a Sheet (slide-in drawer) with all nav items stacked vertically, the view toggle, and persona switcher
- Truncate logo text on mobile: hide "Partner Credit Portal" below `md`, show just "RH" icon + "Credit Portal" or just the icon
- Hide the demo banner long text on mobile — show a shorter version
- Hide the persona strip on mobile (redundant with hamburger menu)

## 2. Landing Page — Mobile Responsive
**File:** `src/pages/Index.tsx`

- **Header:** Hide "Customer Portal" / "Finance Portal" buttons on mobile (`hidden md:flex`), hero CTAs serve this purpose
- **Hero:** `text-3xl md:text-4xl` for h1, stack CTA buttons vertically (`flex-col sm:flex-row`)
- **How It Works grid:** `grid-cols-2 md:grid-cols-4` (already partially done, verify)
- **Problem section:** Stack 3 cards vertically on mobile (`grid-cols-1 md:grid-cols-3`)
- **Excel toggle:** Add `overflow-x-auto` and reduce padding
- **Portal fixes section:** Stack cards (`grid-cols-1 md:grid-cols-3`)
- **Stats:** Already `grid-cols-2 md:grid-cols-4` — reduce text size on mobile
- **Roadmap:** Reduce left padding, smaller card padding on mobile
- **"What this replaces":** Stack vertically (`grid-cols-1 md:grid-cols-3`)
- **Portal CTA cards:** Already `md:grid-cols-2` — reduce padding on mobile

## 3. Customer Dashboard — Mobile Tweaks
**File:** `src/pages/CustomerDashboard.tsx`

- Welcome header: stack title + button vertically (`flex-col sm:flex-row gap-4`)
- Request cards: stack amount below tracking ID instead of side-by-side on mobile

## 4. Customer Requests — Mobile Tab Fix
**File:** `src/pages/CustomerRequests.tsx`

- Make `TabsList` horizontally scrollable with `overflow-x-auto` and `w-full`
- Request cards: wrap content on small screens

## 5. Customer Submit — Mobile Form
**File:** `src/pages/CustomerSubmit.tsx`

- Progress steps at top: use icons-only on mobile or make scrollable
- Form sections: reduce padding, full-width inputs

## 6. Internal Layout — Minor Mobile Tweaks
**File:** `src/components/layouts/InternalLayout.tsx`

- Hide "← Back to Overview" text on mobile, keep just arrow icon
- Shrink view toggle text on mobile

## 7. Global Overflow Fix
**File:** `src/index.css`

- Add `overflow-x: hidden` to `body` to kill any residual horizontal scroll

## Technical approach
- All changes gated behind `md:` or `sm:` breakpoints — desktop stays identical
- Use existing `Sheet` component for the mobile hamburger drawer
- Use existing `useIsMobile` hook where conditional rendering is needed
- No new dependencies


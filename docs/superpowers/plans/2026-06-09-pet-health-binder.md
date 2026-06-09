# Pet Health Binder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A multi-device, cloud-synced, $19 one-time-purchase pet health dashboard (8 tabs) built on Next.js + Convex + Stripe, with a warm hand-crafted (non-generic) design.

**Architecture:** Next.js App Router app on Vercel. Convex holds all data with reactive queries for automatic cross-device sync. Convex Auth (password) for login. Stripe Checkout (one-time, test mode) → webhook → flips `users.hasPaid`. Pure date/streak/gating logic lives in `lib/` and is unit-tested with Vitest; Convex functions and React UI consume it.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Convex + @convex-dev/auth, Stripe, Chart.js, Vitest, next/font (Fraunces + Inter), CSS Modules / plain CSS.

---

## File Structure

```
pet-health-binder/
  app/
    layout.tsx                # root: fonts, ConvexAuthProvider, global css
    page.tsx                  # marketing landing
    globals.css               # design tokens + print styles
    login/page.tsx
    signup/page.tsx
    app/
      layout.tsx              # auth+pay gate, sidebar/bottom nav, pet switcher
      page.tsx                # Dashboard (default tab)
      vaccines/page.tsx
      medications/page.tsx
      vet-visits/page.tsx
      weight/page.tsx
      grooming/page.tsx
      expenses/page.tsx
      sitter-sheet/page.tsx
    api/stripe/webhook/route.ts
    api/stripe/checkout/route.ts
  convex/
    schema.ts
    auth.ts auth.config.ts http.ts
    users.ts pets.ts vaccines.ts medications.ts vetVisits.ts
    weights.ts careTasks.ts expenses.ts files.ts stripe.ts seed.ts
  lib/
    dates.ts                  # age, dueStatus, nextDue, daysUntil  (TESTED)
    meds.ts                   # today-doses, streak, daily reset      (TESTED)
    backup.ts                 # export/import merge-with-defaults     (TESTED)
    defaults.ts               # species care-task seeds, vaccine list
    format.ts                 # currency, weight unit display
  components/
    PetSwitcher.tsx Nav.tsx Card.tsx EmptyState.tsx StatusChip.tsx
    QuickAdd.tsx Sparkline.tsx WeightChart.tsx ExpenseChart.tsx
    PawMotif.tsx Modal.tsx LockOverlay.tsx Toast.tsx
  test/  (vitest specs for lib/)
  .env.local  (Convex + Stripe keys — user supplied)
```

---

## Phase 0 — Scaffold & tooling

### Task 0.1: Create Next.js app
- [ ] `pnpm create next-app@latest . --ts --app --no-tailwind --no-src-dir --import-alias "@/*" --eslint --use-pnpm` in the existing dir.
- [ ] Add deps: `pnpm add convex @convex-dev/auth chart.js`; `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react`.
- [ ] Add `vitest.config.ts` (jsdom env, `@` alias).
- [ ] `package.json` scripts: `"test": "vitest run"`, `"dev:all": "convex dev & next dev"`.
- [ ] Commit: `chore: scaffold next.js + convex + vitest`.

### Task 0.2: Design tokens & fonts
- [ ] `app/globals.css`: CSS vars `--cream #FAF7F2 --forest #2D5A4A --terracotta #D97B5D --charcoal #2A2A28`, radius, shadows; base body styles; print stylesheet block (`@media print`) that hides `[data-noprint]` and forces black-on-white.
- [ ] `app/layout.tsx`: load Fraunces + Inter via `next/font/google`, expose as CSS vars.
- [ ] Commit.

---

## Phase 1 — Pure logic (TDD, Vitest)

### Task 1.1: `lib/dates.ts` — age & due-status
**Files:** Create `lib/dates.ts`, Test `test/dates.test.ts`

- [ ] **Step 1: failing tests**
```ts
import { describe, it, expect } from "vitest";
import { ageFromBirthday, daysUntil, dueStatus } from "@/lib/dates";

describe("ageFromBirthday", () => {
  it("computes whole years", () => {
    expect(ageFromBirthday("2020-06-09", "2026-06-09")).toBe("6 years");
  });
  it("handles not-yet-had-birthday-this-year", () => {
    expect(ageFromBirthday("2020-12-31", "2026-06-09")).toBe("5 years, 5 months");
  });
  it("months for under-1-year", () => {
    expect(ageFromBirthday("2026-01-09", "2026-06-09")).toBe("5 months");
  });
});

describe("daysUntil", () => {
  it("positive future, negative past, crossing year boundary", () => {
    expect(daysUntil("2027-01-08", "2026-12-09")).toBe(30);
    expect(daysUntil("2026-12-09", "2027-01-08")).toBe(-30);
  });
});

describe("dueStatus", () => {
  it("overdue / due-soon / current by threshold", () => {
    expect(dueStatus("2026-06-01", "2026-06-09", 60).level).toBe("overdue");
    expect(dueStatus("2026-07-15", "2026-06-09", 60).level).toBe("due-soon");
    expect(dueStatus("2026-12-09", "2026-06-09", 60).level).toBe("current");
  });
});
```
- [ ] **Step 2:** `pnpm test` → FAIL (not defined).
- [ ] **Step 3:** Implement using UTC date parsing (split "YYYY-MM-DD", `Date.UTC`) to avoid TZ drift. `daysUntil = round((target-now)/86400000)`. `dueStatus(due, now, soonDays)`: `<0 overdue`, `<=soonDays due-soon`, else current; return `{level, days}`. `ageFromBirthday` from y/m diff with month borrow.
- [ ] **Step 4:** `pnpm test` → PASS.
- [ ] **Step 5:** Commit `feat: date logic (age, daysUntil, dueStatus)`.

### Task 1.2: `lib/meds.ts` — today doses, daily reset, streak
**Files:** Create `lib/meds.ts`, Test `test/meds.test.ts`
- [ ] **Step 1: failing tests**
```ts
import { describe, it, expect } from "vitest";
import { dosesForToday, isCheckedToday, toggleDose, streak } from "@/lib/meds";
const med = { frequency: "twice daily" } as any;
it("twice daily => 2 dose slots", () => { expect(dosesForToday(med).length).toBe(2); });
it("daily reset: yesterday's checks don't count today", () => {
  const log = { "2026-06-08": [true, true] };
  expect(isCheckedToday(log, 0, "2026-06-09")).toBe(false);
});
it("toggleDose sets today's slot", () => {
  const log = toggleDose({}, 1, "2026-06-09");
  expect(log["2026-06-09"][1]).toBe(true);
});
it("streak counts consecutive fully-checked days up to today", () => {
  const log = { "2026-06-07":[true,true], "2026-06-08":[true,true], "2026-06-09":[true,true] };
  expect(streak(med, log, "2026-06-09")).toBe(3);
});
```
- [ ] **Step 2:** FAIL. **Step 3:** implement frequency→slot-count map (daily 1, twice daily 2, weekly/monthly/as-needed 1); streak walks back day-by-day requiring all slots true. **Step 4:** PASS. **Step 5:** Commit.

### Task 1.3: `lib/backup.ts` — export/import merge-with-defaults
**Files:** Create `lib/backup.ts`, Test `test/backup.test.ts`
- [ ] **Step 1:** tests: `mergePetDefaults({name:"Rex"})` fills missing arrays (`vaccines:[]`…) and `sitterSheet:{}`; `parseBackup(JSON.stringify(valid))` returns object; `parseBackup("{bad")` throws friendly Error.
- [ ] **Step 2-4:** implement defensive merge + try/catch parse. **Step 5:** Commit.

### Task 1.4: `lib/defaults.ts` — seeds (no test, data only)
- [ ] Common dog vaccines (rabies, DHPP, bordetella, lepto, lyme), cat (FVRCP, FeLV, rabies). Care-task seeds per species (dog: nail trim 21d, bath 30d, flea/tick 30d, heartworm 30d, teeth 7d; cat: nail trim 21d, litter deep-clean 7d, flea/tick 30d, teeth 7d; rabbit/bird/other: minimal). Expense categories. Commit.

---

## Phase 2 — Convex backend

### Task 2.1: schema
- [ ] `convex/schema.ts`: tables per spec with validators; indexes `pets.by_user`, child tables `.index("by_pet",["petId"])`. Commit.

### Task 2.2: Convex Auth (password)
- [ ] `convex/auth.ts` with `Password` provider; `auth.config.ts`; wrap mutations/queries with `getAuthUserId`. `users.ts`: `currentUser` query (creates user row on first call with `hasPaid:false`, default settings), `updateSettings` mutation. Commit.

### Task 2.3: pets CRUD + photo
- [ ] `pets.ts`: `listMine`, `get`, `create`, `update`, `remove` (cascade delete children), all scoped to authed user. `files.ts`: `generateUploadUrl`, store photoStorageId, `getPhotoUrl`. Commit.

### Task 2.4: child-table CRUD
- [ ] `vaccines.ts pets-scoped list/add/update/remove` keyed by petId + ownership check (load pet, assert userId). Repeat pattern for `medications`, `vetVisits`, `weights`, `careTasks`, `expenses`. Medications include `setDose` mutation (writes doseLog). Commit per file.

### Task 2.5: seed (`?demo=1`)
- [ ] `seed.ts` mutation `loadSamplePet` creating a fully populated pet (Cooper, dog) across all tables for the current user. Commit.

### Task 2.6: Stripe
- [ ] `app/api/stripe/checkout/route.ts`: create Checkout Session (mode `payment`, $1900, client_reference_id = convex user id, success/cancel URLs). `app/api/stripe/webhook/route.ts`: verify signature, on `checkout.session.completed` call Convex `stripe.markPaid` (internal mutation) by user id; store stripeCustomerId. `convex/stripe.ts`: `markPaid` internal mutation. Commit.

---

## Phase 3 — App shell, auth, gating

### Task 3.1: providers + middleware
- [ ] `app/layout.tsx`: `ConvexAuthNextjsServerProvider` + client provider. Middleware via `@convex-dev/auth/nextjs/server` protecting `/app`. Commit.

### Task 3.2: login / signup pages
- [ ] Warm branded auth forms calling Convex Auth `signIn("password", {flow})`. Error states. Redirect to `/app` on success. Commit.

### Task 3.3: app layout — gate + nav + pet switcher
- [ ] `app/app/layout.tsx`: load `currentUser` + `pets`. Sidebar nav (desktop) / bottom tab bar (<768px) with the 8 tabs. `PetSwitcher` avatar chips (photo or species emoji). Header: Back up my data / Restore backup buttons. If `!hasPaid`: render children under `LockOverlay` (allow 1 pet, block tab content beyond dashboard) with "Unlock everything – $19" → POST checkout. Onboarding: if no pets, 3-step add-pet flow. Commit.

---

## Phase 4 — The 8 tabs (build + in-browser verify each)

Each tab: reactive `useQuery` for data, mutations for writes, designed empty state w/ add button + paw motif, modal-based add/edit forms, optimistic-feeling check animations.

### Task 4.1: Dashboard
- [ ] Pet header card (photo/emoji, breed, `ageFromBirthday`, latest weight, microchip). "Needs attention" panel: gather vaccines(dueDate), meds(refillBy), careTasks(nextDue), vetVisits(followUpDate); map through `dueStatus`; show overdue+≤30d, sorted by date, red/amber chips. Quick-add buttons (open respective modals). `Sparkline` from weights. Commit.

### Task 4.2: Vaccines
- [ ] Table; add/edit modal w/ datalist autocomplete from `defaults`. `StatusChip` via `dueStatus(...,60)`. "Print vaccine record" → `/app/vaccines/print` style route or print-class layout (certificate). Empty-state copy mentions boarding/groomers. Commit.

### Task 4.3: Medications
- [ ] Active list; Today view per-dose checkboxes using `lib/meds` (writes doseLog via `setDose`), satisfying check animation, streak counter; collapsed archived section; archive/unarchive. Commit.

### Task 4.4: Vet visits
- [ ] Reverse-chron log; add/edit modal (cost → also creates an expense row category "vet"; followUpDate surfaces on Dashboard). Empty state suggests logging most recent visit. Commit.

### Task 4.5: Weight & growth
- [ ] Entry (date+weight, unit from settings); Chart.js line chart with note annotations; respects lb/kg. Commit.

### Task 4.6: Grooming & care
- [ ] Recurring tasks pre-seeded per species on pet create (or first visit); show last done + next due (`nextDue = lastDone + intervalDays`); "Done today" advances cycle; editable intervals; add custom task. Commit.

### Task 4.7: Expenses
- [ ] Entries (date/category/amount/note), month + year totals, bar chart by category, YoY comparison line; currency from settings. Commit.

### Task 4.8: Sitter Sheet (showpiece)
- [ ] Form: feeding (brand/amount/times), meds auto-pulled (plain-language), walk/litter routine, quirks, vet/owner/emergency contacts, microchip auto-filled. Saves to `pet.sitterSheet`. "Print sitter sheet" → polished one-page print layout with photo. Commit.

---

## Phase 5 — Backup, demo, landing, polish

### Task 5.1: Export / Import
- [ ] Header "Back up my data" downloads JSON of active pet (or all). "Restore backup" parses via `lib/backup` and writes through mutations (merge-with-defaults). Commit.

### Task 5.2: `?demo=1`
- [ ] On `/app?demo=1`, if user has no demo pet, call `loadSamplePet`. Commit.

### Task 5.3: Marketing landing `/`
- [ ] Editorial asymmetric hero: "If your emergency vet asked what meds your dog is on and when his last rabies shot was — could you answer in 10 seconds?" Feature sections w/ screenshots, sitter-sheet emphasis, $19 buy CTA (→ signup then checkout), paw motif, warm voice. Responsive. Commit.

### Task 5.4: Print stylesheet pass
- [ ] Verify Vaccines + Sitter Sheet each print one clean page; hide nav/buttons. Commit.

---

## Phase 6 — Deploy

### Task 6.1: Convex deploy (NEEDS USER: convex login)
- [ ] `npx convex dev` (device login) → provisions dev deployment, sets `NEXT_PUBLIC_CONVEX_URL`.

### Task 6.2: Stripe wiring (NEEDS USER: test keys + webhook secret)
- [ ] Put `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price/amount in env. Test full checkout in Stripe test mode.

### Task 6.3: GitHub + Vercel (agodbolt already authed)
- [ ] `gh repo create agodbolt/pet-health-binder --public --source=. --push`. `vercel link` + `vercel env add` (Convex + Stripe) + deploy. Set Convex prod deploy + Vercel build command `npx convex deploy && next build`.

---

## Self-review notes
- Spec coverage: all 8 tabs (4.1–4.8), payment gate (2.6/3.3), auth (2.2/3.2), multi-device (Convex reactive), backup (5.1), demo (5.2), print (4.2/4.8/5.4), design tokens (0.2/5.3). ✓
- Human roadblocks isolated to Phase 6 (Convex login, Stripe keys). Everything in Phases 0–5 is buildable without user input.

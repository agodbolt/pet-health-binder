# Pet Health Binder — Design Spec

Date: 2026-06-09
Status: Approved (user directed autonomous build)

## Summary

A multi-device, cloud-synced pet health & care dashboard sold as a one-time
$19 digital product. Dog/cat (and rabbit/bird/other) owners keep vaccines,
meds, vet visits, weight, grooming, expenses, and a printable sitter sheet in
one place that syncs across their laptop and phone. Not tech-savvy users;
warm, calming, hand-crafted design — explicitly NOT clinical and NOT
generic-AI-looking.

## Key decisions (locked)

- **Payment:** one-time **$19** via Stripe Checkout. Built in **test mode** first.
- **Auth:** email + password (Convex Auth password provider).
- **Scope:** all 8 tabs in v1.
- **Backup buttons:** keep Export/Import JSON as a trust-signal safety net even
  though cloud is the source of truth.

## Architecture

Single Next.js (App Router) app deployed to Vercel from GitHub (`agodbolt`).

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js App Router on Vercel | SSR marketing page + client app; GitHub→Vercel auto-deploy |
| Backend/DB/sync | Convex | Reactive queries → automatic multi-device sync, no manual refresh logic |
| Auth | Convex Auth (password provider) | Email+password, native to Convex |
| Payments | Stripe Checkout (one-time) + webhook → Convex | Webhook flips `users.hasPaid` |
| Photos | Convex file storage | Real URLs instead of base64-in-DB |

### Routes
- `/` — marketing landing page (sells the emergency-vet angle, $19 buy CTA).
- `/login`, `/signup` — auth.
- `/app` and `/app/[tab]` — the binder, gated behind auth + payment.
- `/api/stripe/webhook` — Stripe webhook receiver → Convex mutation.

### Access gating
- Not logged in → redirect to `/login`.
- Logged in, `!hasPaid` → app renders with a locked overlay; user may create 1
  pet to try it; CTA "Unlock everything – $19" → Stripe Checkout.
- `hasPaid` → full access on all devices.

## Data model (Convex tables)

- `users`: authId, email, hasPaid (bool), stripeCustomerId?, settings
  {weightUnit: "lb"|"kg", currency: string, activePetId?}.
- `pets`: userId, name, species ("dog"|"cat"|"rabbit"|"bird"|"other"), breed,
  birthday, microchip, photoStorageId?, sitterSheet (embedded object), createdAt.
- `vaccines`: petId, name, dateGiven, dueDate?, clinic, lot?, notes.
- `medications`: petId, name, dose, frequency, startDate, endDate?, ongoing,
  refillBy?, vet, notes, archived (bool), doseLog {date: string -> count/checked}.
- `vetVisits`: petId, date, clinic, reason, diagnosis, treatment, cost?,
  followUpDate?, notes.
- `weights`: petId, date, weight (number), note?.
- `careTasks`: petId, name, intervalDays, lastDone?, notes.
- `expenses`: petId, date, category, amount, note?.

All child tables key off `petId` (separate tables, not embedded arrays) for
clean indexed queries and per-row reactivity. Indexes: by_user (pets),
by_pet (all child tables).

## Features (8 tabs — full original spec)

1. **Dashboard** — per-pet header card (photo/emoji, breed, auto-age from
   birthday, latest weight, microchip), "Needs attention" panel (overdue +
   due-in-30-days across vaccines/meds/grooming/vet follow-ups, color-coded
   red/amber, date-sorted), quick-add buttons, mini weight sparkline.
2. **Vaccines** — table w/ autocomplete common vaccines, dateGiven, dueDate,
   clinic, lot, notes; status chip (✅ current / ⚠️ due ≤60d / ❌ overdue);
   "Print vaccine record" → certificate-style one-page print.
3. **Medications** — active list (name/dose/frequency/dates/refillBy/vet/notes);
   Today view with per-dose checkboxes that reset daily (lastCheckedDate) +
   streak counter; collapsed archived section.
4. **Vet visits** — reverse-chron log; cost feeds Expenses, followUpDate feeds
   Needs Attention.
5. **Weight & growth** — date+weight entry (unit pref), Chart.js line chart with
   note annotations.
6. **Grooming & care** — recurring tasks w/ custom intervals, pre-seeded per
   species, editable; last done + next due; one-click "Done today" advances cycle.
7. **Expenses** — entries (date/category/amount/note), month+year totals, bar
   chart by category, YoY comparison; currency setting.
8. **Sitter Sheet** (showpiece) — assembles a one-page printable care sheet:
   feeding, meds (plain-language), walk/litter routine, quirks, vet + owner +
   emergency-vet contacts, microchip; auto-fills from existing data; polished
   print layout with pet photo.

Plus: Export ("Back up my data") / Import ("Restore backup") JSON in header;
`?demo=1` loads a fully-populated sample pet for screenshots.

## Design language ("not AI-built")

- Fonts: Fraunces (headings) + Inter (body) via next/font.
- Palette: cream #FAF7F2, forest #2D5A4A, terracotta #D97B5D, charcoal text.
- Rounded-2xl cards, soft shadows, generous whitespace.
- Sidebar nav on desktop → bottom tab bar < 768px.
- Hand-drawn paw/texture motif, editorial asymmetric landing layout, custom
  empty-state illustrations, warm microcopy (no Lorem ipsum, no generic
  icon-grids), tasteful check microinteractions.
- Dedicated print stylesheet: Vaccines + Sitter Sheet each print as one clean
  black-on-white page, nav/buttons hidden.

## Logic to test (TDD where it counts)

- Date math: age from birthday across year boundaries; "due in 30/60 days" and
  "overdue" classification; care-task next-due from interval + lastDone.
- Med Today view daily reset + streak counter.
- Payment gating (hasPaid flips access).
- Defensive load: missing keys merge with defaults (import + schema evolution).

## Build / verify

- Stripe test mode end-to-end (clickable purchase, no real charges).
- Create 2 pets, populate every tab, reload → persists (cloud).
- Export → import round-trips identical state.
- Print preview of Vaccines + Sitter Sheet fit one page.
- No console errors; verified in-browser before done.

## External dependencies / human roadblocks

- **Convex** account/login (`npx convex dev` device auth) — needed to deploy backend.
- **Stripe** test API keys + webhook signing secret.
- GitHub (`agodbolt`) and Vercel (`agodbolt`) already authenticated.

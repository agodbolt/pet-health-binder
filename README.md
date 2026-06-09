# 🐾 Pet Health Binder

A warm, multi-device pet health & care dashboard sold as a one-time **$19**
digital product. Keep vaccines, medications, vet visits, weight, grooming,
expenses, and a printable sitter sheet for every pet — synced across laptop,
tablet, and phone.

Built with **Next.js (App Router)** + **Convex** (database, reactive sync &
auth) + **Stripe** (one-time purchase). The front-end is a warm, hand-crafted
design (Fraunces + Inter; cream / forest / terracotta) — intentionally not
clinical.

## Features

- **8 tabs:** Dashboard (needs-attention engine + weight sparkline), Vaccines
  (status chips + printable certificate), Medications (daily checklist + streak
  + archive), Vet visits, Weight (chart), Grooming (recurring care), Expenses
  (totals + category chart + YoY), and the **Sitter Sheet** (auto-filled,
  printable care sheet).
- **Multi-pet**, multi-device cloud sync, email + password auth.
- **One-time $19** unlock via Stripe Checkout; the dashboard is a free teaser.
- **Back up / restore** your whole binder as JSON.
- `?demo=1` loads a fully-populated sample pet (Cooper) for screenshots.

## Local development

```bash
pnpm install
npx convex dev          # provisions a dev deployment, writes .env.local, watches functions
# in a second terminal:
pnpm dev                # Next.js dev server
```

First-time auth setup (once per deployment):

```bash
npx @convex-dev/auth --web-server-url http://localhost:3000
```

### Stripe (test mode)

Set these on the **Convex** deployment (they power the checkout action + webhook):

```bash
npx convex env set STRIPE_SECRET_KEY sk_test_xxx
npx convex env set STRIPE_WEBHOOK_SECRET whsec_xxx
```

Point a Stripe webhook at `https://<your-deployment>.convex.site/stripe/webhook`
for the `checkout.session.completed` event.

## Testing

```bash
pnpm test        # vitest — pure logic (dates, meds/streaks, backup)
pnpm build       # full production build + typecheck
```

## Deploy

GitHub → Vercel. Set the Vercel **build command** to:

```bash
npx convex deploy --cmd 'pnpm build'
```

and add `CONVEX_DEPLOY_KEY` (from the Convex dashboard) to Vercel. Set the
production `SITE_URL` and Stripe keys on the Convex **prod** deployment.

## Notes

- Not a substitute for veterinary advice.
- All data is private to each user's account.

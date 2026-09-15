# EarnForge

Get-Paid-To platform: verified internal tasks → immutable points ledger → payout requests → admin review.

Read **[DESCRIPTION.md](./DESCRIPTION.md)** for what this app is. Read **[AUDIT.md](./AUDIT.md)** for what was fixed and what is still open.

## Run locally

```bash
npm install
npx prisma generate
npm run db:push
npx tsx prisma/seed.ts
npm run dev
```

Demo earner (after seed): `demo@earnforge.app` / `demo1234`  
Admin password comes from seed / `.env` — change it before any public deploy.

## Stack

Next.js App Router, TypeScript, Prisma, SQLite (Postgres for production), jose JWT httpOnly cookies, Stripe stubs, Tailwind.

## Status

- Core earn → ledger → payout request loop: **implemented**
- Session-bound actions + admin role in JWT: **fixed 2026-09-15**
- Live payouts to PayPal/crypto: **not wired** (admin fulfillment)
- Live Stripe Pro: **code present, needs keys + webhook**
- Revenue / users: **none yet**

Sales / launch notes: [SELL.md](./SELL.md) · [GET-PAID.md](./GET-PAID.md) · [LISTINGS.md](./LISTINGS.md)

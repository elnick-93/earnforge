# EarnForge — What This App Is

## One sentence
EarnForge is a Get-Paid-To web app: people complete short verified tasks, earn points on an immutable ledger, and request cash-style payouts that an admin reviews.

## Who it is for
- **Earners** who want a Swagbucks / Freecash-style side-income product.
- **Advertisers** who fund campaigns (budget + CPA points) from a dedicated surface.
- **Operators / buyers** who want a typed codebase they can brand, point at Postgres + Stripe, and launch.

## What a user actually does
1. Signs up with email + password (optional referral code).
2. Lands on a dashboard showing balance, tasks, and referral code.
3. Completes internal tasks: survey with attention check, video-recall quiz, tap game with score/time checks, daily/micro tasks.
4. Server validates the attempt, writes a TaskCompletion, credits the ledger, updates `currentPoints`.
5. Referrer can receive a 10% share of those points.
6. Earner requests a payout (min 300 points, 8% fee, method + destination).
7. Admin sees the queue and marks paid or rejects (reject should refund — verify in admin UI before promising).
8. Optional Pro upgrade via Stripe checkout + webhook stubs.

## What is actually built
- Next.js App Router + TypeScript + Prisma + SQLite (swap to Postgres for prod)
- Auth: bcrypt + jose JWT in an httpOnly cookie
- Roles: EARNER / ADVERTISER / ADMIN (role now lives in the JWT)
- EarningsLedger (append-only point movements)
- Task + TaskCompletion with fraudScore
- PayoutRequest lifecycle
- Referral records
- Admin page, advertiser page, marketing landing HTML
- Stripe create-checkout + webhook routes (need live keys)
- In-memory rate limit helper (not Redis)

## What it is not (yet)
- Not a live business with users or MRR
- Not connected to PayPal, Bitcoin rails, or gift-card issuers — destination is stored text; fulfillment is operational
- Not an offer-wall network (no third-party postbacks)
- Not KYC-complete (schema fields exist; no document upload flow)
- Not multi-region / tax-form automation
- Demo video player is a placeholder box, not a real video CDN

## Honest commercial frame
You are selling or launching a **productized codebase** with a real money path (earn → ledger → payout request → admin). Revenue starts after Stripe, a payout processor, tasks, and distribution are live.

Repo: https://github.com/elnick-93/earnforge

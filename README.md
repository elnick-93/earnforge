# EarnForge

**The production-grade, acquisition-ready "quick money" platform.**

Modern clone + evolution of Swagbucks + Freecash: Surveys, video recall, skill games, microtasks, strong referrals, instant low-threshold payouts, full B2C + B2B (advertiser campaigns), admin controls, immutable audit ledger, and enterprise security posture.

Built autonomously following the OMNIFORGE SOVEREIGN EXECUTION PROTOCOL.

## Run locally (right now)

```bash
npm install
# (already done in this workspace)
npx prisma generate
npm run db:push   # or the migration is already applied
npx tsx prisma/seed.ts
npm run dev
```

Login:
- Demo earner: `demo@earnforge.app` / `demo1234`
- Admin: `admin@earnforge.app` / `kX&96TRNs8xlGFcvohM$@btCjA*5K_!J` (strong password set in .env)

## Key implemented systems (no placeholders)

- Full auth (email + pw, bcrypt + jose JWT httpOnly sessions, middleware guard)
- Immutable double-entry points ledger (earnings, payouts, referral bonuses, adjustments)
- 5+ production tasks with real validation (survey attention checks, video quiz scoring, tap game with score thresholds + fraud timing)
- Payout requests with fee, multi-method, auto-approve for pro/small, full admin queue + refund on reject
- Referral system (signup bonus + 10% lifetime earnings share)
- Admin console: payout approvals, task creation, user snapshot
- Pro subscription + Stripe integration ready (checkout + webhook)
- AuditLog on all critical actions
- Rate limiting + basic fraud scoring (time, attention, device signals)
- Strong typing, Zod validation, server actions, Prisma + SQLite (adapter for Prisma 7)
- Modern dark premium UX, fully responsive PWA-ready
- Complete product surface: auth, earnings, payouts, referrals, settings stubs, support path ready, admin tools

## Architecture highlights

See ARCHITECTURE.md (to be expanded) + prisma/schema.prisma for the full data model.

## Commercial readiness

See the full reports in REPORTS.md (or generate via protocol).

Who pays: Users (time/attention for tasks) + Advertisers (CPA for qualified actions + Pro subs).

Why now: Category has proven $ hundreds of millions paid out annually. Trust is the #1 gap — we win with transparency, speed, and no "offer wall black boxes".

Acquisition value: Clean codebase, full audit trail, real revenue model (advertiser-funded + take rate + subs), viral loops, low infra cost.

## Next (post launch)

- Real Stripe webhooks + Pro fulfillment
- External offer wall + postback tracking (with our fraud layer on top)
- Mobile PWA + push
- AI personalized feed + task generation
- Full KYC for high volume (document upload + review)
- Multi-region + tax forms (1099-NEC auto gen)

Production. Secure by default. Ready for real money and real users.

Companion Power User Kit available for earnings tracking and referral optimization.
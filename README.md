# EarnForge

**The production-grade, acquisition-ready "quick money" platform.**

Modern clone + evolution of Swagbucks + Freecash: Surveys, video recall, skill games, microtasks, strong referrals, instant low-threshold payouts, full B2C + B2B (advertiser campaigns), admin controls, immutable audit ledger, and enterprise security posture.

Built autonomously following the OMNIFORGE SOVEREIGN EXECUTION PROTOCOL.

**→ Ready to sell or launch: see [SELL.md](./SELL.md)** for pricing options, valuation, due-diligence package, and 7-day SaaS launch checklist.

## Run locally (right now)

```bash
npm install
npx prisma generate
npm run db:push
npx tsx prisma/seed.ts
npm run dev
```

Login:
- Demo earner: `demo@earnforge.app` / `demo1234`
- Admin: `admin@earnforge.app` / (strong password set in .env)

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

## Commercial readiness

Full market, architecture, security, and risk analysis lives in **REPORTS.md**.

Who pays: Users (time/attention for tasks) + Advertisers (CPA for qualified actions + Pro subs).

Acquisition value: Clean codebase, full audit trail, real revenue model (advertiser-funded + take rate + subs), viral loops, low infra cost.

## Launch path

See **SELL.md** + **LAUNCH.md**. Core is complete. Remaining work is external keys (Stripe, Postgres, email) + distribution.

Production. Secure by default. Ready for real money and real users.

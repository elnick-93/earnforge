# EarnForge audit (2026-09-15)

## Fixed this pass
- JWT now includes `role`. Previously middleware read `payload.role` but tokens only had `sub` — **admins could not pass the admin gate**.
- Server actions no longer trust client-supplied `userId`. Earnings and payouts bind to `requireUser()` session. That was an IDOR / privilege bug.
- Pro payouts no longer auto-flip to `PAID` with a fake `AUTO-` tx ref. All payouts stay `PENDING` until a human or a real processor acts.
- `/advertiser` is now behind auth + role.
- Task/payout actions rate-limited per user.

## Still open (do not paper over)
- `prisma/dev.db` was committed historically — rotate any demo passwords after clone; keep DBs out of git.
- Default JWT secret exists for local dev. Production must set `JWT_SECRET`.
- Rate limit is in-memory (resets on deploy; not shared across Vercel instances).
- Stripe webhook must be verified with live `STRIPE_WEBHOOK_SECRET` before taking money.
- No automated test suite.
- No ToS / privacy / age-gate pages in the app router (add before public traffic).
- Game tap scoring is client-reported; server only has coarse time checks.
- `completeTaskAction` still accepts answers JSON from the client — expected for this product, but not cheat-proof against a modified client.

## Verdict
Core loop is real. Security posture is now closer to shippable for a **closed beta**. Not "enterprise complete." Not live-revenue complete until keys + payout rail + legal pages exist.

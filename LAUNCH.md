**Full detailed launch guide is maintained in the companion workspace repo (grok-money-now-forever) under LAUNCH-EARNFORGE.md.**

This is a quick mirror of the critical path.

See the complete version + updates here: https://github.com/elnick-93/grok-money-now-forever/blob/main/LAUNCH-EARNFORGE.md

## Fastest path to live
1. Local verification (see README + LAUNCH-EARNFORGE.md)
2. Set strong JWT_SECRET + real Stripe test keys + webhook secret
3. Switch schema to postgresql + set DATABASE_URL
4. prisma migrate + seed
5. Deploy to Vercel (connect this repo), add env vars
6. Update Stripe webhook to production URL
7. Seed real tasks as admin
8. Launch with proof posts + Power User Kit as lead magnet

Revenue paths (Pro subs + advertiser funding) activate as soon as Stripe webhooks are live.
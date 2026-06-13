import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Support real Stripe events + demo simulation from success page
    let session: any
    let meta: any

    if (event.type === 'checkout.session.completed') {
      session = event.data.object
      meta = session.metadata || {}
    } else if ((event as any).type === 'checkout.session.completed' && (event as any).data?.object) {
      // Demo simulation payload
      session = (event as any).data.object
      meta = session.metadata || {}
    } else {
      return NextResponse.json({ received: true })
    }

    const userId = meta.userId || 'demo' // fallback for local test
    const type = meta.type

    if (!userId) return NextResponse.json({ received: true })

    if (type === 'pro') {
      const expires = new Date()
      expires.setMonth(expires.getMonth() + 1)

      await prisma.user.update({
        where: { id: userId },
        data: { isPro: true, proExpiresAt: expires },
      })

      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'PRO_UPGRADED',
          entity: 'User',
          entityId: userId,
          meta: JSON.stringify({ stripeSession: session.id || 'demo' }),
        },
      })
    }

    if (type === 'campaign_fund') {
      const amountUSD = parseFloat(meta.amountUSD || '50')
      const title = meta.campaignTitle || 'Paid Campaign'

      await prisma.campaign.create({
        data: {
          advertiserId: userId,
          title,
          description: `Funded via Stripe $${amountUSD}`,
          budgetUSD: amountUSD,
          spentUSD: 0,
          cpaPoints: 280,
          isActive: true,
        },
      })

      await prisma.task.create({
        data: {
          title: `${title} - Premium Offer`,
          description: 'High-value paid task funded by advertiser. Complete for boosted points.',
          category: 'OFFER',
          pointsReward: 420,
          timeEstMinutes: 6,
          requirements: JSON.stringify({ type: 'paid_offer', funded: true }),
          dailyCap: 3,
          isActive: true,
        },
      })

      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'CAMPAIGN_FUNDED',
          entity: 'Campaign',
          meta: JSON.stringify({ amount: amountUSD, session: session.id || 'demo' }),
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Webhook handling error', e)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

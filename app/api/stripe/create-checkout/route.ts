import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['pro', 'campaign_fund']),
  amountUSD: z.number().min(5).max(10000).optional(),
  campaignTitle: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const { type, amountUSD, campaignTitle } = schema.parse(body)

    const session = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      type,
      amountUSD,
      campaignTitle,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('Stripe checkout error', e)
    return NextResponse.json({ error: e.message || 'Failed to create checkout' }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession, checkRateLimit, getClientIp } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional(),
  refCode: z.string().optional(),
})

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`signup:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { email, password, name, refCode } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const passwordHash = await hashPassword(password)
    const referralCode = generateReferralCode()

    let referredById: string | undefined
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode.toUpperCase() } })
      if (referrer) referredById = referrer.id
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        referralCode,
        referredById,
        currentPoints: 0,
      },
    })

    // Welcome + referral bonuses via ledger (immutable)
    const welcome = 150
    await prisma.$transaction(async (tx) => {
      await tx.earningsLedger.create({
        data: {
          userId: user.id,
          type: 'EARN',
          amount: welcome,
          balanceAfter: welcome,
          description: 'Welcome bonus',
          reference: 'welcome',
        },
      })
      await tx.user.update({ where: { id: user.id }, data: { currentPoints: welcome } })

      if (referredById) {
        // Credit referrer
        const bonus = 250
        const refRec = await tx.referral.create({
          data: {
            referrerId: referredById,
            referredId: user.id,
            signupBonus: bonus,
          },
        })
        const refUser = await tx.user.findUnique({ where: { id: referredById } })
        const newBal = (refUser?.currentPoints || 0) + bonus
        await tx.earningsLedger.create({
          data: {
            userId: referredById,
            type: 'REFERRAL_BONUS',
            amount: bonus,
            balanceAfter: newBal,
            description: 'Referral signup bonus',
            reference: refRec.id,
          },
        })
        await tx.user.update({ where: { id: referredById }, data: { currentPoints: newBal } })
      }
    })

    await createSession(user.id, ip, req.headers.get('user-agent') || undefined)

    // Audit
    await prisma.auditLog.create({
      data: { actorId: user.id, action: 'USER_REGISTER', entity: 'User', entityId: user.id, ip },
    })

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Signup failed' }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, checkRateLimit, getClientIp } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`login:${ip}`, 12, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again soon.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { email, password } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid credentials')

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) throw new Error('Invalid credentials')

    await createSession(user.id, ip, req.headers.get('user-agent') || undefined)

    await prisma.auditLog.create({
      data: { actorId: user.id, action: 'USER_LOGIN', entity: 'User', entityId: user.id, ip },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 401 })
  }
}

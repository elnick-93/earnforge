import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-prod-now'
)

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: string
  currentPoints: number
  isPro: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string, ip?: string, userAgent?: string) {
  const token = await new SignJWT({ sub: userId, iat: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  // Optional persistent session row for audit/revoke
  try {
    await prisma.session.create({
      data: {
        userId,
        token: token.substring(0, 32), // store prefix only for lookup
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ip: ip || null,
        userAgent: userAgent || null,
      },
    })
  } catch {}

  const cookieStore = await cookies()
  cookieStore.set('earnforge_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return token
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('earnforge_session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string
    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        currentPoints: true,
        isPro: true,
      },
    })

    if (!user) return null
    return user as AuthUser
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireRole(roles: string[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN')
  return user
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('earnforge_session')
}

// Simple in-memory rate limit for actions (prod: use Redis/Upstash)
const rateMap = new Map<string, { count: number; reset: number }>()

export function checkRateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || entry.reset < now) {
    rateMap.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export function getClientIp(req?: NextRequest): string {
  if (req) {
    return (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1').split(',')[0].trim()
  }
  return '127.0.0.1'
}

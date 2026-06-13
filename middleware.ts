import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-prod-now'
)

const PROTECTED = ['/dashboard', '/admin', '/payouts', '/settings', '/earn']
const ADMIN = ['/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p))
  if (!needsAuth) return NextResponse.next()

  const token = req.cookies.get('earnforge_session')?.value
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = (payload as any).role || 'EARNER'

    if (ADMIN.some((p) => pathname.startsWith(p)) && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  } catch {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/payouts/:path*', '/settings/:path*', '/earn/:path*'],
}

import Link from 'next/link'
import { getCurrentUser, clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  async function logout() {
    'use server'
    await clearSession()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold tracking-tight text-xl flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded" /> EarnForge
            </Link>
            <nav className="flex gap-5 text-zinc-400">
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/dashboard#earn" className="hover:text-white">Earn</Link>
              <Link href="/dashboard#payouts" className="hover:text-white">Payouts</Link>
              {user.role === 'ADMIN' && <Link href="/admin" className="hover:text-white text-amber-400">Admin</Link>}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-emerald-400 font-mono text-sm points">{user.currentPoints.toLocaleString()} pts</div>
              <div className="text-[10px] text-zinc-500 -mt-0.5">{user.isPro ? 'PRO' : 'Free'} • {user.email}</div>
            </div>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost text-xs px-3 py-1">Logout</button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">{children}</main>
      <footer className="text-center text-[10px] text-zinc-600 py-4 border-t border-zinc-800">EarnForge • Production ready • Secure by default • Full audit trail</footer>
    </div>
  )
}

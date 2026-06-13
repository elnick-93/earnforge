import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Award } from 'lucide-react'
import EarnTask from './EarnTask'
import PayoutForm from './PayoutForm'
import UpgradeButton from './UpgradeButton'
import { completeTaskAction, requestPayoutAction } from '../actions'

export default async function Dashboard() {
  try {
    const user = await getCurrentUser()
    if (!user) redirect('/login')

  const tasks = await prisma.task.findMany({ where: { isActive: true }, orderBy: { pointsReward: 'desc' } })
  const recentLedger = await prisma.earningsLedger.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
  const myPayouts = await prisma.payoutRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const myReferrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    include: { referred: { select: { email: true, createdAt: true } } },
  })

  return (
    <div className="space-y-10">
      {/* Header stats */}
      <div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-emerald-500 font-medium">WELCOME BACK{user.name ? ', ' + user.name.split(' ')[0] : ''}</div>
            <div className="text-5xl font-semibold tracking-tighter points">{user.currentPoints.toLocaleString()} <span className="text-3xl text-zinc-500">points</span></div>
            <div className="text-zinc-400">≈ ${(user.currentPoints / 100).toFixed(2)} USD • {user.isPro ? 'PRO MEMBER' : 'Free tier — upgrade for 1.5x rates'}</div>
          </div>
          <div className="text-right text-sm">
            <div className="text-emerald-400">Referral code: <span className="font-mono text-white">{user.id.slice(0,4).toUpperCase()}{user.id.slice(-4).toUpperCase()}</span></div>
            <div className="text-zinc-500">Share it. Earn 10% forever + $2.50 signup bonus each.</div>
          </div>
        </div>
      </div>

      {/* Quick actions + referrals */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-2">
          <div className="font-semibold mb-3 flex items-center gap-2"><Award size={18} className="text-emerald-500" /> Your recent earnings</div>
          <div className="space-y-1 text-sm">
            {recentLedger.length === 0 && <div className="text-zinc-500">Complete your first task to see ledger entries here.</div>}
            {recentLedger.map((l, i) => (
              <div key={i} className="ledger-row flex justify-between border-b border-zinc-800 py-1 last:border-0">
                <span className="text-zinc-400">{new Date(l.createdAt).toLocaleDateString()} — {l.description}</span>
                <span className={l.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {l.amount >= 0 ? '+' : ''}{l.amount} → {l.balanceAfter}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="font-semibold mb-3">Referral performance</div>
          <div className="text-3xl font-semibold">{myReferrals.length} <span className="text-base text-zinc-500">friends joined</span></div>
          <div className="text-emerald-400 text-sm mt-1">+{myReferrals.reduce((s, r) => s + r.totalEarned, 0)} pts earned from referrals</div>
          <div className="mt-4 text-xs text-zinc-500">Your personal link: /signup?ref={user.id.slice(0,8).toUpperCase()}</div>
        </div>
      </div>

      {/* Earn section */}
      <div id="earn">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="uppercase tracking-[2px] text-emerald-500 text-xs font-medium">TODAY'S OPPORTUNITIES</div>
            <div className="text-3xl font-semibold tracking-tight">Complete tasks • Get paid</div>
          </div>
          <div className="text-xs text-zinc-500">All verified • Most auto-approved</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <EarnTask key={task.id} task={task} onComplete={completeTaskAction} userId={user.id} userPoints={user.currentPoints} />
          ))}
        </div>
      </div>

      {/* Monetization / Upgrade */}
      <div className="card p-6 border-emerald-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="uppercase tracking-widest text-emerald-500 text-xs">REAL REVENUE MODE</div>
            <div className="text-2xl font-semibold">Upgrade to Pro — $9.99/mo</div>
          </div>
          <UpgradeButton />
        </div>
        <div className="text-sm text-zinc-400">
          1.5x points on all tasks • Instant auto-approval for payouts under $20 • Priority high-value offers • No ads. 
          <span className="text-emerald-400"> This charges real money via Stripe (use test card 4242... for demo).</span>
        </div>
      </div>

      {/* Payouts */}
      <div id="payouts" className="pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <div className="text-3xl font-semibold tracking-tight">Cash out</div>
          <div className="text-xs px-3 py-1 rounded bg-zinc-900 border border-zinc-800">8% transparent fee • Pro members get lower thresholds + auto-approve</div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <PayoutForm onSubmit={requestPayoutAction} userId={user.id} currentPoints={user.currentPoints} isPro={user.isPro} />
          </div>
          <div className="lg:col-span-3 card p-6">
            <div className="font-medium mb-3">Your payout history</div>
            {myPayouts.length === 0 && <div className="text-sm text-zinc-500">No requests yet. Complete tasks and cash out above.</div>}
            <table className="table text-sm">
              <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {myPayouts.map(p => (
                  <tr key={p.id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="points">{p.amountPoints} pts (${p.amountUSD})</td>
                    <td>{p.method}</td>
                    <td><span className={`badge ${p.status === 'PAID' ? 'badge-green' : p.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-zinc-600 pt-8 border-t border-zinc-900">
        All actions are logged. Fraudulent completions are rejected and may result in account review. Pro tip: Be consistent and honest for higher daily limits and faster auto-approvals.
      </div>
    </div>
  )
  } catch (error) {
    console.error('Dashboard server render error:', error)
    return (
      <div className="p-8 text-red-500">
        Server error loading dashboard. Check the dev server console (PowerShell window) for the full stack trace.
        <br />
        Error: {error instanceof Error ? error.message : String(error)}
        <br />
        Try re-logging in with the demo button or restarting the dev server.
      </div>
    )
  }
}

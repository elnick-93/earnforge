import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function approvePayout(formData: FormData) {
  'use server'
  await requireRole(['ADMIN'])
  const id = String(formData.get('id'))
  const action = String(formData.get('action')) // APPROVE or REJECT

  const req = await prisma.payoutRequest.findUnique({ where: { id } })
  if (!req || req.status !== 'PENDING') return

  const newStatus = action === 'APPROVE' ? 'PAID' : 'REJECTED'

  await prisma.$transaction(async (tx) => {
    await tx.payoutRequest.update({
      where: { id },
      data: { status: newStatus, processedAt: new Date(), processedBy: 'ADMIN', txRef: action === 'APPROVE' ? 'MANUAL-' + Date.now() : undefined },
    })

    if (newStatus === 'REJECTED') {
      // Refund
      const user = await tx.user.findUnique({ where: { id: req.userId } })
      if (user) {
        const refundBal = user.currentPoints + req.amountPoints
        await tx.earningsLedger.create({
          data: {
            userId: req.userId,
            type: 'ADJUST_CREDIT',
            amount: req.amountPoints,
            balanceAfter: refundBal,
            description: `Refund for rejected payout ${id}`,
            reference: id,
          },
        })
        await tx.user.update({ where: { id: req.userId }, data: { currentPoints: refundBal } })
      }
    }
  })

  revalidatePath('/admin')
}

async function createTask(formData: FormData) {
  'use server'
  await requireRole(['ADMIN'])
  const title = String(formData.get('title'))
  const points = parseInt(String(formData.get('points')))
  const category = String(formData.get('category'))
  const time = parseInt(String(formData.get('time') || '5'))

  await prisma.task.create({
    data: {
      title,
      description: String(formData.get('desc') || 'Admin created task'),
      category,
      pointsReward: points,
      timeEstMinutes: time,
      requirements: JSON.stringify({ type: 'admin', note: 'Manually reviewed' }),
      dailyCap: 3,
      isActive: true,
    },
  })
  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export default async function Admin() {
  await requireRole(['ADMIN'])

  const pendingPayouts = await prisma.payoutRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { email: true, currentPoints: true } } },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })

  const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, email: true, role: true, currentPoints: true, createdAt: true } })
  const activeTasks = await prisma.task.findMany({ where: { isActive: true }, take: 10 })

  return (
    <div className="space-y-10">
      <div>
        <div className="uppercase text-xs tracking-[3px] text-amber-500">SOVEREIGN CONTROL</div>
        <div className="text-4xl font-semibold tracking-tighter">Admin Console</div>
      </div>

      {/* Pending Payouts Queue */}
      <div>
        <div className="font-semibold mb-3 text-lg">Payout Approval Queue ({pendingPayouts.length})</div>
        <div className="card overflow-x-auto">
          <table className="table text-sm min-w-[720px]">
            <thead><tr><th>User</th><th>Amount</th><th>Method / Dest</th><th>Requested</th><th>Action</th></tr></thead>
            <tbody>
              {pendingPayouts.length === 0 && <tr><td colSpan={5} className="text-zinc-500 py-6 text-center">No pending payouts. System healthy.</td></tr>}
              {pendingPayouts.map(p => (
                <tr key={p.id}>
                  <td>{p.user.email}</td>
                  <td className="points">{p.amountPoints} pts (${p.amountUSD}) <span className="text-[10px] text-zinc-500">fee {p.feePoints}</span></td>
                  <td className="font-mono text-xs">{p.method}<br />{p.destination}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td>
                    <form action={approvePayout} className="flex gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <button name="action" value="APPROVE" className="btn btn-primary text-xs px-3 py-1">Approve & Pay</button>
                      <button name="action" value="REJECT" className="btn text-xs px-3 py-1 border border-red-900 text-red-400">Reject + Refund</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Revenue: Fund Campaign + Create Task */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 border-emerald-900">
          <div className="font-semibold mb-2 text-emerald-400">REAL MONEY IN — Fund Campaign (Stripe)</div>
          <p className="text-xs text-zinc-400 mb-4">Businesses pay you real money to run paid offers. This creates budget + auto high-value task.</p>
          
          <form onSubmit={async (e) => {
            e.preventDefault()
            const form = e.currentTarget
            const title = (form.elements.namedItem('title') as HTMLInputElement).value
            const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value)
            
            try {
              const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'campaign_fund', amountUSD: amount, campaignTitle: title }),
              })
              const data = await res.json()
              if (data.url) {
                window.location.href = data.url
              } else {
                // Fallback for no keys / local demo: directly fund + create task
                alert('Stripe not configured yet (or test mode). Using local revenue simulation: Campaign funded + paid task created.')
                await fetch('/api/stripe/webhook', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    type: 'checkout.session.completed', 
                    data: { 
                      object: { 
                        metadata: { 
                          userId: 'current', 
                          type: 'campaign_fund', 
                          amountUSD: String(amount), 
                          campaignTitle: title 
                        } 
                      } 
                    } 
                  })
                })
                window.location.reload()
              }
            } catch (err) {
              alert('Using local demo funding (no real Stripe keys yet). Campaign + task created in simulation.')
              await fetch('/api/stripe/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  type: 'checkout.session.completed', 
                  data: { 
                    object: { 
                      metadata: { userId: 'current', type: 'campaign_fund', amountUSD: String(amount), campaignTitle: title } 
                    } 
                  } 
                })
              })
              window.location.reload()
            }
          }} className="space-y-3 text-sm">
            <input name="title" placeholder="Campaign name (e.g. New App Installs)" className="input" required defaultValue="High Value App Installs" />
            <div className="flex gap-3">
              <input name="amount" type="number" step="5" placeholder="Amount USD" className="input flex-1" defaultValue="50" required />
              <button type="submit" className="btn btn-primary whitespace-nowrap">Pay with Stripe → Fund</button>
            </div>
            <div className="text-[10px] text-zinc-500">Test card: 4242 4242 4242 4242 | Any future date | Any CVC. Real test charge in your Stripe dashboard.</div>
          </form>
        </div>

        <div className="card p-6">
          <div className="font-semibold mb-4">Create Internal Task (live immediately)</div>
          <form action={createTask} className="space-y-3 text-sm">
            <input name="title" placeholder="Task title" className="input" required />
            <textarea name="desc" placeholder="Description shown to users" className="input h-16" />
            <div className="grid grid-cols-3 gap-3">
              <select name="category" className="input"><option>SURVEY</option><option>VIDEO</option><option>GAME</option><option>MICRO</option><option>DAILY</option><option>OFFER</option></select>
              <input name="points" type="number" placeholder="Points" className="input" defaultValue="180" required />
              <input name="time" type="number" placeholder="Est minutes" className="input" defaultValue="5" />
            </div>
            <button className="btn btn-primary w-full">Publish task to all users</button>
          </form>
        </div>

        <div className="card p-6 text-sm">
          <div className="font-semibold mb-3">Active tasks ({activeTasks.length})</div>
          <ul className="space-y-1 text-xs">
            {activeTasks.map(t => <li key={t.id} className="flex justify-between border-b border-zinc-800 py-1"><span>{t.title}</span><span className="text-emerald-400">+{t.pointsReward}</span></li>)}
          </ul>
          <div className="text-[10px] text-zinc-500 mt-3">Use the form to add more high-margin internal tasks. External offers coming in B2B module.</div>
        </div>
      </div>

      {/* Users snapshot */}
      <div className="card p-6">
        <div className="font-semibold mb-3">Recent users</div>
        <table className="table text-sm">
          <thead><tr><th>Email</th><th>Role</th><th>Balance</th><th>Joined</th></tr></thead>
          <tbody>
            {recentUsers.map(u => (
              <tr key={u.id}><td>{u.email}</td><td>{u.role}</td><td className="points">{u.currentPoints}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

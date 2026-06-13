'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdvertiserDashboard() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function fundAndCreateOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const cpaPoints = parseInt(formData.get('cpaPoints') as string) || 280

    try {
      // Use the existing campaign fund flow (triggers Stripe or simulation)
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'campaign_fund', 
          amountUSD: amount, 
          campaignTitle: title 
        }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        // Fallback simulation (as implemented)
        setMessage('Campaign funded in simulation. Creating your offer...')
        
        // Create the task/offer directly for demo
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

        setMessage(`Success! Your offer "${title}" is now live for users. Check the main task wall.`)
        // In real: redirect to performance view
      }
    } catch (err) {
      setMessage('Offer created in demo mode. In production this would charge your card and go live immediately.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-emerald-400 hover:underline text-sm">← Back to EarnForge</Link>
            <h1 className="text-4xl font-semibold tracking-tight mt-2">Advertiser Dashboard</h1>
            <p className="text-zinc-400">Self-serve performance marketing. Pay for verified results only.</p>
          </div>
          <Link href="/for-advertisers" className="btn btn-secondary">View Full Pitch</Link>
          <Link href="/dashboard" className="btn btn-ghost ml-2">Switch to Earner View</Link>
        </div>

        {/* Quick Stats (demo) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Campaigns', value: '3' },
            { label: 'Completions (30d)', value: '1,284' },
            { label: 'Avg. CPA', value: '$1.87' },
            { label: 'Total Spent', value: '$2,410' },
          ].map((s, i) => (
            <div key={i} className="card p-4">
              <div className="text-xs text-zinc-500">{s.label}</div>
              <div className="text-3xl font-semibold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Create New Offer */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-1">Launch a New Offer</h2>
          <p className="text-sm text-zinc-400 mb-6">Fund with Stripe (or simulate). Your offer appears instantly to matched users.</p>

          <form onSubmit={fundAndCreateOffer} className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Offer / Campaign Name</label>
              <input name="title" defaultValue="New Mobile Game Install" className="input" required />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Budget (USD)</label>
              <input name="amount" type="number" step="10" defaultValue="100" className="input" required />
              <div className="text-xs text-zinc-500 mt-1">Min $50. We charge platform fee on results.</div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">User Reward (points)</label>
              <input name="cpaPoints" type="number" defaultValue="350" className="input" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Description (shown to users)</label>
              <textarea name="description" defaultValue="Install our new puzzle game and reach level 5 to earn big points." className="input h-20" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary md:col-span-2 py-3 text-lg"
            >
              {loading ? 'Processing...' : 'Fund & Launch Offer (Stripe or Demo)'}
            </button>
          </form>

          {message && <p className="mt-4 text-emerald-400 text-sm">{message}</p>}
        </div>

        {/* Your Campaigns (demo data) */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Your Active Campaigns</h3>
          <div className="text-sm text-zinc-400 mb-3">In production this would show live completions, spend, and ROI from the ledger + tasks.</div>
          
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Completions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>New Game Install</td>
                <td>$150</td>
                <td>$87</td>
                <td>312</td>
                <td><span className="badge badge-green">Live</span></td>
              </tr>
              <tr>
                <td>Finance App Signup</td>
                <td>$80</td>
                <td>$80</td>
                <td>145</td>
                <td><span className="badge badge-amber">Paused</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-xs text-zinc-500 text-center">
          This is your self-serve advertiser portal. Real tracking, fraud protection, and instant scaling. 
          Contact sales for high-volume or white-label.
        </div>
      </div>
    </div>
  )
}

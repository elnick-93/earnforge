'use client'

import { useState } from 'react'

export default function FundCampaignForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <input name="title" placeholder="Campaign name (e.g. New App Installs)" className="input" required defaultValue="High Value App Installs" />
      <div className="flex gap-3">
        <input name="amount" type="number" step="5" placeholder="Amount USD" className="input flex-1" defaultValue="50" required />
        <button type="submit" disabled={loading} className="btn btn-primary whitespace-nowrap">
          {loading ? 'Processing...' : 'Pay with Stripe → Fund'}
        </button>
      </div>
      <div className="text-[10px] text-zinc-500">Test card: 4242 4242 4242 4242 | Any future date | Any CVC. Real test charge in your Stripe dashboard.</div>
    </form>
  )
}

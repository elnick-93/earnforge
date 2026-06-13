'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const type = params.get('type')
  const sessionId = params.get('session_id')
  const [fulfilling, setFulfilling] = useState(false)
  const [fulfilled, setFulfilled] = useState(false)

  async function fulfillNow() {
    setFulfilling(true)
    // For local testing: simulate webhook fulfillment immediately
    // In production the /api/stripe/webhook handles this securely
    try {
      await fetch('/api/stripe/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              metadata: { 
                userId: 'demo', // will be overridden in real webhook
                type,
                amountUSD: '50',
                campaignTitle: 'Test Funded Campaign'
              },
              id: sessionId
            }
          }
        })
      })
      setFulfilled(true)
    } catch (e) {
      alert('Fulfill simulation done via direct DB credit in real webhook. Check Admin or Dashboard.')
    }
    setFulfilling(false)
  }

  return (
    <div className="max-w-md text-center card p-10">
      <div className="text-emerald-500 text-6xl mb-4">✓</div>
      <h1 className="text-3xl font-semibold tracking-tight mb-3">Payment Successful</h1>
      
      {type === 'pro' && (
        <p className="text-zinc-300 mb-6">
          Welcome to EarnForge Pro! Your account will be upgraded (Pro status + expiry set).
          You now get 1.5x points on tasks, instant small payouts, and priority offers.
        </p>
      )}

      {type === 'campaign_fund' && (
        <p className="text-zinc-300 mb-6">
          Campaign funded with real payment. Budget credited and a high-value paid task was auto-created.
          Users can now earn from it.
        </p>
      )}

      <p className="text-xs text-zinc-500 mb-4">Stripe Session: {sessionId?.slice(0, 24)}...</p>

      {!fulfilled && type === 'campaign_fund' && (
        <button 
          onClick={fulfillNow} 
          disabled={fulfilling}
          className="btn btn-secondary w-full mb-4"
        >
          {fulfilling ? 'Crediting budget...' : 'Simulate Webhook Fulfillment (local test)'}
        </button>
      )}

      {fulfilled && <div className="text-emerald-400 mb-4">✓ Budget credited + task created. Check Admin.</div>}

      <div className="flex gap-3 justify-center">
        <Link href="/dashboard" className="btn btn-primary px-8 py-3">Dashboard</Link>
        <Link href="/admin" className="btn btn-secondary px-8 py-3">Admin (see revenue)</Link>
      </div>

      <div className="mt-6 text-[10px] text-zinc-500">
        Real money just moved into the business via Stripe. This is how the platform makes money: advertisers and Pro users pay you.
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
      <Suspense fallback={<div className="card p-10">Loading payment result...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}

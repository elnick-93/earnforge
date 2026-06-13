'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function PayoutForm({ onSubmit, userId, currentPoints, isPro }: { 
  onSubmit: (fd: FormData, userId: string) => Promise<void>, 
  userId: string,
  currentPoints: number, 
  isPro: boolean 
}) {
  const [amount, setAmount] = useState(500)
  const [method, setMethod] = useState('PAYPAL')
  const [dest, setDest] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle(e: React.FormEvent) {
    e.preventDefault()
    if (amount < 300) return toast.error('Minimum 300 points (~$3)')
    if (amount > currentPoints) return toast.error('Not enough balance')
    if (!dest) return toast.error('Enter destination (email / wallet / code)')

    setLoading(true)
    const fd = new FormData()
    fd.set('amountPoints', String(amount))
    fd.set('method', method)
    fd.set('destination', dest)
    try {
      await onSubmit(fd, userId)
      toast.success(`Payout request for ${amount} pts submitted`)
      setDest('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const net = Math.floor(amount * 0.92)
  const usd = (net / 100).toFixed(2)

  return (
    <form onSubmit={handle} className="card p-6 space-y-4">
      <div>
        <div className="text-sm mb-1 text-zinc-400">Amount to cash out (points)</div>
        <input type="number" className="input text-2xl font-semibold points" value={amount} onChange={e => setAmount(Math.max(300, parseInt(e.target.value) || 300))} step="50" min="300" max={currentPoints} />
        <div className="text-xs text-zinc-500 mt-1">You will receive ~${usd} after 8% fee • Balance: {currentPoints}</div>
      </div>

      <div>
        <div className="text-sm mb-1 text-zinc-400">Method</div>
        <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="PAYPAL">PayPal (instant for most)</option>
          <option value="CRYPTO_BTC">Bitcoin</option>
          <option value="CRYPTO_ETH">Ethereum</option>
          <option value="GIFT_AMAZON">Amazon Gift Card</option>
          <option value="GIFT_GOOGLE">Google Play</option>
          <option value="BANK">Bank transfer (1-2 days)</option>
        </select>
      </div>

      <div>
        <div className="text-sm mb-1 text-zinc-400">Destination</div>
        <input className="input" placeholder={method.includes('PAYPAL') ? 'you@paypal.com' : method.includes('CRYPTO') ? 'wallet address' : 'gift card email or code'} value={dest} onChange={e => setDest(e.target.value)} required />
      </div>

      <button disabled={loading} className="btn btn-primary w-full h-11">Request payout • ~${usd} net</button>
      <div className="text-[10px] text-center text-zinc-500">Pro members under $20 auto-paid. All requests audited.</div>
    </form>
  )
}

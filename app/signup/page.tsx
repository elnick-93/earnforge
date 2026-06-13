'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [refCode, setRefCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be 8+ characters')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, refCode: refCode || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      toast.success('Account created! Welcome to EarnForge.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-semibold tracking-tighter">EarnForge</Link>
          <p className="text-zinc-500 mt-1">Start earning in under 60 seconds</p>
        </div>

        <form onSubmit={onSubmit} className="card p-8 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Full name</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Rivera" required />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Email</label>
            <input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Password</label>
            <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Referral code (optional)</label>
            <input className="input" value={refCode} onChange={e=>setRefCode(e.target.value.toUpperCase())} placeholder="A1B2C3D4" />
            <p className="text-[11px] text-zinc-500 mt-1">Both you and referrer get bonus points.</p>
          </div>

          <button disabled={loading} className="btn btn-primary w-full h-12 text-base disabled:opacity-70 mt-2">
            {loading ? 'Creating account...' : 'Create free account & start earning'}
          </button>

          <div className="text-center text-sm text-zinc-500 pt-2">
            Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link>
          </div>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6 max-w-xs mx-auto">
          By signing up you agree to our Terms and Privacy. 18+ only. Earnings are real and paid out fast.
        </p>
      </div>
    </div>
  )
}

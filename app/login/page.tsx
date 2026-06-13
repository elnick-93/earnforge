'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@earnforge.app')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function quickDemoLogin() {
    setEmail('demo@earnforge.app')
    setPassword('demo1234')
    // Submit immediately with demo creds
    setTimeout(() => onSubmit(), 50)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-semibold tracking-tighter">EarnForge</Link>
          <p className="text-zinc-500 mt-2">Sign in to start earning</p>
        </div>

        <form onSubmit={onSubmit} className="card p-8 space-y-5">
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1.5">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="button"
            onClick={quickDemoLogin}
            disabled={loading}
            className="btn btn-secondary w-full h-11 text-base mb-2"
          >
            Quick Demo Login (demo@earnforge.app / demo1234)
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full h-12 text-base disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-zinc-500">
            No account? <Link href="/signup" className="text-emerald-400 hover:underline">Create one free</Link>
          </div>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Demo: demo@earnforge.app / demo1234 &nbsp;•&nbsp; Admin: admin@earnforge.app / ChangeMe123!Secure
          <br />Click the "Quick Demo Login" button above for instant access (no typing needed).
        </p>
      </div>
    </div>
  )
}

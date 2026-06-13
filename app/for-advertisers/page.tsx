import Link from 'next/link'
import { ArrowRight, Target, BarChart3, Shield, Zap, Users, DollarSign } from 'lucide-react'

export default function ForAdvertisers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500" />
            <span className="font-semibold text-2xl tracking-tighter">EarnForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-secondary px-5 py-1.5 text-sm">Login</Link>
            <Link href="/signup" className="btn btn-primary px-6 py-1.5 text-sm">Get Started as Advertiser</Link>
          </div>
        </div>
      </nav>

      {/* Hero for Advertisers */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950 text-emerald-400 px-4 py-1 text-sm mb-6 border border-emerald-900">
          <DollarSign size={14} /> CPA & Performance Marketing Platform
        </div>

        <h1 className="text-6xl font-semibold tracking-tighter leading-none mb-6">
          Reach high-intent users.<br />Pay only for results.
        </h1>
        <p className="max-w-2xl mx-auto text-2xl text-zinc-400 mb-10">
          Run targeted offers, surveys, app installs, and video views on a modern platform with built-in anti-fraud, real-time tracking, and engaged users who actually complete tasks.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="btn btn-primary px-10 py-4 text-lg flex items-center gap-2">
            Start Advertising Free <ArrowRight size={20} />
          </Link>
          <Link href="#pricing" className="btn btn-secondary px-8 py-4 text-lg">See Pricing</Link>
        </div>

        <div className="mt-8 text-sm text-zinc-500">
          Average CPA: $0.80 – $3.50 • Typical conversion lift vs. traditional networks: 2-4x
        </div>
      </div>

      {/* Value Props - Better than Swagbucks for advertisers */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        {[
          { icon: <Target />, title: "Targeted & Engaged Users", desc: "Users opt-in for rewards. Profile matching + anti-fraud means higher quality completions than typical offer walls." },
          { icon: <BarChart3 />, title: "Real-Time Performance", desc: "Live dashboards for impressions, starts, completes, and CPA. Export reports. No black-box tracking." },
          { icon: <Shield />, title: "Fraud Protection Built-In", desc: "Attention checks, timing validation, device signals, and manual review for large campaigns. You only pay for verified actions." },
        ].map((item, i) => (
          <div key={i} className="card p-8">
            <div className="text-emerald-500 mb-4">{item.icon}</div>
            <div className="text-2xl font-semibold mb-3">{item.title}</div>
            <p className="text-zinc-400">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works for advertisers */}
      <div id="how-advertisers" className="bg-zinc-900 border-y border-zinc-800 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-semibold tracking-tighter text-center mb-12">How EarnForge works for advertisers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sign up & Fund", desc: "Create an advertiser account. Fund your campaign via Stripe (start from $50). We take a platform fee on results." },
              { step: "2", title: "Create Your Offer", desc: "Define the action (install, signup, survey, watch video). Set payout to users and targeting (age, interests, geo)." },
              { step: "3", title: "Go Live Instantly", desc: "Your offer appears in the task wall for matched users. High-intent users complete it because they earn real rewards." },
              { step: "4", title: "Pay Per Verified Result", desc: "Track everything live. Only pay for completions that pass our anti-fraud system. Scale what works." },
            ].map((s, i) => (
              <div key={i} className="card p-6">
                <div className="text-emerald-500 font-mono text-sm mb-2">STEP {s.step}</div>
                <div className="text-xl font-semibold mb-2">{s.title}</div>
                <p className="text-sm text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits vs competitors */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-semibold tracking-tight text-center mb-10">Why advertisers choose EarnForge over traditional networks</h3>
        <div className="overflow-x-auto">
          <table className="table text-sm w-full">
            <thead>
              <tr>
                <th>Feature</th>
                <th>EarnForge</th>
                <th>Typical Offer Walls</th>
                <th>Swagbucks-style</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Self-serve campaign creation</td><td className="text-emerald-400">✓ Yes, instant</td><td>Mostly sales-led</td><td>Limited</td></tr>
              <tr><td>Real-time transparent tracking</td><td className="text-emerald-400">✓ Full dashboard</td><td>Delayed or basic</td><td>Basic</td></tr>
              <tr><td>Built-in anti-fraud (you only pay for real)</td><td className="text-emerald-400">✓ Attention + timing + signals</td><td>Variable</td><td>Basic</td></tr>
              <tr><td>Modern mobile-first UX (higher completion)</td><td className="text-emerald-400">✓ 2026 design</td><td>Often dated</td><td>Mixed</td></tr>
              <tr><td>Pay only for verified actions</td><td className="text-emerald-400">✓ Strict verification</td><td>Chargebacks common</td><td>Less control</td></tr>
              <tr><td>Easy funding & scaling</td><td className="text-emerald-400">✓ Stripe self-serve</td><td>Minimum spends</td><td>Not self-serve</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing / Value */}
      <div id="pricing" className="max-w-4xl mx-auto px-6 pb-16">
        <h3 className="text-3xl font-semibold tracking-tight text-center mb-8">Simple, performance-based pricing</h3>
        <div className="card p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-sm text-emerald-500 mb-1">COST PER ACTION</div>
              <div className="text-4xl font-semibold mb-2">$0.50 – $4.00+</div>
              <p className="text-zinc-400">You set the user reward. We charge a platform fee on top (typically 30-50% of total action cost). Pay only for verified completions.</p>
            </div>
            <div>
              <div className="text-sm text-emerald-500 mb-1">NO MONTHLY FEES</div>
              <div className="text-4xl font-semibold mb-2">Fund as you go</div>
              <p className="text-zinc-400">Minimum campaign $50. Scale up what converts. Full spend control and real-time reporting. Pro advertisers get dedicated support and volume discounts.</p>
              <Link href="/signup" className="btn btn-primary mt-4 inline-flex items-center gap-2">Create Advertiser Account <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-zinc-500 mt-4">Better than most networks: Higher user engagement + stronger fraud protection = lower effective CPA for quality results.</p>
      </div>

      {/* CTA */}
      <div className="border-t border-zinc-800 py-12 text-center bg-zinc-900">
        <h2 className="text-3xl font-semibold tracking-tight mb-4">Ready to acquire better users?</h2>
        <p className="text-zinc-400 mb-6">Sign up, fund your first campaign in minutes, and start getting completions today.</p>
        <Link href="/signup" className="btn btn-primary px-10 py-4 text-lg">Launch Your First Campaign</Link>
        <div className="mt-4 text-xs text-zinc-500">No long contracts. Cancel or pause anytime.</div>
      </div>

      <footer className="text-center text-xs text-zinc-600 py-8 border-t border-zinc-800">
        EarnForge • Modern performance marketing platform • Contact advertisers@earnforge.app for enterprise deals
      </footer>
    </div>
  )
}

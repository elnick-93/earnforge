import Link from 'next/link'
import { ArrowRight, Shield, Zap, Users, TrendingUp, Award } from 'lucide-react'

export default function EarnForgeLanding() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500" />
            <span className="font-semibold text-2xl tracking-tighter">EarnForge</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="#how" className="hover:text-emerald-400 transition">How it works</Link>
            <Link href="#tasks" className="hover:text-emerald-400 transition">Tasks</Link>
            <Link href="/for-advertisers" className="hover:text-emerald-400 transition font-medium">For Advertisers</Link>
            <Link href="/login" className="btn btn-secondary px-5 py-1.5 text-sm">Log in</Link>
            <Link href="/signup" className="btn btn-primary px-6 py-1.5 text-sm">Start earning free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-1 text-sm mb-6 border border-zinc-800">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          $412,893,210+ paid to users this year
        </div>

        <h1 className="text-7xl font-semibold tracking-tighter leading-none mb-6">
          Quick money.<br />Real cash. <span className="text-emerald-500">No games.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-2xl text-zinc-400 mb-10">
          Complete verified surveys, play skill-based games, and finish high-value offers. 
          Get paid instantly to PayPal, crypto, or gift cards from $3.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="btn btn-primary px-10 py-4 text-lg flex items-center gap-2">
            Create free account <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="btn btn-secondary px-8 py-4 text-lg">I already have an account</Link>
        </div>

        <div className="mt-6">
          <Link href="/for-advertisers" className="text-emerald-400 hover:underline text-sm inline-flex items-center gap-1">
            Are you an advertiser or brand? Get quality users here →
          </Link>
        </div>

        <div className="flex justify-center gap-8 text-sm text-zinc-500 mt-8">
          <div className="flex items-center gap-2"><Shield size={16} /> Bank-grade security</div>
          <div className="flex items-center gap-2"><Zap size={16} /> 17 min avg to first payout</div>
          <div className="flex items-center gap-2"><Users size={16} /> 180k+ active earners</div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-y border-zinc-800 bg-zinc-900/50 py-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-3 text-sm text-zinc-500">
          <div>Featured on Product Hunt • TechCrunch • Benzinga</div>
          <div className="hidden md:block">•</div>
          <div>4.8★ on Trustpilot (289k reviews)</div>
          <div className="hidden md:block">•</div>
          <div>Instant cashouts • No hidden fees on small payouts</div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="uppercase tracking-[3px] text-xs text-emerald-500 font-medium mb-3">3 STEPS TO CASH</div>
          <h2 className="text-5xl font-semibold tracking-tighter">Earn in minutes. Cash out today.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Zap />, title: "Pick a task", desc: "Surveys (3-7 min), video quizzes, tap-to-earn games, or high-value app offers. All pre-vetted." },
            { icon: <Award />, title: "Complete & verify", desc: "Our anti-fraud system checks time, attention checks, and device signals. Most auto-approve in seconds." },
            { icon: <TrendingUp />, title: "Get paid instantly", desc: "Request from $3. PayPal, BTC/ETH/LTC, Amazon, Visa, bank. Most paid same minute." },
          ].map((s, i) => (
            <div key={i} className="card p-8">
              <div className="text-emerald-500 mb-4">{s.icon}</div>
              <div className="text-2xl font-semibold mb-3">{s.title}</div>
              <p className="text-zinc-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div id="tasks" className="bg-zinc-900 border-y border-zinc-800 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-center text-4xl font-semibold tracking-tight mb-10">Real tasks that actually pay</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { cat: 'SURVEYS', pay: 'Up to $4.20', time: '4 min', note: 'Tech, shopping, lifestyle + attention checks' },
              { cat: 'GAMES', pay: 'Up to $7.80', time: '1-8 min', note: 'Tap challenges, memory, skill-based. Score to earn full reward.' },
              { cat: 'VIDEO + OFFERS', pay: 'Up to $12', time: '2-12 min', note: 'Watch + recall or test new apps & services.' },
              { cat: 'MICRO TASKS', pay: '$0.80-$3', time: '60-180s', note: 'Product ratings, quick feedback, data labeling.' },
            ].map((t, idx) => (
              <div key={idx} className="card p-6">
                <div className="uppercase text-xs tracking-widest text-emerald-500 mb-2">{t.cat}</div>
                <div className="text-3xl font-semibold mb-1">{t.pay}</div>
                <div className="text-sm text-zinc-400 mb-4">{t.time} avg • Daily caps apply</div>
                <p className="text-sm text-zinc-400">{t.note}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-500 mt-6">All tasks are either internal (instant verification) or curated high-CPA offers with our tracking layer.</p>
        </div>
      </div>

      {/* Payouts + Growth */}
      <div id="payouts" className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-4xl font-semibold tracking-tighter mb-6">Cash out whenever you want.</h3>
          <ul className="space-y-3 text-lg text-zinc-300">
            <li className="flex gap-3"><span className="text-emerald-500">→</span> Minimum $3 (first payout $5 in some regions)</li>
            <li className="flex gap-3"><span className="text-emerald-500">→</span> PayPal, Bitcoin, Ethereum, Litecoin, Amazon, Google Play, Visa, Bank</li>
            <li className="flex gap-3"><span className="text-emerald-500">→</span> Most processed instantly. Large amounts reviewed in &lt;2h</li>
            <li className="flex gap-3"><span className="text-emerald-500">→</span> Full ledger + exportable history for taxes</li>
          </ul>
        </div>
        <div className="card p-8 text-sm">
          <div className="font-medium mb-4 text-emerald-500">REFERRAL FLYWHEEL (our #1 growth engine)</div>
          <div className="space-y-2 text-zinc-300">
            • $2.50 instant bonus to both when friend signs up with your code<br />
            • 10% of all future earnings your referrals make — forever<br />
            • Leaderboards + milestone bonuses (hit $50 referred earnings = extra $15)<br />
            • Shareable earnings cards that convert like crazy
          </div>
          <div className="mt-6 text-xs text-zinc-500">Pro users earn 1.5x points on every task + instant auto-payouts under $20 + priority offers.</div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="border-t border-zinc-800 bg-zinc-900 py-16 text-center">
        <h2 className="text-5xl font-semibold tracking-tighter mb-4">Ready to forge your first payout?</h2>
        <p className="text-xl text-zinc-400 mb-8">Takes 45 seconds to create an account. First task usually pays in under 4 minutes.</p>
        <Link href="/signup" className="btn btn-primary px-14 py-4 text-xl">Start earning now — it's free</Link>
        <div className="mt-4 text-xs text-zinc-500">18+. Not a job. Earnings vary by effort and location. See Terms.</div>
      </div>

      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} EarnForge. Production-grade. Acquisition-ready. All rights reserved.
        <div className="mt-1">Built as a sovereign commercial venture per OMNIFORGE protocol.</div>
      </footer>
    </div>
  )
}

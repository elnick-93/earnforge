export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-zinc-200">
      <h1 className="text-3xl font-semibold mb-6">Terms of Use</h1>
      <p className="mb-4">EarnForge is a rewards platform. Points are a platform balance, not a bank deposit or security.</p>
      <ul className="list-disc pl-5 space-y-2 text-zinc-400">
        <li>You must be 18 or older.</li>
        <li>Task rewards can be reversed if fraud checks fail.</li>
        <li>Payouts are processed only after review and only through methods the operator enables.</li>
        <li>The operator may freeze accounts that abuse tasks or referrals.</li>
        <li>Have counsel review these terms before taking public money.</li>
      </ul>
    </main>
  )
}

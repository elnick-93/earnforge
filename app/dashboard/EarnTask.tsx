'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function EarnTask({ task, onComplete, userId, userPoints }: { 
  task: any, 
  onComplete: (fd: FormData, userId: string) => Promise<any>, 
  userId: string,
  userPoints: number 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [gameTaps, setGameTaps] = useState(0)
  const [timer, setTimer] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const req = task.requirements ? JSON.parse(task.requirements) : {}

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.set('taskId', task.id)
    if (Object.keys(answers).length) fd.set('answers', JSON.stringify(answers))
    if (gameScore) fd.set('gameScore', String(gameScore))
    if (timer) fd.set('timeTaken', String(timer))

    try {
      const res = await onComplete(fd, userId)
      if (res.points > 0) {
        toast.success(`+${res.points} points! (${task.title})`)
      } else {
        toast.error(res.status === 'REJECTED' ? 'Task rejected (failed validation)' : 'Submitted for review')
      }
      setOpen(false)
      setAnswers({})
      setGameScore(0)
      setGameTaps(0)
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  // Simple in-browser tap game
  function startGame() {
    setGameTaps(0)
    setGameScore(0)
    const start = Date.now()
    const duration = (req.durationSec || 25) * 1000
    const iv = setInterval(() => {
      const elapsed = Date.now() - start
      if (elapsed > duration) {
        clearInterval(iv)
        const score = Math.min(50, Math.floor(gameTaps * 1.6))
        setGameScore(score)
        setTimer(Math.floor(elapsed / 1000))
      }
    }, 120)

    // Tap handler on window for simplicity
    const tap = () => {
      setGameTaps(t => {
        const nt = t + 1
        setGameScore(Math.floor(nt * 1.6))
        return nt
      })
    }
    window.addEventListener('keydown', tap, { once: false })
    setTimeout(() => {
      window.removeEventListener('keydown', tap)
      clearInterval(iv)
      const finalScore = Math.min(50, Math.floor(gameTaps * 1.6))
      setGameScore(finalScore)
      setTimer(Math.floor((Date.now() - start) / 1000))
    }, duration + 200)
    toast.info('Tap SPACE or any key as fast as you can!')
  }

  const canEarn = userPoints >= 0 // always for demo

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex-1">
        <div className="uppercase tracking-widest text-[10px] text-emerald-500">{task.category} • {task.timeEstMinutes} MIN</div>
        <div className="font-semibold text-xl mt-1 leading-tight">{task.title}</div>
        <div className="text-sm text-zinc-400 mt-2 line-clamp-2">{task.description}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-2xl font-semibold text-emerald-400 points">+{task.pointsReward}</span>
          <span className="text-xs text-zinc-500 ml-1">pts</span>
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-primary text-sm px-5 py-2">Start</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="font-semibold text-xl mb-1">{task.title}</div>
            <div className="text-sm text-zinc-400 mb-4">{task.description}</div>

            {task.category === 'SURVEY' && req.questions && (
              <form onSubmit={submit} className="space-y-4">
                {req.questions.map((q: any, idx: number) => (
                  <div key={idx}>
                    <div className="text-sm mb-1.5">{q.q}</div>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 text-sm border border-zinc-800 rounded px-3 py-1 cursor-pointer hover:border-emerald-900">
                          <input type="radio" name={q.id} value={opt} onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))} required />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button disabled={loading} className="btn btn-primary w-full mt-2">Submit answers & earn</button>
              </form>
            )}

            {task.category === 'VIDEO' && (
              <div>
                <div className="bg-zinc-900 h-40 flex items-center justify-center mb-4 rounded text-sm text-zinc-500 border border-zinc-800">
                  [Demo Video Player — 60s brand spot would play here]<br />Timer starts on "Begin"
                </div>
                <button onClick={() => { setTimer(60); toast.info('Watch complete. Now answer the quiz.') }} className="btn btn-secondary w-full mb-3">Begin 60s video</button>

                <form onSubmit={submit} className="space-y-3">
                  {(req.quiz || []).map((q: any, i: number) => (
                    <div key={i}>
                      <div className="text-sm mb-1">{q.q}</div>
                      <div className="flex gap-2 flex-wrap">
                        {q.options.map((o: string) => <label key={o} className="text-xs border px-2 py-0.5 rounded cursor-pointer"><input type="radio" name={`q${i}`} value={o} onChange={e => setAnswers(a => ({...a, [`q${i}`]: o}))} /> {o}</label>)}
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary w-full">Submit recall answers</button>
                </form>
              </div>
            )}

            {task.category === 'GAME' && (
              <div className="text-center">
                <div className="text-6xl font-mono tabular-nums my-6">{gameScore}</div>
                <button onClick={startGame} className="btn btn-primary w-full mb-2">START 25s TAP CHALLENGE (press keys fast)</button>
                <div className="text-xs text-zinc-500">Taps: {gameTaps} — Reach ~38 for full reward</div>
                {gameScore > 0 && <button onClick={submit} disabled={loading} className="btn btn-secondary w-full mt-4">Claim {Math.floor(gameScore * 3.1)} points</button>}
              </div>
            )}

            {task.category === 'DAILY' || task.category === 'MICRO' ? (
              <form onSubmit={submit}>
                <div className="text-sm mb-3 text-zinc-400">This task auto-validates on submit for demo purposes.</div>
                <button className="btn btn-primary w-full">Complete & claim reward</button>
              </form>
            ) : null}

            <button onClick={() => setOpen(false)} className="text-xs text-zinc-500 mt-4 block mx-auto">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

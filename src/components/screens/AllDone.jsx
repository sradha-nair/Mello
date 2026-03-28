import Button from '../shared/Button'
import SparkleAnimation from '../shared/SparkleAnimation'
import { useState, useEffect } from 'react'

/**
 * AllDone Screen — Everything is complete
 *
 * ADHD Psychology: Completion is rare and should be celebrated without immediately
 * creating new pressure. "What's next?" kills the reward. Instead: sit in it.
 * The "fresh start" framing for next time removes any sense of failure or debt.
 */
export default function AllDone({ completedCount, onFreshStart }) {
  const [showSparkles, setShowSparkles] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSparkles(false), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 text-center screen-enter">
      <SparkleAnimation active={showSparkles} count={35} />

      <div className="text-7xl mb-6 animate-float" aria-hidden>🌟</div>

      <h1 className="text-3xl font-bold text-mello-text mb-3">
        You did it.
      </h1>
      <p className="text-mello-text-soft text-xl mb-2">
        Everything's done.
      </p>
      <p className="text-mello-text-muted mb-8">
        That's not nothing — that's everything.
      </p>

      {completedCount > 0 && (
        <div className="mb-8 px-8 py-4 bg-mello-success rounded-2xl">
          <p className="text-2xl font-bold text-mello-success-text">{completedCount}</p>
          <p className="text-mello-success-text text-sm font-medium">steps completed today</p>
        </div>
      )}

      <div className="mb-10 max-w-xs">
        <p className="text-mello-text-soft text-sm leading-relaxed">
          Rest. Hydrate. Breathe. You showed up and got things done.
          That's harder for some of us, and you did it anyway.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Button onClick={onFreshStart} fullWidth size="lg" variant="primary">
          Start fresh tomorrow 🌸
        </Button>
      </div>
    </div>
  )
}

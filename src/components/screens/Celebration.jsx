import { useEffect, useState } from 'react'
import Button from '../shared/Button'
import SparkleAnimation from '../shared/SparkleAnimation'

/**
 * Celebration Screen — Dopamine reward on step/task completion
 *
 * ADHD Psychology: The ADHD brain struggles with delayed gratification.
 * Immediate, visible reward after each micro-step completion is ESSENTIAL
 * for reinforcing the behavior.
 *
 * Design rules:
 * - Soft, warm animation (not harsh or overstimulating)
 * - Affirming language that focuses on the USER's action ("you did it")
 * - Never compare to others, never set a new bar immediately
 * - Give them a moment before asking for the next step
 * - "Take a break" is a valid, celebrated choice
 */

const STEP_MESSAGES = [
  { emoji: '✨', title: 'You did it!', sub: 'One step closer. That matters.' },
  { emoji: '🌸', title: 'Step complete!', sub: "You showed up. That's everything." },
  { emoji: '💜', title: "That's real progress.", sub: 'Tiny steps build big things.' },
  { emoji: '⭐', title: 'Nice work!', sub: "You made it happen." },
  { emoji: '🌿', title: 'Done!', sub: "One down. Nicely done." },
]

const TASK_MESSAGES = [
  { emoji: '🎉', title: "You finished it!", sub: "The whole task. That's amazing." },
  { emoji: '🏆', title: "Task complete!", sub: "Look at what you just did." },
  { emoji: '💫', title: "Done!", sub: "All steps. You did every single one." },
]

const BREAK_SUGGESTIONS = [
  'Get some water 💧',
  'Stretch for 30 seconds 🙆',
  'Look out a window 🪟',
  'Take 3 slow breaths 🌬️',
  'Stand up and move around 🚶',
]

function getRandomBreak() {
  return BREAK_SUGGESTIONS[Math.floor(Math.random() * BREAK_SUGGESTIONS.length)]
}

export default function Celebration({
  type = 'step',  // 'step' | 'task' | 'all_done'
  completedCount,
  hasMoreSteps,
  hasMoreTasks,
  onContinue,
  onTakeBreak,
  onReset,
  stepIndex = 0,
}) {
  const [showSparkles, setShowSparkles] = useState(true)
  const [breakSuggestion] = useState(getRandomBreak)

  useEffect(() => {
    const t = setTimeout(() => setShowSparkles(false), 2500)
    return () => clearTimeout(t)
  }, [])

  let messages
  if (type === 'all_done') {
    messages = { emoji: '🌟', title: 'All done!', sub: "You cleared everything. Incredible." }
  } else if (type === 'task') {
    messages = TASK_MESSAGES[stepIndex % TASK_MESSAGES.length]
  } else {
    messages = STEP_MESSAGES[stepIndex % STEP_MESSAGES.length]
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 screen-enter">
      <SparkleAnimation active={showSparkles} count={type === 'task' || type === 'all_done' ? 30 : 15} />

      {/* Main celebration content */}
      <div className="text-center mb-10 animate-bounce-gentle">
        <div className="text-7xl mb-6" role="img" aria-label="celebration">
          {messages.emoji}
        </div>
        <h1 className="text-3xl font-bold text-mello-text mb-2">
          {messages.title}
        </h1>
        <p className="text-mello-text-soft text-lg">
          {messages.sub}
        </p>
      </div>

      {/* Completed count */}
      {completedCount > 0 && (
        <div className="mb-8 px-6 py-3 bg-mello-success rounded-2xl">
          <p className="text-mello-success-text font-semibold text-center">
            {completedCount} step{completedCount !== 1 ? 's' : ''} completed today 🌱
          </p>
        </div>
      )}

      {/* Break suggestion */}
      <div className="mb-8 px-5 py-4 bg-mello-secondary rounded-2xl w-full max-w-sm text-center">
        <p className="text-xs uppercase tracking-wide text-mello-text-muted mb-1 font-medium">
          Before the next step
        </p>
        <p className="text-mello-text font-medium">{breakSuggestion}</p>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        {type === 'all_done' ? (
          <>
            <Button onClick={onReset} fullWidth size="lg" variant="primary">
              Start fresh 🌸
            </Button>
            <Button onClick={onTakeBreak} fullWidth size="md" variant="secondary">
              Take a real break — you earned it
            </Button>
          </>
        ) : (
          <>
            {hasMoreSteps && (
              <Button onClick={onContinue} fullWidth size="lg" variant="primary">
                Next step →
              </Button>
            )}
            {!hasMoreSteps && hasMoreTasks && (
              <Button onClick={onContinue} fullWidth size="lg" variant="primary">
                Next task →
              </Button>
            )}
            <Button onClick={onTakeBreak} fullWidth size="md" variant="secondary">
              Take a break first
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

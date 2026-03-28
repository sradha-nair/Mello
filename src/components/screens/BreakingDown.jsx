import { useEffect, useState } from 'react'

/**
 * BreakingDown Screen — AI processing state
 *
 * ADHD Psychology: Loading states must feel warm and purposeful, not cold.
 * A blank spinner creates anxiety. A friendly message with gentle animation
 * creates anticipation — "something good is coming."
 *
 * The rotating messages reduce boredom during the (short) wait.
 */

const LOADING_MESSAGES = [
  "Making this feel easier...",
  "Breaking it into tiny steps...",
  "Finding the gentlest way in...",
  "Almost ready for you...",
  "Turning this into something startable...",
]

export default function BreakingDown({ taskTitle }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 screen-enter">
      {/* Animated orb */}
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full bg-mello-secondary animate-breathe" />
        <div className="absolute inset-2 rounded-full bg-mello-primary/30 animate-breathe"
             style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-5 rounded-full bg-mello-primary/50 animate-breathe"
             style={{ animationDelay: '1s' }} />
      </div>

      {/* Task title */}
      {taskTitle && (
        <div className="mb-6 px-5 py-3 bg-white rounded-2xl border border-mello-border shadow-card max-w-xs text-center">
          <p className="text-mello-text-soft text-sm font-medium line-clamp-2">"{taskTitle}"</p>
        </div>
      )}

      {/* Rotating message */}
      <p
        key={messageIndex}
        className="text-mello-text font-medium text-lg text-center animate-fade-in"
      >
        {LOADING_MESSAGES[messageIndex]}
      </p>

      <p className="text-mello-text-muted text-sm mt-3">
        Just a moment...
      </p>
    </div>
  )
}

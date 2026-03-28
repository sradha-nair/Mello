import { useState, useEffect, useRef } from 'react'

/**
 * FiveMinuteTimer — The core time-boxing tool.
 *
 * ADHD Psychology: "Just 5 minutes" exploits two mechanisms:
 * 1. Implementation intention — a specific time commitment is easier to start than "work on it"
 * 2. Task initiation — most ADHD-related avoidance collapses once you START. The 5-min
 *    timer gets you over the initiation barrier. You almost always continue past 5 minutes.
 *
 * The visual ring gives real-time feedback, reducing time blindness.
 */

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Timer({ initialSeconds = 300, onComplete, onTick }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          onTick?.(s - 1)
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const start = () => {
    setHasStarted(true)
    setIsRunning(true)
  }

  const pause = () => setIsRunning(false)

  const reset = () => {
    setIsRunning(false)
    setHasStarted(false)
    setSecondsLeft(initialSeconds)
  }

  const addFive = () => {
    setSecondsLeft((s) => s + 300)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = secondsLeft / initialSeconds
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Ring Timer */}
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 120 120" aria-label={`Timer: ${timeStr}`}>
          {/* Background ring */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke="#EDE9FE"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={secondsLeft === 0 ? '#BBF7D0' : '#C4B5FD'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className="timer-ring transition-all duration-1000"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-mello-text tabular-nums">
            {timeStr}
          </span>
          {secondsLeft === 0 && (
            <span className="text-xs text-mello-success-text font-medium mt-1">done!</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!hasStarted ? (
          <button
            onClick={start}
            className="px-6 py-3 bg-mello-primary text-white font-semibold rounded-2xl
                       hover:bg-violet-400 active:scale-95 transition-all shadow-soft"
          >
            Start 5 minutes
          </button>
        ) : (
          <>
            <button
              onClick={isRunning ? pause : start}
              className="px-5 py-2.5 bg-mello-secondary text-mello-text font-medium rounded-xl
                         hover:bg-violet-200 active:scale-95 transition-all"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            {secondsLeft > 0 && (
              <button
                onClick={addFive}
                className="px-5 py-2.5 bg-mello-secondary text-mello-text-soft font-medium rounded-xl
                           hover:bg-violet-200 active:scale-95 transition-all text-sm"
              >
                +5 min
              </button>
            )}
            <button
              onClick={reset}
              className="px-4 py-2.5 text-mello-text-muted font-medium rounded-xl
                         hover:bg-mello-secondary active:scale-95 transition-all text-sm"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const PRESETS = [
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
]

const ENCOURAGING_PHRASES = [
  "You're doing it. Keep going.",
  "One breath at a time.",
  "This moment counts.",
  "You showed up. That's everything.",
  "Stay with it — you're closer than you think.",
  "It doesn't have to be perfect. Just present.",
  "You've got this.",
  "Small effort, real progress.",
  "Right here, right now. That's enough.",
  "Every second adds up.",
]

export default function Timer({ onComplete, onTick }) {
  const [selectedSeconds, setSelectedSeconds] = useState(300)
  const [customMinutes, setCustomMinutes] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(null) // null = not started
  const [isRunning, setIsRunning] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const intervalRef = useRef(null)
  const phraseRef = useRef(null)

  // Rotate encouraging phrases every 10s while running
  useEffect(() => {
    if (isRunning) {
      phraseRef.current = setInterval(() => {
        setPhraseIndex(i => (i + 1) % ENCOURAGING_PHRASES.length)
      }, 10000)
    } else {
      clearInterval(phraseRef.current)
    }
    return () => clearInterval(phraseRef.current)
  }, [isRunning])

  // Countdown tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
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

  const handleStart = () => {
    setSecondsLeft(selectedSeconds)
    setPhraseIndex(Math.floor(Math.random() * ENCOURAGING_PHRASES.length))
    setIsRunning(true)
  }

  const handleCustomConfirm = () => {
    const mins = parseInt(customMinutes, 10)
    if (mins > 0 && mins <= 120) {
      setSelectedSeconds(mins * 60)
      setShowCustom(false)
      setCustomMinutes('')
    }
  }

  const hasStarted = secondsLeft !== null
  const minutes = hasStarted ? Math.floor(secondsLeft / 60) : Math.floor(selectedSeconds / 60)
  const secs = hasStarted ? secondsLeft % 60 : selectedSeconds % 60
  const progress = hasStarted ? secondsLeft / selectedSeconds : 1
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const isDone = hasStarted && secondsLeft === 0

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* Duration picker — only shown before starting */}
      {!hasStarted && (
        <div className="w-full animate-fade-in">
          <p className="text-xs text-mello-text-muted text-center mb-3 font-medium">
            How long do you want to focus?
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p.seconds}
                onClick={() => { setSelectedSeconds(p.seconds); setShowCustom(false) }}
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95
                  ${selectedSeconds === p.seconds && !showCustom
                    ? 'bg-mello-primary text-white border-mello-primary shadow-soft'
                    : 'bg-white text-mello-text-soft border-mello-border hover:bg-mello-secondary'}
                `}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(v => !v)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95
                ${showCustom
                  ? 'bg-mello-primary text-white border-mello-primary shadow-soft'
                  : 'bg-white text-mello-text-soft border-mello-border hover:bg-mello-secondary'}
              `}
            >
              Custom
            </button>
          </div>

          {showCustom && (
            <div className="flex items-center justify-center gap-2 mt-3 animate-fade-in">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={e => setCustomMinutes(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomConfirm()}
                placeholder="minutes"
                autoFocus
                className="w-24 px-3 py-2 rounded-xl border-2 border-mello-border text-center
                           text-mello-text text-sm focus:outline-none focus:border-mello-primary
                           bg-white"
              />
              <button
                onClick={handleCustomConfirm}
                className="px-4 py-2 bg-mello-secondary text-mello-text-soft text-sm font-medium
                           rounded-xl hover:bg-violet-200 active:scale-95 transition-all"
              >
                Set
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ring timer */}
      <div className="relative">
        <svg width="148" height="148" viewBox="0 0 120 120" aria-label={`Timer: ${timeStr}`}>
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#EDE9FE" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={isDone ? '#BBF7D0' : '#C4B5FD'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className="timer-ring transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-mello-text tabular-nums">{timeStr}</span>
          {isDone && <span className="text-xs text-mello-success-text font-semibold mt-1">done! 🌸</span>}
        </div>
      </div>

      {/* Encouraging phrase — shown while running */}
      {isRunning && (
        <p
          key={phraseIndex}
          className="text-sm text-mello-text-soft italic text-center animate-fade-in max-w-xs"
        >
          {ENCOURAGING_PHRASES[phraseIndex]}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!hasStarted ? (
          <button
            onClick={handleStart}
            className="px-7 py-3 bg-mello-primary text-white font-semibold rounded-2xl
                       hover:bg-violet-400 active:scale-95 transition-all shadow-soft"
          >
            ▶ Start timer
          </button>
        ) : (
          <>
            {!isDone && (
              <button
                onClick={() => setIsRunning(r => !r)}
                className="px-5 py-2.5 bg-mello-secondary text-mello-text font-medium rounded-xl
                           hover:bg-violet-200 active:scale-95 transition-all text-sm"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
            )}
            {!isDone && (
              <button
                onClick={() => setSecondsLeft(s => s + 300)}
                className="px-4 py-2.5 bg-mello-secondary text-mello-text-soft font-medium rounded-xl
                           hover:bg-violet-200 active:scale-95 transition-all text-sm"
              >
                +5 min
              </button>
            )}
            <button
              onClick={() => { setSecondsLeft(null); setIsRunning(false) }}
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

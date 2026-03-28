import { useState } from 'react'
import Button from '../shared/Button'

/**
 * EnergyCheck Screen
 *
 * ADHD Psychology: Matching tasks to current cognitive state is critical.
 * Assigning a hard task when you're depleted creates failure and shame.
 * Asking "how are you?" first signals this app respects your state — building
 * psychological safety and reducing resistance to using it.
 *
 * Three options (not five) — too many choices creates paralysis.
 */

const ENERGY_OPTIONS = [
  {
    level: 'low',
    emoji: '🌿',
    label: 'Low energy',
    description: 'Something gentle please',
    bg: 'bg-green-50 hover:bg-green-100 border-green-200',
    selected: 'bg-green-100 border-green-400 ring-2 ring-green-200',
    dot: 'bg-green-300',
  },
  {
    level: 'medium',
    emoji: '☀️',
    label: 'Feeling okay',
    description: 'I can handle some things',
    bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    selected: 'bg-amber-100 border-amber-400 ring-2 ring-amber-200',
    dot: 'bg-amber-300',
  },
  {
    level: 'high',
    emoji: '⚡',
    label: 'High energy',
    description: "Let's tackle something real",
    bg: 'bg-violet-50 hover:bg-violet-100 border-mello-border',
    selected: 'bg-violet-100 border-mello-primary ring-2 ring-mello-primary/30',
    dot: 'bg-mello-primary',
  },
]

export default function EnergyCheck({ onSelect, completedCount = 0 }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (level) => {
    setSelected(level)
    // Small delay so they can see the selection before moving on
    setTimeout(() => onSelect(level), 300)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 screen-enter">
      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="text-5xl animate-float" aria-hidden>🌸</div>
        <h1 className="text-3xl font-bold text-mello-text">Hey there.</h1>
        <p className="text-mello-text-soft text-lg">
          How's your energy right now?
        </p>
        <p className="text-mello-text-muted text-sm">
          No wrong answer — this helps me help you.
        </p>
      </div>

      {/* Energy Options */}
      <div className="w-full max-w-sm space-y-3">
        {ENERGY_OPTIONS.map((option) => (
          <button
            key={option.level}
            onClick={() => handleSelect(option.level)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-2xl border
              transition-all duration-200 active:scale-98 text-left
              ${selected === option.level ? option.selected : option.bg}
            `}
          >
            <span className="text-3xl" role="img" aria-label={option.label}>
              {option.emoji}
            </span>
            <div>
              <div className="font-semibold text-mello-text">{option.label}</div>
              <div className="text-sm text-mello-text-soft">{option.description}</div>
            </div>
            {selected === option.level && (
              <div className="ml-auto">
                <div className={`w-3 h-3 rounded-full ${option.dot} animate-bounce-gentle`} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Completed today counter — gentle encouragement */}
      {completedCount > 0 && (
        <div className="mt-8 text-center">
          <p className="text-mello-text-muted text-sm">
            ✨ You've completed{' '}
            <span className="text-mello-primary font-semibold">{completedCount}</span>{' '}
            {completedCount === 1 ? 'step' : 'steps'} today
          </p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import Button from '../shared/Button'
import Card from '../shared/Card'

/**
 * StuckMode Screen
 *
 * ADHD Psychology: "Stuck" is not a character flaw — it's a signal that the
 * task is still too ambiguous or too big. Instead of willpower, we apply
 * TASK DECOMPOSITION: make it smaller until the brain can picture doing it.
 *
 * Critical design choices:
 * - First words: "That's okay." — unconditional acceptance, zero judgment
 * - Micro-step is shown immediately
 * - Only ONE micro-step shown (not a new list)
 * - User can go even smaller ("still stuck") — recursive rescue
 * - Backing out to the original step is always available
 *
 * This is the most important screen in the app.
 */

export default function StuckMode({
  originalStep,
  microSteps,
  isLoading,
  stuckDepth,
  onTryMicroStep,
  onGoSmaller,
  onBack,
}) {
  const [startedTimer, setStartedTimer] = useState(false)

  // Show the first micro-step (or the only one)
  const microStep = microSteps?.[0] || null

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10 screen-enter max-w-lg mx-auto">
      {/* Back link */}
      <button
        onClick={onBack}
        className="self-start text-sm text-mello-text-muted hover:text-mello-text
                   flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-mello-secondary
                   transition-colors mb-8"
      >
        ← Back
      </button>

      {/* Empathy header — FIRST and MOST PROMINENT */}
      <div className="mb-8 animate-slide-up">
        <div className="text-4xl mb-4" aria-hidden>🤍</div>
        <h1 className="text-2xl font-bold text-mello-text mb-2">
          That's okay.
        </h1>
        <p className="text-mello-text-soft text-lg">
          {stuckDepth === 0
            ? "Let's make this even smaller."
            : stuckDepth === 1
            ? "Even tinier. You're doing the right thing."
            : "The smallest possible step. Anyone can do this."}
        </p>
      </div>

      {/* Original step (faded — context only) */}
      <div className="mb-4 px-4 py-3 rounded-xl bg-mello-secondary/60 text-sm text-mello-text-muted line-through">
        {originalStep}
      </div>

      {/* The micro-step */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-mello-primary animate-pulse-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      ) : microStep ? (
        <Card className="mb-6 animate-slide-up border-2 border-mello-primary/30">
          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-wide text-mello-text-muted mb-3 font-medium">
              Try this instead
            </p>
            <p className="text-xl font-bold text-mello-text leading-snug">
              {microStep}
            </p>
            <p className="text-sm text-mello-text-muted mt-3">
              Takes less than 2 minutes.
            </p>
          </div>
        </Card>
      ) : null}

      {/* Actions */}
      {!isLoading && microStep && (
        <div className="space-y-3">
          <Button onClick={onTryMicroStep} fullWidth size="lg" variant="primary">
            ▶ Try this tiny step
          </Button>

          {stuckDepth < 2 && (
            <Button onClick={onGoSmaller} fullWidth size="md" variant="secondary">
              Still stuck — make it even smaller
            </Button>
          )}

          <Button onClick={onBack} fullWidth size="md" variant="ghost">
            Go back to the original step
          </Button>
        </div>
      )}

      {/* Compassionate footer */}
      <div className="mt-auto pt-8 text-center space-y-1">
        <p className="text-sm text-mello-text-muted">
          Being stuck is normal. It means the step needed to be smaller.
        </p>
        <p className="text-xs text-mello-text-muted">
          You're figuring it out. That counts. 🌸
        </p>
      </div>
    </div>
  )
}

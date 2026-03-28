import { useState } from 'react'
import Button from '../shared/Button'
import ProgressDots from '../shared/ProgressDots'
import Timer from '../shared/Timer'
import Card from '../shared/Card'

/**
 * FocusMode Screen — The heart of Mello
 *
 * ADHD Psychology:
 * - ONE task visible → eliminates choice paralysis
 * - Big START button → removes ambiguity about the action
 * - "Just 5 minutes" → lowers the commitment threshold dramatically
 * - "I'm stuck" is equally prominent → normalizes difficulty, reduces shame
 * - Timer is visual → combats time blindness
 * - Progress dots but NOT a full list → shows progress without revealing the mountain
 * - Skipping is allowed with zero judgment → reduces avoidance from perfectionism
 */

const ENCOURAGING_PHRASES = [
  "You're doing great.",
  "One step at a time.",
  "That's all you need to do right now.",
  "You've got this.",
  "This is enough.",
  "Small steps count.",
]

function getPhrase(subtaskIndex) {
  return ENCOURAGING_PHRASES[subtaskIndex % ENCOURAGING_PHRASES.length]
}

export default function FocusMode({
  task,
  subtasks,
  currentSubtaskIndex,
  onComplete,
  onStuck,
  onSkipTask,
  onAddMore,
}) {
  const [showTimer, setShowTimer] = useState(false)
  const [timerDone, setTimerDone] = useState(false)

  const currentSubtask = subtasks[currentSubtaskIndex]
  const isLastSubtask = currentSubtaskIndex >= subtasks.length - 1

  if (!currentSubtask) return null

  const handleStart = () => {
    setShowTimer(true)
    setTimerDone(false)
  }

  const handleTimerComplete = () => {
    setTimerDone(true)
  }

  const handleDone = () => {
    setShowTimer(false)
    setTimerDone(false)
    onComplete()
  }

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10 screen-enter max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onAddMore}
          className="text-sm text-mello-text-muted hover:text-mello-text transition-colors px-3 py-1.5 rounded-lg hover:bg-mello-secondary"
        >
          + Add more
        </button>
        <ProgressDots total={subtasks.length} current={currentSubtaskIndex} />
        <button
          onClick={onSkipTask}
          className="text-sm text-mello-text-muted hover:text-mello-text transition-colors px-3 py-1.5 rounded-lg hover:bg-mello-secondary"
        >
          Skip
        </button>
      </div>

      {/* Parent task context */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-mello-text-muted font-medium mb-1">
          Working on
        </p>
        <p className="text-sm text-mello-text-soft font-medium line-clamp-1">
          {task?.title}
        </p>
      </div>

      {/* THE MAIN STEP — Big, centered, undeniable */}
      <Card className="mb-6 animate-slide-up">
        <div className="text-center py-4">
          <p className="text-sm text-mello-text-muted mb-4">
            Step {currentSubtaskIndex + 1} of {subtasks.length}
          </p>
          <p className="text-2xl font-bold text-mello-text leading-snug text-balance">
            {currentSubtask}
          </p>
          <p className="text-sm text-mello-text-muted mt-4 italic">
            {getPhrase(currentSubtaskIndex)}
          </p>
        </div>
      </Card>

      {/* Timer Section */}
      {showTimer ? (
        <div className="mb-6 flex flex-col items-center gap-4 animate-fade-in">
          <Timer
            initialSeconds={300}
            onComplete={handleTimerComplete}
          />
          {timerDone && (
            <p className="text-center text-mello-success-text font-semibold animate-slide-up">
              5 minutes done! Amazing! 🌟
            </p>
          )}
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="space-y-3">
        {!showTimer ? (
          <>
            {/* PRIMARY: Start */}
            <Button onClick={handleStart} fullWidth size="xl" variant="primary">
              ▶ Start — just 5 minutes
            </Button>
            {/* Already started, mark done */}
            <Button onClick={handleDone} fullWidth size="md" variant="success">
              ✓ I finished this step
            </Button>
          </>
        ) : (
          <Button onClick={handleDone} fullWidth size="xl" variant="success">
            ✓ Done with this step!
          </Button>
        )}

        {/* STUCK BUTTON — equally accessible, never hidden */}
        <Button
          onClick={onStuck}
          fullWidth
          size="md"
          variant="secondary"
        >
          😶 I'm stuck — make it smaller
        </Button>
      </div>

      {/* Subtle reassurance */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-xs text-mello-text-muted">
          {isLastSubtask
            ? "This is the last step — you're almost there 🌸"
            : `${subtasks.length - currentSubtaskIndex - 1} more tiny step${subtasks.length - currentSubtaskIndex - 1 !== 1 ? 's' : ''} after this`}
        </p>
      </div>
    </div>
  )
}

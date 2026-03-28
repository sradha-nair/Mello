/**
 * ProgressDots — Shows which micro-step we're on without showing the full list.
 *
 * ADHD Psychology: Shows progress without revealing all remaining steps at once.
 * Seeing 8 dots ahead feels overwhelming. Seeing dots without labels is just
 * enough to know "I'm making progress" without creating dread.
 */
export default function ProgressDots({ total, current }) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? 'w-2 h-2 bg-mello-primary opacity-40'    // completed
              : i === current
              ? 'w-3 h-3 bg-mello-primary'               // current
              : 'w-2 h-2 bg-mello-border'                // upcoming
          }`}
        />
      ))}
    </div>
  )
}

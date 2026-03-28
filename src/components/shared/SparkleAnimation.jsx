import { useEffect, useState } from 'react'

/**
 * SparkleAnimation — Gentle dopamine reward on task completion.
 *
 * ADHD Psychology: The ADHD brain is reward-deficient. Small, visual rewards
 * after completing even a micro-step release dopamine and reinforce the behavior
 * of task completion. Must be CALMING, not overstimulating — soft colors only.
 */

const COLORS = ['#C4B5FD', '#FBCFE8', '#BBF7D0', '#FDE68A', '#A5F3FC']
const SHAPES = ['●', '✦', '✿', '◆', '★']

function ConfettiPiece({ x, color, shape, delay, duration }) {
  return (
    <div
      className="confetti-piece"
      style={{
        left: `${x}%`,
        top: '-20px',
        color,
        fontSize: '12px',
        '--delay': `${delay}s`,
        '--duration': `${duration}s`,
      }}
    >
      {shape}
    </div>
  )
}

export default function SparkleAnimation({ active, count = 18 }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) {
      setPieces([])
      return
    }

    const newPieces = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 1.5,
    }))

    setPieces(newPieces)

    const timeout = setTimeout(() => setPieces([]), 4000)
    return () => clearTimeout(timeout)
  }, [active, count])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden>
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </div>
  )
}

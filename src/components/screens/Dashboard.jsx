import { useMemo } from 'react'
import Button from '../shared/Button'
import { CATEGORIES } from '../../lib/categories'

/**
 * Dashboard Screen
 *
 * ADHD Psychology:
 * - Stats should feel CELEBRATORY, not like a report card.
 * - No "missed days" counter, no overdue warnings, no failure metrics.
 * - Show what was accomplished, not what wasn't.
 * - Keep it scannable — the ADHD brain shouldn't have to hunt for the number.
 * - Streak counter is motivating IF it celebrates, not shames.
 */

function formatTime(seconds) {
  if (!seconds || seconds < 60) return `${seconds || 0}s`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

function StatCard({ label, value, sub, emoji }) {
  return (
    <div className="bg-white rounded-2xl border border-mello-border p-4 flex flex-col gap-1 shadow-card">
      <div className="text-2xl" aria-hidden>{emoji}</div>
      <div className="text-2xl font-bold text-mello-text">{value}</div>
      <div className="text-xs font-semibold text-mello-text-soft uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-mello-text-muted">{sub}</div>}
    </div>
  )
}

function WeeklyChart({ last7 }) {
  const max = Math.max(...last7.map(d => d.count), 1)
  return (
    <div className="bg-white rounded-2xl border border-mello-border p-5 shadow-card">
      <h3 className="text-sm font-semibold text-mello-text-soft uppercase tracking-wide mb-4">
        Last 7 days
      </h3>
      <div className="flex items-end justify-between gap-1 h-20">
        {last7.map(day => (
          <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '60px' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${
                  day.label === 'Today'
                    ? 'bg-mello-primary'
                    : day.count > 0
                    ? 'bg-mello-primary/50'
                    : 'bg-mello-border'
                }`}
                style={{ height: day.count > 0 ? `${Math.max((day.count / max) * 60, 8)}px` : '4px' }}
              />
            </div>
            <span className={`text-xs ${day.label === 'Today' ? 'text-mello-primary font-semibold' : 'text-mello-text-muted'}`}>
              {day.label}
            </span>
            {day.count > 0 && (
              <span className="text-xs text-mello-text-muted">{day.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryBreakdown({ catCounts }) {
  const total = Object.values(catCounts).reduce((s, n) => s + n, 0)
  if (total === 0) return null

  const entries = Object.entries(catCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-mello-border p-5 shadow-card">
      <h3 className="text-sm font-semibold text-mello-text-soft uppercase tracking-wide mb-4">
        By category
      </h3>
      <div className="space-y-3">
        {entries.map(([cat, count]) => {
          const meta = CATEGORIES.find(c => c.id === cat) || CATEGORIES.find(c => c.id === 'uncategorized')
          const pct = Math.round((count / total) * 100)
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-mello-text flex items-center gap-1.5">
                  <span>{meta?.emoji}</span>
                  <span>{meta?.label || cat}</span>
                </span>
                <span className="text-xs text-mello-text-muted">{count} step{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-2 bg-mello-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: meta?.color || '#C4B5FD' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentTasks({ tasks }) {
  if (tasks.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-mello-border p-5 shadow-card">
      <h3 className="text-sm font-semibold text-mello-text-soft uppercase tracking-wide mb-4">
        Recently completed
      </h3>
      <div className="space-y-2">
        {tasks.map(task => {
          const meta = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[CATEGORIES.length - 1]
          return (
            <div key={task.id} className="flex items-center gap-3 py-2 border-b border-mello-border last:border-0">
              <span className="text-base" aria-hidden>{meta?.emoji}</span>
              <span className="text-sm text-mello-text flex-1 line-clamp-1">{task.title}</span>
              <span className="text-xs text-mello-success-text bg-mello-success px-2 py-0.5 rounded-full font-medium">
                done
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard({ stats, user, onBack, onSignOut }) {
  const {
    stepsToday = 0,
    focusTimeToday = 0,
    totalSteps = 0,
    totalFocusTime = 0,
    streak = 0,
    last7 = [],
    catCounts = {},
    completedTasks = [],
  } = stats

  const firstName = useMemo(() => {
    const email = user?.email || ''
    return email.split('@')[0].split('.')[0] || null
  }, [user])

  const streakEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱'
  const streakLabel = streak === 0 ? 'Start your streak today' : `${streak} day${streak !== 1 ? 's' : ''} in a row`

  return (
    <div className="min-h-dvh px-5 py-10 screen-enter max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-mello-text">
            {firstName ? `Hey, ${firstName} 👋` : 'Your progress 🌸'}
          </h1>
          <p className="text-sm text-mello-text-muted mt-0.5">
            {user ? user.email : 'Local session — no account'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-mello-secondary text-mello-text-soft text-sm font-medium
                     rounded-xl hover:bg-violet-200 active:scale-95 transition-all"
        >
          Focus →
        </button>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          emoji="✅"
          label="Steps today"
          value={stepsToday}
          sub={stepsToday === 0 ? 'Nothing yet today' : 'Nice work!'}
        />
        <StatCard
          emoji="⏱️"
          label="Focus time"
          value={formatTime(focusTimeToday)}
          sub="today"
        />
        <StatCard
          emoji={streakEmoji}
          label="Day streak"
          value={streak}
          sub={streakLabel}
        />
        <StatCard
          emoji="🏆"
          label="All-time steps"
          value={totalSteps}
          sub={totalFocusTime > 0 ? `${formatTime(totalFocusTime)} total` : null}
        />
      </div>

      {/* Weekly chart */}
      {last7.length > 0 && (
        <div className="mb-4">
          <WeeklyChart last7={last7} />
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(catCounts).length > 0 && (
        <div className="mb-4">
          <CategoryBreakdown catCounts={catCounts} />
        </div>
      )}

      {/* Recent completed tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-8">
          <RecentTasks tasks={completedTasks} />
        </div>
      )}

      {/* Empty state */}
      {stepsToday === 0 && totalSteps === 0 && (
        <div className="text-center py-8 mb-8">
          <div className="text-4xl mb-3" aria-hidden>🌱</div>
          <p className="text-mello-text-soft font-medium">No steps yet</p>
          <p className="text-mello-text-muted text-sm mt-1">
            Complete your first step to see stats here.
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="space-y-3">
        <Button onClick={onBack} fullWidth size="lg" variant="primary">
          Back to focus
        </Button>
        {user && (
          <Button onClick={onSignOut} fullWidth size="sm" variant="ghost">
            Sign out
          </Button>
        )}
        {!user && (
          <p className="text-center text-xs text-mello-text-muted">
            Sign in to save progress across devices and sessions.
          </p>
        )}
      </div>
    </div>
  )
}

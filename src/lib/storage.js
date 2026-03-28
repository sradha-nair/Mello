/**
 * LocalStorage persistence for Mello
 *
 * ADHD Psychology: Users must never lose their work.
 * Auto-save removes the fear of "what if I close the tab."
 * State is always recoverable, which reduces anxiety.
 */

const STORAGE_KEYS = {
  TASKS: 'mello_tasks',
  STATE: 'mello_app_state',
  ENERGY: 'mello_energy',
  COMPLETED_COUNT: 'mello_completed_count',
  FOCUS_SESSIONS: 'mello_focus_sessions',
  CATEGORIES: 'mello_categories',
  STREAK: 'mello_streak',
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function saveTasks(tasks) {
  try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)) } catch {}
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ── App State ─────────────────────────────────────────────────────────────────

export function saveAppState(state) {
  try {
    const minimal = {
      energyLevel: state.energyLevel,
      currentTaskIndex: state.currentTaskIndex,
      currentSubtaskIndex: state.currentSubtaskIndex,
    }
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(minimal))
  } catch {}
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ── Energy ────────────────────────────────────────────────────────────────────

export function saveEnergyLevel(level) {
  try { localStorage.setItem(STORAGE_KEYS.ENERGY, level) } catch {}
}

export function loadEnergyLevel() {
  try { return localStorage.getItem(STORAGE_KEYS.ENERGY) || null } catch { return null }
}

// ── Completed Count + Streak ──────────────────────────────────────────────────

export function incrementCompletedCount() {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10)
    const next = current + 1
    localStorage.setItem(STORAGE_KEYS.COMPLETED_COUNT, String(next))
    updateStreak()
    return next
  } catch { return 1 }
}

export function loadCompletedCount() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10)
  } catch { return 0 }
}

// ── Streak ────────────────────────────────────────────────────────────────────

function todayDateStr() {
  return new Date().toISOString().slice(0, 10) // "2026-03-28"
}

function updateStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK)
    const streak = raw ? JSON.parse(raw) : { count: 0, lastDate: null }
    const today = todayDateStr()

    if (streak.lastDate === today) return // already updated today

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)

    streak.count = streak.lastDate === yStr ? streak.count + 1 : 1
    streak.lastDate = today
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak))
  } catch {}
}

export function loadStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK)
    if (!raw) return 0
    const streak = JSON.parse(raw)
    // Streak expires if last activity was more than 1 day ago
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    if (streak.lastDate !== todayDateStr() && streak.lastDate !== yStr) return 0
    return streak.count || 0
  } catch { return 0 }
}

// ── Focus Sessions ────────────────────────────────────────────────────────────
// Each completed timer run saves a session record.

/**
 * @param {{ taskId: string, taskTitle: string, category: string, duration: number }} session
 */
export function saveFocusSession(session) {
  try {
    const sessions = loadFocusSessions()
    sessions.push({
      ...session,
      completedAt: new Date().toISOString(),
      date: todayDateStr(),
    })
    // Keep last 200 sessions
    const trimmed = sessions.slice(-200)
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(trimmed))
  } catch {}
}

export function loadFocusSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ── Categories ────────────────────────────────────────────────────────────────

export function saveCategory(taskId, category) {
  try {
    const cats = loadCategories()
    cats[taskId] = category
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats))
  } catch {}
}

export function loadCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export function getStatsForDashboard() {
  const sessions = loadFocusSessions()
  const tasks = loadTasks()
  const categories = loadCategories()
  const today = todayDateStr()

  // Steps completed today
  const todaySessions = sessions.filter(s => s.date === today)
  const stepsToday = todaySessions.length

  // Total focus time today (seconds)
  const focusTimeToday = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0)

  // All-time totals
  const totalSteps = loadCompletedCount()
  const totalFocusTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)

  // Last 7 days activity
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' })
    const count = sessions.filter(s => s.date === dateStr).length
    last7.push({ date: dateStr, label: dayLabel, count })
  }

  // Category breakdown (from completed tasks + sessions)
  const catCounts = {}
  sessions.forEach(s => {
    const cat = s.category || 'uncategorized'
    catCounts[cat] = (catCounts[cat] || 0) + 1
  })

  // Completed tasks list (most recent first)
  const completedTasks = tasks
    .filter(t => t.status === 'completed')
    .map(t => ({
      ...t,
      category: categories[t.id] || 'uncategorized',
    }))
    .reverse()
    .slice(0, 10)

  return {
    stepsToday,
    focusTimeToday,
    totalSteps,
    totalFocusTime,
    streak: loadStreak(),
    last7,
    catCounts,
    completedTasks,
  }
}

// ── Reset ─────────────────────────────────────────────────────────────────────

export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  } catch {}
}

// ── ID Generation ─────────────────────────────────────────────────────────────

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

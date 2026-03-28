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
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  } catch {}
}

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

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
  } catch {
    return null
  }
}

export function saveEnergyLevel(level) {
  try {
    localStorage.setItem(STORAGE_KEYS.ENERGY, level)
  } catch {}
}

export function loadEnergyLevel() {
  try {
    return localStorage.getItem(STORAGE_KEYS.ENERGY) || null
  } catch {
    return null
  }
}

export function incrementCompletedCount() {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10)
    const next = current + 1
    localStorage.setItem(STORAGE_KEYS.COMPLETED_COUNT, String(next))
    return next
  } catch {
    return 1
  }
}

export function loadCompletedCount() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.COMPLETED_COUNT) || '0', 10)
  } catch {
    return 0
  }
}

export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  } catch {}
}

/**
 * Generate a simple unique ID (no dependencies needed)
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

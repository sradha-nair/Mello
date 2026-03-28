/**
 * Supabase client for Mello
 *
 * Optional cloud persistence. The app works fully without this.
 * When Supabase is configured, tasks sync across devices.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

/**
 * Save tasks to Supabase (if configured).
 * Falls back gracefully if not configured.
 */
export async function syncTasksToCloud(tasks, userId) {
  if (!supabase || !userId) return

  try {
    const rows = tasks.map((task) => ({
      id: task.id,
      user_id: userId,
      title: task.title,
      energy_level: task.energy_level,
      status: task.status,
    }))

    await supabase.from('tasks').upsert(rows, { onConflict: 'id' })
  } catch (err) {
    console.warn('Supabase sync failed:', err.message)
  }
}

/**
 * Load tasks from Supabase for the current user.
 */
export async function loadTasksFromCloud(userId) {
  if (!supabase || !userId) return null

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase load failed:', err.message)
    return null
  }
}

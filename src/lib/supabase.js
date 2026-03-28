/**
 * Supabase client — auth + cloud persistence for Mello.
 * The app works fully without this (localStorage fallback).
 * When configured, tasks and sessions sync across devices.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Send a magic link to the user's email. No password required.
 * ADHD-friendly: removes the cognitive load of remembering passwords.
 */
export async function sendMagicLink(email) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/**
 * Get the current session (null if not signed in).
 */
export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Subscribe to auth state changes.
 * @param {(session) => void} callback
 */
export function onAuthChange(callback) {
  if (!supabase) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => subscription.unsubscribe()
}

// ── Tasks Sync ────────────────────────────────────────────────────────────────

export async function syncTasksToCloud(tasks, userId) {
  if (!supabase || !userId) return
  try {
    const rows = tasks.map(t => ({
      id: t.id,
      user_id: userId,
      title: t.title,
      energy_level: t.energy_level,
      status: t.status,
      category: t.category || 'uncategorized',
    }))
    await supabase.from('tasks').upsert(rows, { onConflict: 'id' })
  } catch (err) {
    console.warn('Supabase task sync failed:', err.message)
  }
}

export async function loadTasksFromCloud(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase task load failed:', err.message)
    return null
  }
}

// ── Focus Sessions Sync ───────────────────────────────────────────────────────

export async function syncSessionToCloud(session, userId) {
  if (!supabase || !userId) return
  try {
    await supabase.from('focus_sessions').insert({
      user_id: userId,
      task_id: session.taskId,
      task_title: session.taskTitle,
      category: session.category || 'uncategorized',
      duration: session.duration,
      completed_at: session.completedAt,
      date: session.date,
    })
  } catch (err) {
    console.warn('Supabase session sync failed:', err.message)
  }
}

export async function loadSessionsFromCloud(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(500)
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase session load failed:', err.message)
    return null
  }
}

// ── User Stats Sync ───────────────────────────────────────────────────────────

export async function upsertUserState(userId, state) {
  if (!supabase || !userId) return
  try {
    await supabase.from('user_state').upsert({
      user_id: userId,
      energy_level: state.energyLevel,
      current_task_id: state.currentTaskId || null,
      current_subtask_index: state.currentSubtaskIndex || 0,
      completed_count: state.completedCount || 0,
    }, { onConflict: 'user_id' })
  } catch (err) {
    console.warn('Supabase state sync failed:', err.message)
  }
}

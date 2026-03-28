import { useState } from 'react'
import Button from '../shared/Button'
import { sendMagicLink, isSupabaseConfigured } from '../../lib/supabase'

/**
 * Auth Screen — Magic link sign-in
 *
 * ADHD Psychology:
 * - No passwords — passwords are yet another thing to forget and feel bad about.
 *   Magic links remove that entirely.
 * - "Continue without account" is prominent — zero pressure to sign up.
 *   The app should help you NOW, not create a registration barrier.
 * - Sign-in is optional; it just unlocks persistence across devices + the dashboard.
 */

export default function Auth({ onSkip, onSignedIn }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSend = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Enter a valid email address.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      await sendMagicLink(trimmed)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Try again.')
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 screen-enter">
        <div className="text-5xl mb-6" aria-hidden>🔧</div>
        <h1 className="text-2xl font-bold text-mello-text mb-3 text-center">
          Accounts not set up yet
        </h1>
        <p className="text-mello-text-soft text-center mb-8 max-w-xs">
          Supabase isn't configured in this deployment. You can still use Mello — your tasks are saved locally in this browser.
        </p>
        <Button onClick={onSkip} fullWidth size="lg" variant="primary">
          Continue without account →
        </Button>
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 screen-enter">
        <div className="text-6xl mb-6 animate-float" aria-hidden>📬</div>
        <h1 className="text-2xl font-bold text-mello-text mb-3 text-center">
          Check your email
        </h1>
        <p className="text-mello-text-soft text-center mb-2 max-w-xs">
          We sent a sign-in link to
        </p>
        <p className="text-mello-primary font-semibold mb-8">{email}</p>
        <p className="text-mello-text-muted text-sm text-center max-w-xs mb-8">
          Click the link in the email and you'll be signed in automatically. No password needed.
        </p>
        <Button onClick={onSkip} fullWidth variant="secondary" size="md">
          Continue without account for now
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12 screen-enter max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-float" aria-hidden>🌸</div>
        <h1 className="text-3xl font-bold text-mello-text mb-2">Welcome to Mello</h1>
        <p className="text-mello-text-soft">
          Sign in to track your progress and sync across devices.
        </p>
      </div>

      {/* Email input */}
      <div className="w-full space-y-3 mb-6">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="your@email.com"
          autoFocus
          className={`
            w-full px-5 py-4 rounded-2xl border-2 text-mello-text text-lg
            placeholder:text-mello-text-muted bg-white
            focus:outline-none focus:border-mello-primary focus:shadow-glow/20
            transition-all
            ${errorMsg ? 'border-amber-300' : 'border-mello-border'}
          `}
        />
        {errorMsg && (
          <p className="text-amber-600 text-sm px-1">{errorMsg}</p>
        )}
        <Button
          onClick={handleSend}
          disabled={status === 'loading' || !email.trim()}
          fullWidth
          size="lg"
        >
          {status === 'loading' ? 'Sending…' : 'Send magic link →'}
        </Button>
        <p className="text-center text-xs text-mello-text-muted">
          No password. Just click the link in your email.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-mello-border" />
        <span className="text-mello-text-muted text-sm">or</span>
        <div className="flex-1 h-px bg-mello-border" />
      </div>

      {/* Skip */}
      <Button onClick={onSkip} fullWidth size="md" variant="secondary">
        Continue without account
      </Button>
      <p className="text-center text-xs text-mello-text-muted mt-3 max-w-xs">
        Tasks will be saved in this browser only. You can sign in later to unlock progress tracking.
      </p>
    </div>
  )
}

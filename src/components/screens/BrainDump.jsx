import { useState, useRef, useEffect } from 'react'
import Button from '../shared/Button'
import { CATEGORIES } from '../../lib/categories'

/**
 * BrainDump Screen
 *
 * ADHD Psychology: The ADHD brain holds tasks in working memory at a constant
 * low-grade anxiety cost. Externalizing them — getting them OUT — immediately
 * reduces cognitive load and anxiety.
 *
 * Design rules:
 * - No categories required — they're a soft tap, never forced
 * - Just: type → (optional category) → submit
 * - Auto-focus on the text area so they can start immediately
 * - Voice input supported for when typing feels hard
 */

export default function BrainDump({ energyLevel, onAddTask, onStartFocus, taskCount = 0 }) {
  const [value, setValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [addedTasks, setAddedTasks] = useState([])
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onAddTask(trimmed, selectedCategory || 'uncategorized')
    setAddedTasks(prev => [...prev, { title: trimmed, category: selectedCategory || 'uncategorized' }])
    setValue('')
    setSelectedCategory(null)
    textareaRef.current?.focus()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser.')
      return
    }
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setValue(transcript)
    }
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  const energyHints = {
    low: 'Something small is perfectly fine right now.',
    medium: "What's been on your mind?",
    high: 'What big thing do you want to tackle?',
  }

  const placeholders = {
    low: 'e.g. Reply to that email, tidy my desk...',
    medium: 'e.g. Finish the report draft, call the doctor...',
    high: 'e.g. Write the project proposal, refactor the codebase...',
  }

  // Show only first 5 categories + uncategorized
  const visibleCats = CATEGORIES.slice(0, 5)

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10 screen-enter max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-3xl mb-3" aria-hidden>🧠</div>
        <h1 className="text-2xl font-bold text-mello-text mb-1">What's on your mind?</h1>
        <p className="text-mello-text-soft">{energyHints[energyLevel] || energyHints.medium}</p>
        <p className="text-sm text-mello-text-muted mt-1">No organizing needed — just get it out.</p>
      </div>

      {/* Task input */}
      <div className="relative mb-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[energyLevel] || placeholders.medium}
          rows={3}
          className={`
            w-full px-5 py-4 pr-14
            bg-white border-2 rounded-2xl
            text-mello-text placeholder:text-mello-text-muted
            text-lg resize-none
            transition-all duration-200
            focus:outline-none focus:border-mello-primary focus:shadow-glow/30
            ${value ? 'border-mello-primary' : 'border-mello-border'}
          `}
        />
        <button
          onClick={toggleVoice}
          className={`
            absolute right-3 bottom-3
            w-9 h-9 rounded-xl flex items-center justify-center
            transition-all duration-200 active:scale-90
            ${isRecording
              ? 'bg-mello-accent recording-pulse text-pink-700'
              : 'bg-mello-secondary text-mello-text-soft hover:bg-violet-200'}
          `}
          title={isRecording ? 'Stop recording' : 'Voice input'}
          aria-label={isRecording ? 'Stop recording' : 'Use voice input'}
        >
          {isRecording ? '⏹' : '🎙️'}
        </button>
      </div>

      {/* Category picker — optional, low friction */}
      {value.trim() && (
        <div className="mb-4 animate-fade-in">
          <p className="text-xs text-mello-text-muted mb-2 font-medium">Category (optional)</p>
          <div className="flex flex-wrap gap-2">
            {visibleCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                  border transition-all active:scale-95
                  ${selectedCategory === cat.id
                    ? 'border-mello-primary bg-mello-secondary text-mello-text'
                    : 'border-mello-border bg-white text-mello-text-soft hover:bg-mello-secondary'}
                `}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      <Button onClick={handleSubmit} disabled={!value.trim()} fullWidth size="lg">
        Add to my list →
      </Button>

      {/* Recently added */}
      {addedTasks.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-mello-text-muted uppercase tracking-wide font-medium">
            Added ({addedTasks.length})
          </p>
          {addedTasks.slice(-4).map((t, i) => {
            const cat = CATEGORIES.find(c => c.id === t.category)
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-mello-secondary rounded-xl animate-slide-up">
                <span className="text-sm" aria-hidden>{cat?.emoji || '📌'}</span>
                <span className="text-mello-text-soft text-sm line-clamp-1 flex-1">{t.title}</span>
                <span className="text-mello-primary text-sm">✓</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Start focus CTA */}
      {taskCount > 0 && (
        <div className="mt-auto pt-8">
          <Button onClick={onStartFocus} variant="accent" fullWidth size="lg">
            Ready to start →
          </Button>
          <p className="text-center text-sm text-mello-text-muted mt-3">
            {taskCount} task{taskCount !== 1 ? 's' : ''} waiting · You can always add more later
          </p>
        </div>
      )}
    </div>
  )
}

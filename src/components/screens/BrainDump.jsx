import { useState, useRef, useEffect } from 'react'
import Button from '../shared/Button'

/**
 * BrainDump Screen
 *
 * ADHD Psychology: The ADHD brain holds tasks in working memory at a constant
 * low-grade anxiety cost. Externalizing them — getting them OUT — immediately
 * reduces cognitive load and anxiety.
 *
 * Design rules:
 * - No categories. No tags. No priority levels.
 * - Just: "What's in your head?" → type → submit
 * - Auto-focus on the text area so they can start immediately
 * - Voice input supported for when typing feels hard
 * - The task is added instantly with no friction
 */

export default function BrainDump({ energyLevel, onAddTask, onStartFocus, taskCount = 0 }) {
  const [value, setValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [addedTasks, setAddedTasks] = useState([])
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return

    onAddTask(trimmed)
    setAddedTasks((prev) => [...prev, trimmed])
    setValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Web Speech API for voice input
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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
      setValue(transcript)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  const energyHints = {
    low: "Something small is perfectly fine right now.",
    medium: "What's been on your mind?",
    high: "What big thing do you want to tackle?",
  }

  const placeholders = {
    low: "e.g. Reply to that email, tidy my desk, make a snack...",
    medium: "e.g. Finish the report draft, call the doctor, review notes...",
    high: "e.g. Write the project proposal, refactor the codebase...",
  }

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10 screen-enter max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-3xl mb-3" aria-hidden>🧠</div>
        <h1 className="text-2xl font-bold text-mello-text mb-1">
          What's on your mind?
        </h1>
        <p className="text-mello-text-soft">
          {energyHints[energyLevel] || energyHints.medium}
        </p>
        <p className="text-sm text-mello-text-muted mt-1">
          No organizing needed — just get it out.
        </p>
      </div>

      {/* Input area */}
      <div className="relative mb-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
        {/* Voice button */}
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

      {/* Add button */}
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        fullWidth
        size="lg"
      >
        Add to my list →
      </Button>

      {/* Recently added tasks */}
      {addedTasks.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-mello-text-muted uppercase tracking-wide font-medium">
            Added ({addedTasks.length})
          </p>
          <div className="space-y-2">
            {addedTasks.slice(-4).map((task, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 bg-mello-secondary rounded-xl animate-slide-up"
              >
                <span className="text-mello-primary text-sm">✓</span>
                <span className="text-mello-text-soft text-sm line-clamp-1">{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA to start focusing */}
      {taskCount > 0 && (
        <div className="mt-auto pt-8">
          <Button
            onClick={onStartFocus}
            variant="accent"
            fullWidth
            size="lg"
          >
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

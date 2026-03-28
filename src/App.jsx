/**
 * App.jsx — Mello's central state machine
 *
 * Screens flow:
 *  ENERGY_CHECK → BRAIN_DUMP → BREAKING_DOWN → FOCUS → CELEBRATION → (loop or ALL_DONE)
 *                                                    ↓
 *                                                STUCK_MODE → FOCUS
 *
 * Philosophy: Every screen transition must REDUCE friction, never add it.
 * The user should never feel lost or have to think about "what do I do next?"
 */

import { useState, useCallback, useEffect } from 'react'
import EnergyCheck from './components/screens/EnergyCheck'
import BrainDump from './components/screens/BrainDump'
import BreakingDown from './components/screens/BreakingDown'
import FocusMode from './components/screens/FocusMode'
import StuckMode from './components/screens/StuckMode'
import Celebration from './components/screens/Celebration'
import AllDone from './components/screens/AllDone'
import { breakdownTask, getStuckStep, suggestTaskByEnergy } from './lib/ai'
import {
  saveTasks,
  loadTasks,
  saveAppState,
  loadAppState,
  saveEnergyLevel,
  loadEnergyLevel,
  incrementCompletedCount,
  loadCompletedCount,
  clearAllData,
  generateId,
} from './lib/storage'

const SCREEN = {
  ENERGY_CHECK: 'energy_check',
  BRAIN_DUMP: 'brain_dump',
  BREAKING_DOWN: 'breaking_down',
  FOCUS: 'focus',
  STUCK: 'stuck',
  CELEBRATING_STEP: 'celebrating_step',
  CELEBRATING_TASK: 'celebrating_task',
  ALL_DONE: 'all_done',
}

export default function App() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState(SCREEN.ENERGY_CHECK)
  const [energyLevel, setEnergyLevel] = useState(null)

  // Tasks: [{ id, title, energy_level, status, subtasks: [] }]
  const [tasks, setTasks] = useState([])

  // Which task we're currently working on
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)

  // Subtasks for the current task
  const [currentSubtasks, setCurrentSubtasks] = useState([])
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(0)

  // Stuck mode state
  const [stuckMicroSteps, setStuckMicroSteps] = useState([])
  const [isLoadingStuck, setIsLoadingStuck] = useState(false)
  const [stuckDepth, setStuckDepth] = useState(0)

  // Completed steps counter (for dopamine feedback)
  const [completedCount, setCompletedCount] = useState(0)

  // ── Hydrate from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    const savedTasks = loadTasks()
    const savedState = loadAppState()
    const savedEnergy = loadEnergyLevel()
    const count = loadCompletedCount()

    setCompletedCount(count)

    if (savedTasks.length > 0) {
      setTasks(savedTasks)
    }

    if (savedState && savedTasks.length > 0) {
      setEnergyLevel(savedState.energyLevel || savedEnergy)
      const taskIdx = savedState.currentTaskIndex || 0
      setCurrentTaskIndex(taskIdx)

      const task = savedTasks[taskIdx]
      if (task?.subtasks?.length > 0) {
        setCurrentSubtasks(task.subtasks)
        setCurrentSubtaskIndex(savedState.currentSubtaskIndex || 0)
        // Restore to focus screen if we were in the middle of something
        if (task.status === 'active') {
          setScreen(SCREEN.FOCUS)
          return
        }
      }
    }
  }, [])

  // ── Persist state changes ───────────────────────────────────────────────────
  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    if (energyLevel) {
      saveEnergyLevel(energyLevel)
      saveAppState({ energyLevel, currentTaskIndex, currentSubtaskIndex })
    }
  }, [energyLevel, currentTaskIndex, currentSubtaskIndex])

  // ── Derived values ──────────────────────────────────────────────────────────
  const currentTask = tasks[currentTaskIndex] || null
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')
  const hasMoreTasks = currentTaskIndex < tasks.length - 1

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Step 1: User selects energy level */
  const handleEnergySelect = useCallback((level) => {
    setEnergyLevel(level)
    saveEnergyLevel(level)
    setScreen(SCREEN.BRAIN_DUMP)
  }, [])

  /** Step 2: User adds a task from brain dump */
  const handleAddTask = useCallback(
    (title) => {
      const newTask = {
        id: generateId(),
        title,
        energy_level: energyLevel || 'medium',
        status: 'pending',
        subtasks: [],
        createdAt: Date.now(),
      }
      setTasks((prev) => {
        const updated = [...prev, newTask]
        saveTasks(updated)
        return updated
      })
    },
    [energyLevel]
  )

  /** Step 3: User is ready to focus */
  const handleStartFocus = useCallback(async () => {
    // Find the first pending task (or energy-matched task)
    const allTasks = loadTasks()
    const pending = allTasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')

    if (pending.length === 0) {
      setScreen(SCREEN.ALL_DONE)
      return
    }

    const idx = tasks.findIndex((t) => t.id === pending[0].id)
    setCurrentTaskIndex(idx >= 0 ? idx : 0)
    setCurrentSubtaskIndex(0)
    await startBreakdown(pending[0], idx >= 0 ? idx : 0)
  }, [tasks])

  /** Begin AI breakdown for a task */
  const startBreakdown = async (task, taskIdx) => {
    setScreen(SCREEN.BREAKING_DOWN)
    try {
      const steps = await breakdownTask(task.title, energyLevel || 'medium')
      setCurrentSubtasks(steps)
      setCurrentSubtaskIndex(0)

      // Update task with subtasks and mark active
      setTasks((prev) => {
        const updated = prev.map((t, i) =>
          i === taskIdx
            ? { ...t, subtasks: steps, status: 'active' }
            : t
        )
        saveTasks(updated)
        return updated
      })

      setScreen(SCREEN.FOCUS)
    } catch (err) {
      console.error('Breakdown failed:', err)
      // Fallback: use the raw task as a single step
      const fallbackSteps = [task.title]
      setCurrentSubtasks(fallbackSteps)
      setCurrentSubtaskIndex(0)
      setScreen(SCREEN.FOCUS)
    }
  }

  /** User completes a subtask step */
  const handleCompleteStep = useCallback(() => {
    const newCount = incrementCompletedCount()
    setCompletedCount(newCount)

    const nextIdx = currentSubtaskIndex + 1

    if (nextIdx >= currentSubtasks.length) {
      // All subtasks done → task complete
      setTasks((prev) => {
        const updated = prev.map((t, i) =>
          i === currentTaskIndex ? { ...t, status: 'completed' } : t
        )
        saveTasks(updated)
        return updated
      })
      setScreen(SCREEN.CELEBRATING_TASK)
    } else {
      // More subtasks remain
      setCurrentSubtaskIndex(nextIdx)
      setStuckDepth(0)
      setScreen(SCREEN.CELEBRATING_STEP)
    }
  }, [currentSubtaskIndex, currentSubtasks.length, currentTaskIndex])

  /** User taps "I'm stuck" */
  const handleStuck = useCallback(async () => {
    const stuck = currentSubtasks[currentSubtaskIndex] || ''
    const taskTitle = currentTask?.title || ''

    setStuckMicroSteps([])
    setIsLoadingStuck(true)
    setStuckDepth(0)
    setScreen(SCREEN.STUCK)

    try {
      const microSteps = await getStuckStep(stuck, taskTitle)
      setStuckMicroSteps(microSteps)
    } catch {
      setStuckMicroSteps([`Just open the thing you need for: "${stuck}"`])
    } finally {
      setIsLoadingStuck(false)
    }
  }, [currentSubtasks, currentSubtaskIndex, currentTask])

  /** User wants to go even smaller from stuck mode */
  const handleGoEvenSmaller = useCallback(async () => {
    const currentMicroStep = stuckMicroSteps[0] || ''
    const taskTitle = currentTask?.title || ''

    setIsLoadingStuck(true)
    setStuckDepth((d) => d + 1)

    try {
      const tinySteps = await getStuckStep(currentMicroStep, taskTitle)
      setStuckMicroSteps(tinySteps)
    } catch {
      setStuckMicroSteps(['Just look at your screen', 'Take one slow breath', 'Move your mouse or tap once'])
    } finally {
      setIsLoadingStuck(false)
    }
  }, [stuckMicroSteps, currentTask])

  /** User tries the micro-step from stuck mode */
  const handleTryMicroStep = useCallback(() => {
    // Replace current subtask with the micro steps
    const newSubtasks = [
      ...stuckMicroSteps,
      ...currentSubtasks.slice(currentSubtaskIndex + 1),
    ]
    setCurrentSubtasks(newSubtasks)
    setCurrentSubtaskIndex(0)
    setStuckDepth(0)
    setScreen(SCREEN.FOCUS)
  }, [stuckMicroSteps, currentSubtasks, currentSubtaskIndex])

  /** User skips the current task */
  const handleSkipTask = useCallback(() => {
    setTasks((prev) => {
      const updated = prev.map((t, i) =>
        i === currentTaskIndex ? { ...t, status: 'skipped' } : t
      )
      saveTasks(updated)
      return updated
    })

    const nextPending = tasks.findIndex(
      (t, i) => i > currentTaskIndex && t.status !== 'completed' && t.status !== 'skipped'
    )

    if (nextPending >= 0) {
      setCurrentTaskIndex(nextPending)
      setCurrentSubtaskIndex(0)
      startBreakdown(tasks[nextPending], nextPending)
    } else {
      setScreen(SCREEN.ALL_DONE)
    }
  }, [currentTaskIndex, tasks])

  /** Continue after celebration */
  const handleContinueAfterCelebration = useCallback(() => {
    if (screen === SCREEN.CELEBRATING_STEP) {
      setScreen(SCREEN.FOCUS)
      return
    }

    // Task completed — find next task
    const nextPending = tasks.findIndex(
      (t, i) => i > currentTaskIndex && t.status !== 'completed' && t.status !== 'skipped'
    )

    if (nextPending >= 0) {
      setCurrentTaskIndex(nextPending)
      setCurrentSubtaskIndex(0)
      startBreakdown(tasks[nextPending], nextPending)
    } else {
      setScreen(SCREEN.ALL_DONE)
    }
  }, [screen, tasks, currentTaskIndex])

  /** Take a break — go back to energy check */
  const handleTakeBreak = useCallback(() => {
    setScreen(SCREEN.ENERGY_CHECK)
  }, [])

  /** Fresh start — clear everything */
  const handleFreshStart = useCallback(() => {
    clearAllData()
    setTasks([])
    setCurrentTaskIndex(0)
    setCurrentSubtasks([])
    setCurrentSubtaskIndex(0)
    setEnergyLevel(null)
    setCompletedCount(0)
    setStuckDepth(0)
    setScreen(SCREEN.ENERGY_CHECK)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  // Background gradient subtly changes per screen — psychological grounding
  const bgGradients = {
    [SCREEN.ENERGY_CHECK]: 'bg-gradient-to-b from-mello-bg to-violet-50',
    [SCREEN.BRAIN_DUMP]: 'bg-gradient-to-b from-mello-bg to-pink-50',
    [SCREEN.BREAKING_DOWN]: 'bg-mello-bg',
    [SCREEN.FOCUS]: 'bg-gradient-to-b from-mello-bg via-mello-bg to-violet-50',
    [SCREEN.STUCK]: 'bg-gradient-to-b from-mello-bg to-pink-50',
    [SCREEN.CELEBRATING_STEP]: 'bg-gradient-to-b from-mello-bg to-green-50',
    [SCREEN.CELEBRATING_TASK]: 'bg-gradient-to-b from-mello-bg to-violet-100',
    [SCREEN.ALL_DONE]: 'bg-gradient-to-b from-violet-50 to-mello-bg',
  }

  return (
    <div className={`min-h-dvh transition-colors duration-500 ${bgGradients[screen] || 'bg-mello-bg'}`}>
      {/* Screen Router */}

      {screen === SCREEN.ENERGY_CHECK && (
        <EnergyCheck
          onSelect={handleEnergySelect}
          completedCount={completedCount}
        />
      )}

      {screen === SCREEN.BRAIN_DUMP && (
        <BrainDump
          energyLevel={energyLevel}
          onAddTask={handleAddTask}
          onStartFocus={handleStartFocus}
          taskCount={tasks.filter((t) => t.status === 'pending').length}
        />
      )}

      {screen === SCREEN.BREAKING_DOWN && (
        <BreakingDown taskTitle={currentTask?.title} />
      )}

      {screen === SCREEN.FOCUS && currentTask && (
        <FocusMode
          task={currentTask}
          subtasks={currentSubtasks}
          currentSubtaskIndex={currentSubtaskIndex}
          onComplete={handleCompleteStep}
          onStuck={handleStuck}
          onSkipTask={handleSkipTask}
          onAddMore={() => setScreen(SCREEN.BRAIN_DUMP)}
        />
      )}

      {screen === SCREEN.STUCK && (
        <StuckMode
          originalStep={currentSubtasks[currentSubtaskIndex] || ''}
          microSteps={stuckMicroSteps}
          isLoading={isLoadingStuck}
          stuckDepth={stuckDepth}
          onTryMicroStep={handleTryMicroStep}
          onGoSmaller={handleGoEvenSmaller}
          onBack={() => setScreen(SCREEN.FOCUS)}
        />
      )}

      {screen === SCREEN.CELEBRATING_STEP && (
        <Celebration
          type="step"
          completedCount={completedCount}
          hasMoreSteps={currentSubtaskIndex < currentSubtasks.length - 1}
          hasMoreTasks={hasMoreTasks}
          onContinue={handleContinueAfterCelebration}
          onTakeBreak={handleTakeBreak}
          onReset={handleFreshStart}
          stepIndex={currentSubtaskIndex}
        />
      )}

      {screen === SCREEN.CELEBRATING_TASK && (
        <Celebration
          type="task"
          completedCount={completedCount}
          hasMoreSteps={false}
          hasMoreTasks={hasMoreTasks}
          onContinue={handleContinueAfterCelebration}
          onTakeBreak={handleTakeBreak}
          onReset={handleFreshStart}
          stepIndex={currentTaskIndex}
        />
      )}

      {screen === SCREEN.ALL_DONE && (
        <AllDone
          completedCount={completedCount}
          onFreshStart={handleFreshStart}
        />
      )}

      {/* Reset button — always accessible, never judgmental */}
      {screen !== SCREEN.ENERGY_CHECK && screen !== SCREEN.ALL_DONE && (
        <button
          onClick={handleFreshStart}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm
                     border border-mello-border shadow-card text-mello-text-muted text-lg
                     hover:bg-mello-secondary hover:text-mello-text
                     transition-all active:scale-90 z-40"
          title="Fresh start (resets everything)"
          aria-label="Reset and start fresh"
        >
          ↺
        </button>
      )}
    </div>
  )
}

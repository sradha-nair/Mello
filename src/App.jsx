import { useState, useCallback, useEffect } from 'react'
import Auth from './components/screens/Auth'
import EnergyCheck from './components/screens/EnergyCheck'
import BrainDump from './components/screens/BrainDump'
import BreakingDown from './components/screens/BreakingDown'
import FocusMode from './components/screens/FocusMode'
import StuckMode from './components/screens/StuckMode'
import Celebration from './components/screens/Celebration'
import AllDone from './components/screens/AllDone'
import Dashboard from './components/screens/Dashboard'
import { breakdownTask, getStuckStep } from './lib/ai'
import {
  saveTasks, loadTasks,
  saveAppState, loadAppState,
  saveEnergyLevel, loadEnergyLevel,
  incrementCompletedCount, loadCompletedCount,
  saveFocusSession, saveCategory, loadCategories,
  getStatsForDashboard,
  clearAllData, generateId,
} from './lib/storage'
import { onAuthChange, signOut, isSupabaseConfigured, syncSessionToCloud, syncTasksToCloud } from './lib/supabase'

const SCREEN = {
  AUTH: 'auth',
  ENERGY_CHECK: 'energy_check',
  BRAIN_DUMP: 'brain_dump',
  BREAKING_DOWN: 'breaking_down',
  FOCUS: 'focus',
  STUCK: 'stuck',
  CELEBRATING_STEP: 'celebrating_step',
  CELEBRATING_TASK: 'celebrating_task',
  ALL_DONE: 'all_done',
  DASHBOARD: 'dashboard',
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.AUTH)
  const [user, setUser] = useState(null)
  const [energyLevel, setEnergyLevel] = useState(null)
  const [tasks, setTasks] = useState([])
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [currentSubtasks, setCurrentSubtasks] = useState([])
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(0)
  const [stuckMicroSteps, setStuckMicroSteps] = useState([])
  const [isLoadingStuck, setIsLoadingStuck] = useState(false)
  const [stuckDepth, setStuckDepth] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  // Track when the current step timer started (for focus session recording)
  const [stepStartTime, setStepStartTime] = useState(null)

  // ── Auth listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthChange(session => {
      setUser(session?.user ?? null)
    })
    return unsub
  }, [])

  // ── Hydrate from localStorage ────────────────────────────────────────────
  useEffect(() => {
    const savedTasks = loadTasks()
    const savedState = loadAppState()
    const savedEnergy = loadEnergyLevel()
    const count = loadCompletedCount()

    setCompletedCount(count)

    if (savedTasks.length > 0) setTasks(savedTasks)

    if (savedState && savedTasks.length > 0) {
      setEnergyLevel(savedState.energyLevel || savedEnergy)
      const taskIdx = savedState.currentTaskIndex || 0
      setCurrentTaskIndex(taskIdx)
      const task = savedTasks[taskIdx]
      if (task?.subtasks?.length > 0) {
        setCurrentSubtasks(task.subtasks)
        setCurrentSubtaskIndex(savedState.currentSubtaskIndex || 0)
        if (task.status === 'active') {
          setScreen(SCREEN.FOCUS)
          return
        }
      }
    }

    // Default: go to energy check after auth
    setScreen(SCREEN.ENERGY_CHECK)
  }, [])

  // ── Persist on change ─────────────────────────────────────────────────────
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks)
      if (user) syncTasksToCloud(tasks, user.id)
    }
  }, [tasks, user])

  useEffect(() => {
    if (energyLevel) {
      saveEnergyLevel(energyLevel)
      saveAppState({ energyLevel, currentTaskIndex, currentSubtaskIndex })
    }
  }, [energyLevel, currentTaskIndex, currentSubtaskIndex])

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentTask = tasks[currentTaskIndex] || null
  const hasMoreTasks = tasks.some(
    (t, i) => i > currentTaskIndex && t.status !== 'completed' && t.status !== 'skipped'
  )

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAuthSkip = useCallback(() => setScreen(SCREEN.ENERGY_CHECK), [])

  const handleEnergySelect = useCallback(level => {
    setEnergyLevel(level)
    saveEnergyLevel(level)
    setScreen(SCREEN.BRAIN_DUMP)
  }, [])

  const handleAddTask = useCallback((title, category = 'uncategorized') => {
    const newTask = {
      id: generateId(),
      title,
      energy_level: energyLevel || 'medium',
      status: 'pending',
      subtasks: [],
      category,
      createdAt: Date.now(),
    }
    setTasks(prev => {
      const updated = [...prev, newTask]
      saveTasks(updated)
      saveCategory(newTask.id, category)
      return updated
    })
  }, [energyLevel])

  const handleStartFocus = useCallback(async () => {
    const allTasks = loadTasks()
    const pending = allTasks.filter(t => t.status !== 'completed' && t.status !== 'skipped')
    if (pending.length === 0) { setScreen(SCREEN.ALL_DONE); return }

    const idx = tasks.findIndex(t => t.id === pending[0].id)
    const targetIdx = idx >= 0 ? idx : 0
    setCurrentTaskIndex(targetIdx)
    setCurrentSubtaskIndex(0)
    await startBreakdown(pending[0], targetIdx)
  }, [tasks])

  const startBreakdown = async (task, taskIdx) => {
    setScreen(SCREEN.BREAKING_DOWN)
    try {
      const steps = await breakdownTask(task.title, energyLevel || 'medium')
      setCurrentSubtasks(steps)
      setCurrentSubtaskIndex(0)
      setStepStartTime(Date.now())
      setTasks(prev => {
        const updated = prev.map((t, i) =>
          i === taskIdx ? { ...t, subtasks: steps, status: 'active' } : t
        )
        saveTasks(updated)
        return updated
      })
      setScreen(SCREEN.FOCUS)
    } catch {
      const fallback = [task.title]
      setCurrentSubtasks(fallback)
      setCurrentSubtaskIndex(0)
      setStepStartTime(Date.now())
      setScreen(SCREEN.FOCUS)
    }
  }

  const handleCompleteStep = useCallback(() => {
    // Record focus session with duration
    const duration = stepStartTime ? Math.round((Date.now() - stepStartTime) / 1000) : 0
    const categories = loadCategories()
    const session = {
      taskId: currentTask?.id,
      taskTitle: currentTask?.title,
      category: categories[currentTask?.id] || currentTask?.category || 'uncategorized',
      duration,
    }
    saveFocusSession(session)
    if (user) syncSessionToCloud(session, user.id)

    const newCount = incrementCompletedCount()
    setCompletedCount(newCount)
    setStepStartTime(Date.now())

    const nextIdx = currentSubtaskIndex + 1
    if (nextIdx >= currentSubtasks.length) {
      setTasks(prev => {
        const updated = prev.map((t, i) =>
          i === currentTaskIndex ? { ...t, status: 'completed' } : t
        )
        saveTasks(updated)
        return updated
      })
      setScreen(SCREEN.CELEBRATING_TASK)
    } else {
      setCurrentSubtaskIndex(nextIdx)
      setStuckDepth(0)
      setScreen(SCREEN.CELEBRATING_STEP)
    }
  }, [stepStartTime, currentTask, currentSubtaskIndex, currentSubtasks.length, currentTaskIndex, user])

  const handleStuck = useCallback(async () => {
    const stuck = currentSubtasks[currentSubtaskIndex] || ''
    setStuckMicroSteps([])
    setIsLoadingStuck(true)
    setStuckDepth(0)
    setScreen(SCREEN.STUCK)
    try {
      const micro = await getStuckStep(stuck, currentTask?.title || '')
      setStuckMicroSteps(micro)
    } catch {
      setStuckMicroSteps([`Just open the thing you need for: "${stuck}"`])
    } finally {
      setIsLoadingStuck(false)
    }
  }, [currentSubtasks, currentSubtaskIndex, currentTask])

  const handleGoEvenSmaller = useCallback(async () => {
    setIsLoadingStuck(true)
    setStuckDepth(d => d + 1)
    try {
      const tiny = await getStuckStep(stuckMicroSteps[0] || '', currentTask?.title || '')
      setStuckMicroSteps(tiny)
    } catch {
      setStuckMicroSteps(['Just look at your screen', 'Take one slow breath', 'Move your mouse or tap once'])
    } finally {
      setIsLoadingStuck(false)
    }
  }, [stuckMicroSteps, currentTask])

  const handleTryMicroStep = useCallback(() => {
    const newSubtasks = [...stuckMicroSteps, ...currentSubtasks.slice(currentSubtaskIndex + 1)]
    setCurrentSubtasks(newSubtasks)
    setCurrentSubtaskIndex(0)
    setStuckDepth(0)
    setStepStartTime(Date.now())
    setScreen(SCREEN.FOCUS)
  }, [stuckMicroSteps, currentSubtasks, currentSubtaskIndex])

  const handleSkipTask = useCallback(() => {
    setTasks(prev => {
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

  const handleContinueAfterCelebration = useCallback(() => {
    if (screen === SCREEN.CELEBRATING_STEP) { setScreen(SCREEN.FOCUS); return }
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

  const handleTakeBreak = useCallback(() => setScreen(SCREEN.ENERGY_CHECK), [])

  const handleFreshStart = useCallback(() => {
    clearAllData()
    setTasks([])
    setCurrentTaskIndex(0)
    setCurrentSubtasks([])
    setCurrentSubtaskIndex(0)
    setEnergyLevel(null)
    setCompletedCount(0)
    setStuckDepth(0)
    setStepStartTime(null)
    setScreen(SCREEN.ENERGY_CHECK)
  }, [])

  const handleOpenDashboard = useCallback(() => setScreen(SCREEN.DASHBOARD), [])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setUser(null)
    setScreen(SCREEN.AUTH)
  }, [])

  // ── Background gradients per screen ──────────────────────────────────────
  const bgGradients = {
    [SCREEN.AUTH]: 'bg-gradient-to-b from-mello-bg to-violet-50',
    [SCREEN.ENERGY_CHECK]: 'bg-gradient-to-b from-mello-bg to-violet-50',
    [SCREEN.BRAIN_DUMP]: 'bg-gradient-to-b from-mello-bg to-pink-50',
    [SCREEN.BREAKING_DOWN]: 'bg-mello-bg',
    [SCREEN.FOCUS]: 'bg-gradient-to-b from-mello-bg via-mello-bg to-violet-50',
    [SCREEN.STUCK]: 'bg-gradient-to-b from-mello-bg to-pink-50',
    [SCREEN.CELEBRATING_STEP]: 'bg-gradient-to-b from-mello-bg to-green-50',
    [SCREEN.CELEBRATING_TASK]: 'bg-gradient-to-b from-mello-bg to-violet-100',
    [SCREEN.ALL_DONE]: 'bg-gradient-to-b from-violet-50 to-mello-bg',
    [SCREEN.DASHBOARD]: 'bg-mello-bg',
  }

  return (
    <div className={`min-h-dvh transition-colors duration-500 ${bgGradients[screen] || 'bg-mello-bg'}`}>

      {screen === SCREEN.AUTH && (
        <Auth onSkip={handleAuthSkip} onSignedIn={() => setScreen(SCREEN.ENERGY_CHECK)} />
      )}

      {screen === SCREEN.ENERGY_CHECK && (
        <EnergyCheck onSelect={handleEnergySelect} completedCount={completedCount} />
      )}

      {screen === SCREEN.BRAIN_DUMP && (
        <BrainDump
          energyLevel={energyLevel}
          onAddTask={handleAddTask}
          onStartFocus={handleStartFocus}
          taskCount={tasks.filter(t => t.status === 'pending').length}
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
        <AllDone completedCount={completedCount} onFreshStart={handleFreshStart} />
      )}

      {screen === SCREEN.DASHBOARD && (
        <Dashboard
          stats={getStatsForDashboard()}
          user={user}
          onBack={() => setScreen(currentTask ? SCREEN.FOCUS : SCREEN.ENERGY_CHECK)}
          onSignOut={handleSignOut}
        />
      )}

      {/* Dashboard button — accessible from all focus screens */}
      {![SCREEN.AUTH, SCREEN.DASHBOARD, SCREEN.BREAKING_DOWN].includes(screen) && (
        <button
          onClick={handleOpenDashboard}
          className="fixed top-5 right-5 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm
                     border border-mello-border shadow-card text-base
                     hover:bg-mello-secondary hover:scale-105
                     transition-all active:scale-90 z-40"
          title="View your progress"
          aria-label="Open dashboard"
        >
          📊
        </button>
      )}

      {/* Reset button */}
      {![SCREEN.AUTH, SCREEN.ENERGY_CHECK, SCREEN.ALL_DONE, SCREEN.DASHBOARD].includes(screen) && (
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

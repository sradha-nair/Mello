/**
 * AI Task Breakdown for Mello
 *
 * ADHD Psychology: Tasks feel big because they're ambiguous and undefined.
 * The brain avoids anything it can't fully picture.
 * Solution: Convert every task into steps so small they're visually obvious.
 *
 * Strategy:
 * 1. If VITE_ANTHROPIC_API_KEY is set → use real Claude API
 * 2. Otherwise → use our smart mock that still genuinely helps
 */

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

// ─── Smart Mock AI ────────────────────────────────────────────────────────────
// Pattern-based task breakdown. Works without any API key.
// Each entry provides energy-level-aware micro-steps.

const TASK_PATTERNS = [
  {
    keywords: ['email', 'reply', 'respond', 'message', 'send', 'write back'],
    low: [
      'Open your email app',
      'Find the email you need to reply to',
      'Read just the first line',
      'Type one sentence — anything at all',
      'Read what you wrote',
      'Hit send',
    ],
    medium: [
      'Open your email',
      'Find the message',
      'Read it through once',
      'Jot 2–3 bullet points of what to say',
      'Write the reply from your bullets',
      'Review it quickly',
      'Send it',
    ],
    high: [
      'Open your email',
      'Find all related emails for context',
      'Draft a thorough reply',
      'Review for tone and completeness',
      'Send',
    ],
  },
  {
    keywords: ['report', 'write', 'essay', 'document', 'paper', 'article', 'blog'],
    low: [
      'Open a new blank document',
      'Type the title at the top',
      'Write ONE sentence: what is this about?',
      'List 3 bullet points of main ideas',
      'Save the document',
    ],
    medium: [
      'Open your document or create a new one',
      'Write the title',
      'Write a one-paragraph intro (just get thoughts out)',
      'List the main sections as headings',
      'Flesh out the first section',
      'Save your work',
    ],
    high: [
      'Open the document',
      'Review any existing notes or outline',
      'Write the full introduction',
      'Work through each section',
      'Review and edit',
      'Save the final version',
    ],
  },
  {
    keywords: ['meeting', 'call', 'zoom', 'attend', 'join', 'prepare for'],
    low: [
      'Find the meeting link or location',
      'Check the meeting time',
      'Write down one thing you need to say or ask',
      'Join the meeting',
    ],
    medium: [
      'Check meeting details (time, link, attendees)',
      'Review any agenda or previous notes',
      'Prepare 1–2 talking points',
      'Set a 5-minute reminder',
      'Join on time',
    ],
    high: [
      'Review all meeting materials',
      'Prepare detailed talking points',
      'Draft any questions you want answered',
      'Block focus time before the meeting',
      'Join and participate actively',
    ],
  },
  {
    keywords: ['clean', 'tidy', 'organize', 'sort', 'declutter', 'desk', 'room'],
    low: [
      'Stand in the middle of the space',
      'Pick up just 3 things that are clearly trash',
      'Throw those 3 things away',
      'That\'s enough for now — notice what you did',
    ],
    medium: [
      'Set a 10-minute timer',
      'Put away anything that has an obvious home',
      'Create one "to sort later" pile for the rest',
      'Clear any surfaces you can see',
      'Stop when the timer goes off',
    ],
    high: [
      'Empty everything from one area first',
      'Sort into: keep, donate, trash',
      'Clean the surface underneath',
      'Put "keep" items back intentionally',
      'Deal with the donate/trash piles',
    ],
  },
  {
    keywords: ['exercise', 'workout', 'gym', 'run', 'walk', 'yoga', 'stretch'],
    low: [
      'Put on comfortable clothes',
      'Walk to the door',
      'Step outside (just for a moment)',
      'Walk for 5 minutes — that\'s the whole goal',
    ],
    medium: [
      'Change into workout clothes',
      'Pick ONE exercise (not a full routine)',
      'Do it for 10 minutes',
      'Stretch for 2 minutes',
      'You\'re done — great job',
    ],
    high: [
      'Get ready',
      'Warm up for 5 minutes',
      'Complete your planned workout',
      'Cool down',
      'Hydrate and recover',
    ],
  },
  {
    keywords: ['read', 'book', 'article', 'chapter', 'study', 'learn', 'review'],
    low: [
      'Find the reading material',
      'Open to the right page or section',
      'Read just the first paragraph',
      'Write one sentence about what you just read',
    ],
    medium: [
      'Get your reading material ready',
      'Set a 15-minute timer',
      'Read until the timer goes off',
      'Write 3 key points you remember',
    ],
    high: [
      'Prepare your reading space',
      'Read the full section or chapter',
      'Take notes as you go',
      'Summarize key takeaways',
      'Review your notes',
    ],
  },
  {
    keywords: ['code', 'fix', 'bug', 'build', 'develop', 'implement', 'feature', 'program'],
    low: [
      'Open the file or project',
      'Read the existing code for 5 minutes',
      'Write a comment describing what needs to happen',
      'Write just the function signature or first line',
    ],
    medium: [
      'Open the project',
      'Review the relevant code section',
      'Write the function or feature stub',
      'Implement the core logic',
      'Test it once manually',
    ],
    high: [
      'Review all related code and context',
      'Plan the implementation',
      'Write the full implementation',
      'Write tests',
      'Review and refactor',
      'Commit your work',
    ],
  },
  {
    keywords: ['call', 'phone', 'appointment', 'schedule', 'book'],
    low: [
      'Find the phone number',
      'Save it to your phone',
      'Set a reminder to call later today',
    ],
    medium: [
      'Find the phone number or booking link',
      'Check your calendar for a good time',
      'Make the call or book the appointment',
      'Add it to your calendar',
    ],
    high: [
      'Prepare what you need to say or ask',
      'Make the call',
      'Take notes during the conversation',
      'Follow up on any next steps',
    ],
  },
  {
    keywords: ['pay', 'bill', 'invoice', 'finance', 'budget', 'tax', 'bank'],
    low: [
      'Find the bill or payment info',
      'Open the payment method',
      'Just look at the amount owed',
      'Pay it (one click/tap)',
    ],
    medium: [
      'Gather all bills or invoices',
      'Check your account balance',
      'Pay the most urgent one',
      'Note the others for tomorrow',
    ],
    high: [
      'Gather all financial documents',
      'Review everything owed',
      'Pay all outstanding bills',
      'Update your budget tracker',
      'File receipts',
    ],
  },
]

const STUCK_MICRO_STEPS = {
  default: [
    'Just look at it — don\'t do anything yet',
    'Open the thing you need to work on',
    'Read or look at the first part only',
    'Write one word or do one tiny action',
    'Tell someone (or yourself) what the task is about',
  ],
}

function matchPattern(taskText, energyLevel) {
  const lower = taskText.toLowerCase()
  const level = energyLevel || 'medium'

  for (const pattern of TASK_PATTERNS) {
    if (pattern.keywords.some((kw) => lower.includes(kw))) {
      return pattern[level] || pattern.medium
    }
  }

  // Generic fallback — works for ANY task
  const genericSteps = {
    low: [
      `Open whatever you need for: "${taskText}"`,
      'Look at it for 60 seconds',
      'Do the single smallest piece you can see',
      'Stop — that\'s enough',
    ],
    medium: [
      `Write down what "${taskText}" actually means to do`,
      'Identify the very first physical action',
      'Do that one action',
      'Notice what the next obvious step is',
      'Do that too',
    ],
    high: [
      `Define what "done" looks like for: "${taskText}"`,
      'Break it into 3–5 major parts',
      'Start with the most important part',
      'Work through each part',
      'Review the result',
    ],
  }

  return genericSteps[level] || genericSteps.medium
}

// ─── Real AI via Claude API ───────────────────────────────────────────────────

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

const BREAKDOWN_SYSTEM_PROMPT = `You are a compassionate ADHD coach. Your job is to break tasks into the smallest, most non-intimidating steps possible.

RULES:
- Each step must be a single, concrete physical action
- Steps must feel EASY and OBVIOUS to start
- No step should take more than 5 minutes
- Never use vague words like "work on", "deal with", "handle"
- Use direct action words: Open, Type, Click, Write, Read, Find, Set
- For low energy: 3–4 steps maximum, very gentle
- For medium energy: 4–6 steps
- For high energy: 5–8 steps
- NEVER include motivational fluff in the steps themselves
- Return ONLY a JSON array of strings, nothing else

Example for "Write quarterly report" (medium energy):
["Open Google Docs", "Type the report title", "Write one sentence intro", "List 3 main topics as headings", "Write 2 sentences under the first heading", "Save your work"]`

const STUCK_SYSTEM_PROMPT = `You are a compassionate ADHD coach. A person is stuck on a task step and needs it broken down even further.

RULES:
- The new step must take LESS THAN 2 MINUTES
- It must be something anyone could do right now
- Remove ALL ambiguity
- It should feel almost embarrassingly easy
- Use first-person action words
- Return ONLY a JSON array of 1–3 even-smaller strings, nothing else

Example: If stuck on "Write the introduction", return:
["Open the document", "Type just the first word of the intro", "Type one more word"]`

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Break a task into micro-steps based on energy level.
 * @param {string} taskText - The raw task description
 * @param {string} energyLevel - 'low' | 'medium' | 'high'
 * @returns {Promise<string[]>} Array of micro-step strings
 */
export async function breakdownTask(taskText, energyLevel = 'medium') {
  if (API_KEY) {
    try {
      const result = await callClaude(
        BREAKDOWN_SYSTEM_PROMPT,
        `Task: "${taskText}"\nEnergy level: ${energyLevel}\n\nBreak this down into micro-steps.`
      )
      const parsed = JSON.parse(result)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch (err) {
      console.warn('Claude API failed, using smart mock:', err.message)
    }
  }

  // Smart mock fallback
  return matchPattern(taskText, energyLevel)
}

/**
 * Get an even smaller step when user is stuck.
 * @param {string} currentStep - The step they're stuck on
 * @param {string} taskContext - The parent task for context
 * @returns {Promise<string[]>} Array of 1–3 tinier steps
 */
export async function getStuckStep(currentStep, taskContext = '') {
  if (API_KEY) {
    try {
      const result = await callClaude(
        STUCK_SYSTEM_PROMPT,
        `The person is stuck on: "${currentStep}"\nThe overall task is: "${taskContext}"\n\nMake it even smaller.`
      )
      const parsed = JSON.parse(result)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch (err) {
      console.warn('Claude API failed, using mock stuck steps:', err.message)
    }
  }

  // Mock: Always provide a sensible further breakdown
  const lower = currentStep.toLowerCase()

  if (lower.includes('write') || lower.includes('type')) {
    return ['Open the document', 'Click where you need to type', 'Type just one word']
  }
  if (lower.includes('open') || lower.includes('find')) {
    return ['Look at your screen', 'Move your mouse or tap your phone', 'Click the app icon']
  }
  if (lower.includes('read')) {
    return ['Pick up or open the thing to read', 'Look at the very first word', 'Read just the first sentence']
  }
  if (lower.includes('call') || lower.includes('phone')) {
    return ['Find the phone number', 'Open your phone', 'Dial the first 3 digits']
  }

  // Generic stuck rescue
  return [
    `Just look at "${currentStep}" — don't do anything yet`,
    'Take one breath',
    'Do the tiniest piece you can imagine',
  ]
}

/**
 * Suggest a task based on energy level from available tasks.
 * @param {Array} tasks - List of task objects
 * @param {string} energyLevel - 'low' | 'medium' | 'high'
 * @returns {object|null} Best matched task
 */
export function suggestTaskByEnergy(tasks, energyLevel) {
  if (!tasks || tasks.length === 0) return null

  const pending = tasks.filter((t) => t.status !== 'completed')
  if (pending.length === 0) return null

  // Prefer tasks that match energy level
  const matched = pending.filter((t) => t.energy_level === energyLevel)
  if (matched.length > 0) return matched[0]

  // Fall back to any pending task
  return pending[0]
}

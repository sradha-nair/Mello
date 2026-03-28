<div align="center">

# 🌸 Mello

### An ADHD-friendly focus app — not a task manager.

**[→ Try the live demo](https://mello-black.vercel.app/)**

> ⚠️ **Demo** — No accounts or long-term progress tracking yet. Tasks live in your browser only.

<br/>

![Made with React](https://img.shields.io/badge/React-18-C4B5FD?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-C4B5FD?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-C4B5FD?style=flat-square&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-C4B5FD?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## What is Mello?

Most productivity apps fail people with ADHD — not because they're bad apps, but because they're built for neurotypical brains. They show long lists, demand categorization, require planning, and punish missed deadlines.

**Mello does the opposite.**

It's not a planner. It's not a dashboard. It's a gentle system that answers one question at a time:

> *"What's the one tiny thing I can do right now?"*

Mello takes whatever is on your mind, breaks it into steps so small they feel almost embarrassingly easy to start, then shows you exactly **one step** — with one button.

---

## Why ADHD brains need something different

People with ADHD aren't lazy or disorganized. They're dealing with real neurological differences:

| What ADHD feels like | What most apps do | What Mello does |
|---|---|---|
| Starting a task feels impossible | Show a full to-do list | Show **one step** with a "just 5 minutes" button |
| Too many choices = shutdown | Let you build complex systems | Three buttons. One action. |
| "What does this even mean?" | Accept vague task names | AI breaks it into concrete physical actions |
| Being stuck feels shameful | Show the same task again | "That's okay — let's make it smaller" |
| Time feels slippery | Show due dates and overdue counts | Visual timer ring, no deadlines |
| Motivation is inconsistent | Expect the same effort every day | Match tasks to your current energy level |
| Rewards feel distant | Mark as complete, move on | Sparkle animation + kind words after every tiny step |

---

## Features

### 🌿 Energy Check
Before anything else, Mello asks: *"How's your energy right now?"*

Low energy, medium, or high — your answer shapes which tasks get suggested and how the steps are framed. A depleted brain gets gentler, shorter steps. A focused brain gets fuller tasks. No mismatch, no failure.

### 🧠 Brain Dump
A single text field. No categories, no tags, no priority levels.

Just: *"What's in your head?"* — type it, hit enter, done. Voice input supported for when typing feels like too much. Every task is captured instantly with zero friction.

### ✨ AI Task Breakdown
This is the core feature. Once you add a task, Mello (powered by Claude or a built-in smart fallback) converts it into micro-steps — each one a single, concrete physical action.

**"Write the quarterly report"** becomes:
1. Open Google Docs
2. Type the report title
3. Write one sentence about what this report covers
4. List 3 section headings
5. Write 2 sentences under the first heading
6. Save your work

Each step should feel obvious. If it doesn't, there's a button for that.

### 🎯 One Task at a Time
The main screen shows **exactly one step**. Not a list. Not a preview of what's coming. One step.

This eliminates choice paralysis — the ADHD brain's number one productivity killer. There's nothing to decide. There's just the thing right in front of you.

### ⏱️ Five-Minute Start Mode
The hardest part is starting. Mello's primary button says:

**"▶ Start — just 5 minutes"**

That's it. Five minutes. A visual ring timer counts down. Almost every time, you continue past five minutes — because the initiation barrier was the only real problem.

### 😶 I'm Stuck Button
Equally prominent as the Start button, never hidden.

When you tap it, Mello doesn't tell you to "just do it." It says:

> *"That's okay. Let's make it even smaller."*

Then it generates a step so tiny it removes all possible resistance. Still stuck? Tap again — it goes even smaller. The stuck button can be pressed recursively until the step is something like *"just look at your screen."*

Being stuck is not a failure. It means the step needed to be smaller. This button normalizes that.

### 🎉 Gentle Dopamine Rewards
After every completed step — not just full tasks, but every single micro-step — Mello shows a soft sparkle animation and a warm, affirming message.

Never guilt-inducing. Never comparative. Just: *"You did it. One step closer. That matters."*

ADHD brains are reward-deficient. Small, immediate rewards after small actions slowly recondition the brain to associate task completion with feeling good. That's the long game.

### ↺ Reset / Fresh Start
A small button always sits in the corner. Tap it anytime. No confirmation screen, no "are you sure?", no record of what you didn't finish.

Starting fresh is not failing. It's just starting again.

---

## Screenshots

```
┌─────────────────────────────────┐
│                                 │
│         🌸                      │
│    Hey there.                   │
│    How's your energy right now? │
│                                 │
│  ┌──────────────────────────┐   │
│  │ 🌿 Low energy            │   │
│  │    Something gentle      │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ ☀️  Feeling okay          │   │
│  │    I can handle some...  │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ ⚡ High energy            │   │
│  │    Let's tackle something│   │
│  └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
         Energy Check

┌─────────────────────────────────┐
│  + Add more          ●●○○○  Skip│
│                                 │
│  Working on                     │
│  Write the quarterly report     │
│                                 │
│  ┌──────────────────────────┐   │
│  │   Step 2 of 5            │   │
│  │                          │   │
│  │  Type the report title   │   │
│  │                          │   │
│  │  One step at a time.     │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │  ▶ Start — just 5 min   │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 😶 I'm stuck             │   │
│  └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
         Focus Mode
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (custom lavender design system) |
| AI | Claude API (`claude-haiku`) — with smart mock fallback |
| Persistence | LocalStorage (browser) |
| Cloud sync | Supabase (optional) |
| Hosting | Vercel |

---

## Color System

The interface uses a soft lavender palette designed to reduce visual overstimulation — no harsh reds, no aggressive warnings, nothing that raises cortisol.

| Color | Hex | Usage |
|---|---|---|
| Background | `#F5F3FF` | Page background |
| Primary | `#C4B5FD` | Buttons, active states |
| Secondary | `#EDE9FE` | Cards, chips, hover states |
| Accent | `#FBCFE8` | Highlights, voice input |
| Text | `#2D2A32` | Primary copy |
| Success | `#BBF7D0` | Completion states |

No red. Ever.

---

## Running Locally

```bash
git clone https://github.com/sradha-nair/Mello.git
cd Mello
npm install
npm run dev
# → http://localhost:5173
```

Works fully without any API keys. The built-in pattern-matching AI covers emails, reports, meetings, cleaning, exercise, reading, coding, calls, and more.

**Optional — enable real Claude AI:**
```bash
cp .env.example .env
# Add: VITE_ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

**Optional — enable Supabase cloud sync:**
```bash
# In .env:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# Run supabase/schema.sql in your Supabase SQL editor
```

---

## Project Structure

```
src/
├── App.jsx                     State machine — routes between all screens
├── lib/
│   ├── ai.js                   Claude API + 9-pattern smart mock AI
│   ├── storage.js              LocalStorage auto-persistence
│   └── supabase.js             Optional cloud sync
└── components/
    ├── screens/
    │   ├── EnergyCheck.jsx     Energy level picker
    │   ├── BrainDump.jsx       Instant task capture + voice input
    │   ├── BreakingDown.jsx    AI loading state (breathing animation)
    │   ├── FocusMode.jsx       One task · one step · one button
    │   ├── StuckMode.jsx       Recursive micro-step rescue
    │   ├── Celebration.jsx     Dopamine reward per step/task
    │   └── AllDone.jsx         All tasks complete
    └── shared/
        ├── Timer.jsx           Visual ring countdown (5 min)
        ├── SparkleAnimation.jsx Confetti celebration
        ├── ProgressDots.jsx    Step progress (no full list shown)
        ├── Button.jsx          Accessible, ADHD-sized tap targets
        └── Card.jsx            Soft content container
```

---

## Roadmap

This is a demo. Here's what a full version would include:

- [ ] Account creation + authentication (magic link, no passwords)
- [ ] Long-term progress tracking ("you've completed 847 steps")
- [ ] Recurring tasks and gentle reminders
- [ ] Body doubling mode (virtual co-working)
- [ ] Medication/mood check-in integration
- [ ] Mobile app (React Native)
- [ ] Caregiver/coach sharing mode

---

## Contributing

This project is in early demo stage. If you have ADHD and want to share feedback on what works or doesn't — that's the most valuable contribution possible. Open an issue.

---

<div align="center">

Built with care for anyone who's ever stared at a blank page and felt like the worst version of themselves.

**You're not broken. The tools were.**

[Try Mello →](https://mello-black.vercel.app/)

</div>

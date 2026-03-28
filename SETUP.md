# Mello — Setup Guide

> An ADHD-friendly focus app. One task. One step. You've got this.

---

## Quick Start (No accounts needed)

```bash
# 1. Clone and install
cd mello
npm install

# 2. Run locally
npm run dev
# → Opens at http://localhost:5173
```

Mello works fully in demo mode with:
- Smart AI-powered task breakdown (pattern-based, no API key needed)
- LocalStorage persistence (your tasks survive page refreshes)
- All ADHD-focused features fully functional

---

## Enable Real AI (Optional)

For Claude-powered task breakdown:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Copy `.env.example` to `.env`
3. Add your key: `VITE_ANTHROPIC_API_KEY=sk-ant-...`
4. Restart the dev server

**Note:** The app is just as useful without this. The smart mock AI covers most task types.

---

## Enable Cloud Sync with Supabase (Optional)

For cross-device sync and auth:

### 1. Create a Supabase project
- Go to [supabase.com](https://supabase.com) → New Project

### 2. Run the database schema
- In Supabase dashboard → SQL Editor
- Paste the contents of `supabase/schema.sql`
- Click Run

### 3. Add credentials to .env
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Enable Auth (optional)
- Supabase dashboard → Authentication → Providers
- Enable Email (magic link recommended for ADHD users — no passwords)

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# VITE_ANTHROPIC_API_KEY (if using real AI)
# VITE_SUPABASE_URL (if using Supabase)
# VITE_SUPABASE_ANON_KEY (if using Supabase)
```

---

## Example User Flow

```
1. Open Mello
   → "How's your energy right now?"
   → User taps: ☀️ Feeling okay

2. Brain Dump
   → "What's on your mind?"
   → User types: "Write the quarterly report"
   → Taps "Add to my list →"
   → Taps "Ready to start →"

3. AI Breakdown (2 seconds)
   → "Making this feel easier..."
   → Generates: ["Open Google Docs", "Type the report title",
                  "Write one sentence intro", "List 3 section headings",
                  "Write 2 sentences for the first section", "Save your work"]

4. Focus Mode
   → Shows ONLY: "Open Google Docs"
   → Big button: "▶ Start — just 5 minutes"
   → User starts timer, opens their doc

5. "I'm Stuck" (optional)
   → User hesitates on "Write one sentence intro"
   → Taps: "😶 I'm stuck — make it smaller"
   → New step: "Type just one word to start the sentence"

6. Celebration
   → ✨ Sparkle animation
   → "You did it! One step closer."
   → Gentle break suggestion: "Take 3 slow breaths 🌬️"
   → "Next step →"

7. All Done
   → 🌟 "You did it. Everything's done."
   → Shows total steps completed
   → "Start fresh tomorrow 🌸"
```

---

## Architecture

```
src/
├── App.jsx              — State machine (screen routing)
├── index.css            — Global styles + animations
├── lib/
│   ├── ai.js            — Claude API + smart mock AI
│   ├── storage.js       — LocalStorage helpers
│   └── supabase.js      — Optional cloud sync
└── components/
    ├── screens/
    │   ├── EnergyCheck.jsx    — Energy level selection
    │   ├── BrainDump.jsx      — Zero-friction task capture
    │   ├── BreakingDown.jsx   — AI loading state
    │   ├── FocusMode.jsx      — ONE task at a time
    │   ├── StuckMode.jsx      — I'm stuck! rescue
    │   ├── Celebration.jsx    — Dopamine reward
    │   └── AllDone.jsx        — Everything complete
    └── shared/
        ├── Button.jsx         — Styled button
        ├── Card.jsx           — Content container
        ├── ProgressDots.jsx   — Step progress indicator
        ├── SparkleAnimation.jsx — Celebration confetti
        └── Timer.jsx          — 5-minute ring timer
```

---

## Color System

| Token | Value | Use |
|---|---|---|
| `mello-bg` | `#F5F3FF` | Page background |
| `mello-primary` | `#C4B5FD` | Buttons, focus states |
| `mello-secondary` | `#EDE9FE` | Cards, chips |
| `mello-accent` | `#FBCFE8` | Highlights, voice button |
| `mello-text` | `#2D2A32` | Primary text |
| `mello-text-soft` | `#6B6578` | Secondary text |
| `mello-text-muted` | `#A89DB8` | Hints, labels |
| `mello-success` | `#BBF7D0` | Completion states |

---

## ADHD Design Principles Applied

| Problem | Solution |
|---|---|
| Task initiation paralysis | "Just 5 minutes" + single step |
| Choice overload | ONE task visible at all times |
| Ambiguity avoidance | AI generates hyper-specific micro-steps |
| Being stuck = shame | "That's okay" — normalized + rescued |
| Time blindness | Visual ring timer |
| Forgetting tasks | Instant brain dump with no friction |
| Low dopamine | Sparkle animation + warm messages after every step |
| Shame spiral | Zero red colors, zero punishment, reset is always clean |

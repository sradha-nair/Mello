/**
 * Task categories for Mello.
 *
 * Kept intentionally small — 5 meaningful options + uncategorized.
 * Too many categories = choice paralysis. These cover ~95% of what people need.
 */

export const CATEGORIES = [
  { id: 'work',          emoji: '💼', label: 'Work',       color: '#C4B5FD' },
  { id: 'home',          emoji: '🏠', label: 'Home',       color: '#FBCFE8' },
  { id: 'selfcare',      emoji: '🌿', label: 'Self-care',  color: '#BBF7D0' },
  { id: 'learning',      emoji: '📚', label: 'Learning',   color: '#FDE68A' },
  { id: 'personal',      emoji: '🧠', label: 'Personal',   color: '#A5F3FC' },
  { id: 'uncategorized', emoji: '📌', label: 'Other',      color: '#E9E4F7' },
]

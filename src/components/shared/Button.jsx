/**
 * Button component — Mello's core interactive element
 *
 * ADHD Design: Big tap targets, clear affordance, no ambiguity about what happens.
 * Rounded, soft, and satisfying to press.
 */

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const base = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-2xl
    transition-all duration-200 ease-out
    active:scale-95 select-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mello-primary focus-visible:ring-offset-2
  `

  const variants = {
    primary: `
      bg-mello-primary text-white
      hover:bg-violet-400 hover:shadow-glow
      shadow-soft
    `,
    secondary: `
      bg-mello-secondary text-mello-text
      hover:bg-violet-200
      border border-mello-border
    `,
    accent: `
      bg-mello-accent text-pink-800
      hover:bg-pink-200
    `,
    ghost: `
      bg-transparent text-mello-text-soft
      hover:bg-mello-secondary
    `,
    success: `
      bg-mello-success text-mello-success-text
      hover:bg-green-200
      shadow-soft
    `,
    danger: `
      bg-violet-100 text-mello-text-soft
      hover:bg-violet-200
    `,
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

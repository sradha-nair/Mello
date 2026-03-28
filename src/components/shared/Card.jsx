/**
 * Card — Soft container for Mello content.
 * Rounded corners and gentle shadow create a contained, safe feeling.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-card border border-mello-border p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

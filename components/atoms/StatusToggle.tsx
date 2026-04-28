import { cn } from '@/lib/utils'
import type { KitStatus } from '@/lib/types/user-state'

export type StatusToggleValue = KitStatus | 'untracked'

export type StatusToggleProps = {
  value: StatusToggleValue
  onChange: (next: StatusToggleValue) => void
  className?: string
}

const OPTIONS: Array<{ value: StatusToggleValue; label: string; color: string }> = [
  { value: 'untracked', label: 'UNTRACKED', color: 'var(--color-text-muted)' },
  { value: 'wishlist', label: 'WISHLIST', color: 'var(--color-accent-cyan)' },
  { value: 'owned', label: 'OWNED', color: 'var(--color-uc-amber)' },
  { value: 'building', label: 'BUILDING', color: 'var(--color-uc-amber)' },
  { value: 'completed', label: 'COMPLETED', color: 'var(--color-uc-green)' },
  { value: 'painted', label: 'PAINTED', color: 'var(--color-uc-green)' },
]

export function StatusToggle({ value, onChange, className }: StatusToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="机体状态"
      className={cn('inline-flex flex-wrap gap-1', className)}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="border px-2.5 py-1 font-mono text-xs uppercase tracking-widest transition-colors"
            style={{
              borderColor: active ? opt.color : 'transparent',
              color: active ? opt.color : 'var(--color-text-muted)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default StatusToggle

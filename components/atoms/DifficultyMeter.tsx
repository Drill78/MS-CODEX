import { cn } from '@/lib/utils'

export type DifficultyMeterProps = {
  value: 1 | 2 | 3 | 4 | 5
  max?: 5
  label?: string
  className?: string
}

function lampColor(value: number): string {
  if (value <= 2) return 'var(--color-uc-green)'
  if (value === 3) return 'var(--color-uc-amber)'
  return 'var(--color-uc-red)'
}

export function DifficultyMeter({
  value,
  max = 5,
  label,
  className,
}: DifficultyMeterProps) {
  const lit = lampColor(value)
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {label}
        </span>
      )}
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const on = i < value
          return (
            <span
              key={i}
              className="block h-2 w-2 border"
              style={{
                backgroundColor: on ? lit : 'transparent',
                borderColor: on
                  ? lit
                  : 'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
              }}
              aria-hidden
            />
          )
        })}
      </div>
      <span className="sr-only">
        {label ? `${label} ` : ''}
        {value} / {max}
      </span>
    </div>
  )
}

export default DifficultyMeter

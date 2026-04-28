import * as React from 'react'
import { cn } from '@/lib/utils'

export type DataFieldProps = {
  label: string
  value: React.ReactNode
  unit?: string
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function DataField({
  label,
  value,
  unit,
  className,
  orientation = 'horizontal',
}: DataFieldProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-0.5', className)}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {label}
        </span>
        <span className="font-mono text-sm tabular-nums text-[var(--color-text-primary)]">
          {value}
          {unit && (
            <span className="ml-1 text-xs text-[var(--color-text-secondary)]">{unit}</span>
          )}
        </span>
      </div>
    )
  }
  return (
    <div className={cn('flex items-baseline gap-1.5 font-mono', className)}>
      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="text-[var(--color-text-secondary)]">▸</span>
      <span className="text-sm tabular-nums text-[var(--color-text-primary)]">
        {value}
        {unit && (
          <span className="ml-1 text-xs text-[var(--color-text-secondary)]">{unit}</span>
        )}
      </span>
    </div>
  )
}

export default DataField

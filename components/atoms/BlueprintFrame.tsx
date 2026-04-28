import * as React from 'react'
import { cn } from '@/lib/utils'

export type BlueprintFrameProps = {
  children: React.ReactNode
  cornerSize?: number
  className?: string
  variant?: 'default' | 'magenta' | 'cyan'
}

const VARIANT_BORDER: Record<NonNullable<BlueprintFrameProps['variant']>, string> = {
  default: 'border-[var(--color-text-muted)]/60',
  magenta: 'border-[var(--color-accent-magenta)]',
  cyan: 'border-[var(--color-accent-cyan)]',
}

export function BlueprintFrame({
  children,
  cornerSize = 16,
  className,
  variant = 'default',
}: BlueprintFrameProps) {
  const cs = `${cornerSize}px`
  const borderClass = VARIANT_BORDER[variant]
  const cornerProps = { 'aria-hidden': true as const, style: { width: cs, height: cs } }

  return (
    <div className={cn('relative', className)}>
      <span
        {...cornerProps}
        className={cn('pointer-events-none absolute left-0 top-0 z-10 border-l border-t', borderClass)}
      />
      <span
        {...cornerProps}
        className={cn('pointer-events-none absolute right-0 top-0 z-10 border-r border-t', borderClass)}
      />
      <span
        {...cornerProps}
        className={cn('pointer-events-none absolute bottom-0 left-0 z-10 border-b border-l', borderClass)}
      />
      <span
        {...cornerProps}
        className={cn('pointer-events-none absolute bottom-0 right-0 z-10 border-b border-r', borderClass)}
      />
      {children}
    </div>
  )
}

export default BlueprintFrame

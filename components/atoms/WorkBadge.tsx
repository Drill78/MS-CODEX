import { cn } from '@/lib/utils'
import type { Work, Era } from '@/lib/types/work'

export type WorkBadgeProps = {
  work: Work
  showYear?: boolean
  className?: string
}

const ERA_COLOR: Record<Era, string> = {
  UC: 'var(--color-uc-amber)',
  CE: 'var(--color-accent-cyan)',
  AD: 'var(--color-accent-magenta)',
  AC: 'var(--color-text-secondary)',
  AW: 'var(--color-text-secondary)',
  PD: 'var(--color-text-secondary)',
  AS: 'var(--color-text-secondary)',
  RC: 'var(--color-text-secondary)',
  FC: 'var(--color-text-secondary)',
  Other: 'var(--color-text-muted)',
}

export function WorkBadge({ work, showYear = false, className }: WorkBadgeProps) {
  const color = ERA_COLOR[work.era]
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-xs', className)}>
      <span
        className="border px-1.5 py-0.5 uppercase tracking-widest"
        style={{ color, borderColor: color }}
      >
        {work.era}
      </span>
      <span className="text-[var(--color-text-primary)]">{work.title_zh}</span>
      {showYear && work.year_aired && (
        <span className="tabular-nums text-[var(--color-text-muted)]">
          ({work.year_aired})
        </span>
      )}
    </span>
  )
}

export default WorkBadge

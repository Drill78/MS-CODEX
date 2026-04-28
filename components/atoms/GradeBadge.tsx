import { cn } from '@/lib/utils'
import type { Grade } from '@/lib/types/kit'
import { GRADE_LABELS } from '@/lib/constants/grades'

export type GradeBadgeProps = {
  grade: Grade
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const GRADE_COLOR: Record<Grade, string> = {
  HG: 'var(--color-accent-cyan)',
  RG: 'var(--color-rg)',
  MG: 'var(--color-accent-magenta)',
  'MG-VerKa': 'var(--color-accent-magenta)',
  PG: 'var(--color-pg)',
  'PG-Unleashed': 'var(--color-pg)',
  EG: 'var(--color-text-secondary)',
  SD: 'var(--color-uc-amber)',
  SDCS: 'var(--color-uc-amber)',
  RE100: 'var(--color-re100)',
  FM: 'var(--color-fm)',
}

const SIZE_CLASS: Record<NonNullable<GradeBadgeProps['size']>, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function GradeBadge({ grade, size = 'md', className }: GradeBadgeProps) {
  const color = GRADE_COLOR[grade]
  return (
    <span
      className={cn(
        'inline-flex items-center border font-mono uppercase tracking-wider',
        SIZE_CLASS[size],
        className,
      )}
      style={{ color, borderColor: color, backgroundColor: 'transparent' }}
    >
      {GRADE_LABELS[grade]}
    </span>
  )
}

export default GradeBadge

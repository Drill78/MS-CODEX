import { cn } from '@/lib/utils'
import type { Kit } from '@/lib/types/kit'
import { BlueprintFrame } from './BlueprintFrame'
import { GradeBadge } from './GradeBadge'

export type HangarSlotProps = {
  kit: Kit
  owned: boolean
  className?: string
  onClick?: () => void
}

export function HangarSlot({ kit, owned, className, onClick }: HangarSlotProps) {
  const interactive = Boolean(onClick)

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        'relative aspect-square',
        interactive && 'cursor-pointer',
        !owned && 'opacity-40 grayscale',
        className,
      )}
    >
      <BlueprintFrame variant={owned ? 'magenta' : 'default'} className="h-full w-full">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
          {owned ? (
            <>
              <GradeBadge grade={kit.grade} size="sm" />
              <div
                className="font-display text-3xl leading-none tracking-wider"
                style={{ color: 'var(--color-accent-magenta)' }}
              >
                {kit.ms_code ?? '???'}
              </div>
              <div className="line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">
                {kit.name_zh}
              </div>
            </>
          ) : (
            <>
              <div
                className="font-display text-5xl leading-none"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ???
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                UNREGISTERED // 未登记
              </div>
            </>
          )}
        </div>
      </BlueprintFrame>
    </div>
  )
}

export default HangarSlot

import { cn } from '@/lib/utils'
import type { Tool } from '@/lib/types/tool'
import { BlueprintFrame } from './BlueprintFrame'

export type ToolPegboardSlotProps = {
  tool: Tool
  owned: boolean
  tierOwned?: 'budget' | 'value' | 'premium'
  className?: string
  onClick?: () => void
}

const TIER_BAR_COLOR: Record<NonNullable<ToolPegboardSlotProps['tierOwned']>, string> = {
  budget: 'var(--color-text-secondary)',
  value: 'var(--color-accent-cyan)',
  premium: 'var(--color-accent-magenta)',
}

export function ToolPegboardSlot({
  tool,
  owned,
  tierOwned,
  className,
  onClick,
}: ToolPegboardSlotProps) {
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
        'flex flex-col items-center',
        interactive && 'cursor-pointer',
        className,
      )}
    >
      <span
        aria-hidden
        className="block h-2 w-2 rounded-full border"
        style={{
          borderColor: 'var(--color-text-muted)',
          backgroundColor: 'var(--color-bg-elevated)',
        }}
      />
      <span
        aria-hidden
        className="block h-3 w-px"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-text-muted) 40%, transparent)',
        }}
      />
      <div className={cn('w-full', !owned && 'opacity-30 grayscale')}>
        <BlueprintFrame>
          <div className="relative flex aspect-square flex-col items-center justify-center p-3 text-center">
            {owned ? (
              <span className="line-clamp-3 font-mono text-xs leading-tight text-[var(--color-text-primary)]">
                {tool.name_zh}
              </span>
            ) : (
              <span
                className="font-mono text-2xl leading-none"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="未拥有"
              >
                +
              </span>
            )}
            {owned && tierOwned && (
              <span
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: TIER_BAR_COLOR[tierOwned] }}
              />
            )}
          </div>
        </BlueprintFrame>
      </div>
    </div>
  )
}

export default ToolPegboardSlot

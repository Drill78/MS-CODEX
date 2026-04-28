import { cn } from '@/lib/utils'
import type { ToolTier, ChannelPlatform, Tier } from '@/lib/types/tool'
import { BlueprintFrame } from './BlueprintFrame'

export type TierCardProps = {
  tier: ToolTier
  isOwned?: boolean
  onToggleOwned?: () => void
  className?: string
}

const TIER_COLOR: Record<Tier, string> = {
  budget: 'var(--color-text-secondary)',
  value: 'var(--color-accent-cyan)',
  premium: 'var(--color-accent-magenta)',
}

const TIER_LABEL_ZH: Record<Tier, string> = {
  budget: '丐版',
  value: '性价比',
  premium: '顶配',
}

const TIER_VARIANT: Record<Tier, 'default' | 'magenta' | 'cyan'> = {
  budget: 'default',
  value: 'cyan',
  premium: 'magenta',
}

const PLATFORM_SHORT: Record<ChannelPlatform, string> = {
  taobao: '淘',
  tmall: '天',
  jd: '京',
  '1688': '1688',
  amiami: 'amiami',
  official: '官',
  other: '其他',
}

export function TierCard({ tier, isOwned, onToggleOwned, className }: TierCardProps) {
  const color = TIER_COLOR[tier.tier]
  const interactive = Boolean(onToggleOwned)

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onToggleOwned}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggleOwned?.()
              }
            }
          : undefined
      }
      className={cn('relative', interactive && 'cursor-pointer', className)}
    >
      <BlueprintFrame variant={TIER_VARIANT[tier.tier]}>
        <div className="relative p-4">
          {isOwned && (
            <span
              aria-hidden
              className="absolute bottom-0 left-0 top-0 w-1"
              style={{ backgroundColor: 'var(--color-accent-magenta)' }}
            />
          )}
          {isOwned && (
            <span
              aria-label="已拥有"
              className="absolute right-3 top-3 font-mono text-sm"
              style={{ color: 'var(--color-accent-magenta)' }}
            >
              ✓
            </span>
          )}
          <div className="flex items-start justify-between gap-3">
            <div
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color }}
            >
              {TIER_LABEL_ZH[tier.tier]} · {tier.tier}
            </div>
            <div
              className="font-mono text-lg tabular-nums leading-none"
              style={{ color: 'var(--color-text-primary)' }}
            >
              ¥{tier.price_cny}
            </div>
          </div>
          <div className="mt-2 text-sm text-[var(--color-text-primary)]">
            {tier.product_name}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">{tier.brand}</div>
          {tier.notes && (
            <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
              {tier.notes}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            {tier.channels.map((c, i) => (
              <span
                key={`${c.platform}-${i}`}
                className="border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                style={{
                  borderColor:
                    'color-mix(in srgb, var(--color-text-muted) 40%, transparent)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {PLATFORM_SHORT[c.platform]}
              </span>
            ))}
          </div>
        </div>
      </BlueprintFrame>
    </div>
  )
}

export default TierCard

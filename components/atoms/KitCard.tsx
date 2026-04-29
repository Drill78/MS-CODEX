import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Kit } from '@/lib/types/kit'
import type { KitStatus } from '@/lib/types/user-state'
import { BlueprintFrame } from './BlueprintFrame'
import { GradeBadge } from './GradeBadge'
import { WorkBadge } from './WorkBadge'
import { DataField } from './DataField'

export type KitCardProps = {
  kit: Kit
  status?: KitStatus | 'untracked'
  className?: string
  onClick?: () => void
}

type StatusBadge = { icon: string; color: string; title: string; emphasized?: boolean }

const STATUS_BADGE: Record<Exclude<KitStatus | 'untracked', 'untracked'>, StatusBadge> = {
  wishlist: { icon: '★', color: 'var(--color-accent-cyan)', title: 'wishlist' },
  owned: { icon: '◆', color: 'var(--color-uc-amber)', title: 'owned' },
  building: { icon: '◐', color: 'var(--color-uc-amber)', title: 'building' },
  completed: { icon: '✓', color: 'var(--color-uc-green)', title: 'completed' },
  painted: {
    icon: '✓✓',
    color: 'var(--color-uc-green)',
    title: 'painted',
    emphasized: true,
  },
}

export function KitCard({ kit, status = 'untracked', className, onClick }: KitCardProps) {
  const interactive = Boolean(onClick)
  const badge = status === 'untracked' ? null : STATUS_BADGE[status]

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
        'relative overflow-hidden',
        interactive && 'cursor-pointer transition-transform hover:-translate-y-0.5',
        className,
      )}
    >
      <BlueprintFrame>
        {kit.box_art_url && (
          <div aria-hidden className="absolute inset-0 opacity-15">
            <Image
              src={kit.box_art_url}
              alt=""
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, 50vw"
              className="object-cover"
              {...(kit.box_art_lqip
                ? { placeholder: 'blur' as const, blurDataURL: kit.box_art_lqip }
                : {})}
              unoptimized
            />
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'color-mix(in srgb, var(--color-bg-paper) 60%, transparent)',
          }}
        />
        <div className="relative p-4">
          {badge && (
            <span
              title={badge.title}
              className={cn(
                'absolute right-3 top-3 font-mono text-sm',
                badge.emphasized && 'rounded-sm px-1',
              )}
              style={{
                color: badge.color,
                backgroundColor: badge.emphasized
                  ? 'color-mix(in srgb, var(--color-uc-green) 20%, transparent)'
                  : undefined,
              }}
            >
              {badge.icon}
            </span>
          )}

          <div className="flex items-center justify-between">
            <GradeBadge grade={kit.grade} size="sm" />
            {kit.series_number && (
              <span className="font-mono text-[10px] tabular-nums tracking-widest text-[var(--color-text-muted)]">
                #{kit.series_number}
              </span>
            )}
          </div>

          {kit.ms_code && (
            <div
              className="mt-3 font-display text-4xl leading-none tracking-wider"
              style={{ color: 'var(--color-accent-magenta)' }}
            >
              {kit.ms_code}
            </div>
          )}

          <div className="mt-2 truncate text-base text-[var(--color-text-primary)]">
            {kit.name_zh}
          </div>
          <div className="truncate text-xs text-[var(--color-text-secondary)]">
            {kit.name_jp}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-y-1">
            <DataField label="比例" value={kit.scale} />
            <DataField label="发售" value={kit.release_date} />
            <DataField label="价格" value={kit.price_jpy.toLocaleString()} unit="JPY" />
            {kit.height_mm && <DataField label="高度" value={kit.height_mm} unit="mm" />}
          </div>

          {kit.source_works[0] && (
            <div className="mt-3">
              <WorkBadge work={kit.source_works[0]} />
            </div>
          )}
        </div>
      </BlueprintFrame>
    </div>
  )
}

export default KitCard

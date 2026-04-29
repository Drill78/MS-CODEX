import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Kit } from '@/lib/types/kit'
import type { KitStatus } from '@/lib/types/user-state'
import { BlueprintFrame } from './BlueprintFrame'
import { GradeBadge } from './GradeBadge'
import { WorkBadge } from './WorkBadge'
import { formatPriceJpy, formatReleaseDate } from '@/lib/utils/kit'

export type KitCardProps = {
  kit: Kit
  status?: KitStatus | 'untracked'
  className?: string
  onClick?: () => void
}

type StatusBadge = {
  icon: string
  color: string
  title: string
  emphasized?: boolean
}

const STATUS_BADGE: Record<
  Exclude<KitStatus | 'untracked', 'untracked'>,
  StatusBadge
> = {
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

export function KitCard({
  kit,
  status = 'untracked',
  className,
  onClick,
}: KitCardProps) {
  const badge = status === 'untracked' ? null : STATUS_BADGE[status]

  const dataLine = [
    kit.scale,
    formatPriceJpy(kit.price_jpy, kit._meta?.price_uncertain),
    formatReleaseDate(kit.release_date),
  ]
    .filter((s) => s && s !== '—')
    .join(' · ')

  return (
    <Link
      href={`/hangar/${kit.id}`}
      onClick={onClick}
      className={cn(
        'group block w-full transition-transform hover:-translate-y-0.5 focus:outline-none',
        className,
      )}
    >
      <BlueprintFrame className="h-full w-full">
        <div className="relative flex h-full w-full flex-col">
          {/* Box art — fixed height, contain so original aspect is preserved */}
          <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]">
            {kit.box_art_url ? (
              <Image
                src={kit.box_art_url}
                alt={`${kit.name_zh} box art`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain transition-[filter] duration-200 group-hover:brightness-110"
                {...(kit.box_art_lqip
                  ? {
                      placeholder: 'blur' as const,
                      blurDataURL: kit.box_art_lqip,
                    }
                  : {})}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                  BOX ART // PENDING
                </span>
                <span
                  className="font-display text-2xl tracking-wider"
                  style={{ color: 'var(--color-accent-magenta)' }}
                >
                  {kit.ms_code ?? '???'}
                </span>
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="relative flex min-w-0 flex-1 flex-col gap-1 p-3">
            {badge && (
              <span
                title={badge.title}
                className={cn(
                  'absolute right-2 top-2 font-mono text-sm',
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

            <div className="flex items-center justify-between gap-2 pr-7">
              <GradeBadge grade={kit.grade} size="sm" />
              {kit.series_number && (
                <span className="font-mono text-xs tabular-nums tracking-widest text-[var(--color-text-muted)]">
                  #{kit.series_number}
                </span>
              )}
            </div>

            {kit.ms_code && (
              <div
                className="mt-1 line-clamp-1 break-all font-display text-3xl leading-none tracking-wider"
                style={{ color: 'var(--color-accent-magenta)' }}
              >
                {kit.ms_code}
              </div>
            )}

            <div className="line-clamp-1 text-base text-[var(--color-text-primary)]">
              {kit.name_zh}
            </div>
            {kit.name_en && (
              <div className="truncate font-mono text-xs text-[var(--color-text-muted)]">
                {kit.name_en}
              </div>
            )}

            <div className="min-h-1 flex-1" />

            {dataLine && (
              <div className="truncate font-mono text-xs tabular-nums text-[var(--color-text-secondary)]">
                {dataLine}
              </div>
            )}

            {kit.source_works[0] && (
              <div className="min-w-0 max-w-full overflow-hidden">
                <div className="truncate">
                  <WorkBadge work={kit.source_works[0]} />
                </div>
              </div>
            )}
          </div>
        </div>
      </BlueprintFrame>
    </Link>
  )
}

export default KitCard

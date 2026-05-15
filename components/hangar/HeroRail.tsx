'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useRef } from 'react'
import { BlueprintFrame, GradeBadge } from '@/components/atoms'
import type { Kit } from '@/lib/types/kit'
import type { FeaturedItem } from '@/lib/data'

type Category = 'beginner' | 'classic' | 'masterpiece' | 'newcomer' | 'endgame'

const CATEGORY_COLOR: Record<Category, string> = {
  beginner: 'var(--color-accent-cyan)',
  classic: 'var(--color-text-secondary)',
  masterpiece: 'var(--color-accent-magenta)',
  newcomer: 'var(--color-uc-amber)',
  endgame: 'var(--color-uc-red)',
}

const SCROLL_STEP = 260 // card width 240 + gap 12 + padding

export function HeroRail({
  items,
  kitsById,
}: {
  items: FeaturedItem[]
  kitsById: Map<string, Kit>
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const resolved = useMemo(
    () =>
      items
        .map((item) => ({ item, kit: kitsById.get(item.kit_id) }))
        .filter((r): r is { item: FeaturedItem; kit: Kit } => Boolean(r.kit)),
    [items, kitsById],
  )

  if (resolved.length === 0) return null

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="mb-8 w-full max-w-full min-w-0">
      <header className="mb-3 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-wider text-[var(--color-text-primary)]">
            热门机型
          </h2>
          <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
            {`// featured picks · ${resolved.length}`}
          </p>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-SCROLL_STEP)}
            aria-label="向左滚动"
            className="border px-3 py-1 font-mono text-sm transition-colors hover:text-[var(--color-accent-cyan)]"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 40%, transparent)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => scrollBy(SCROLL_STEP)}
            aria-label="向右滚动"
            className="border px-3 py-1 font-mono text-sm transition-colors hover:text-[var(--color-accent-cyan)]"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 40%, transparent)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ▶
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-3"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'thin',
        }}
      >
        <div className="inline-flex gap-3 px-1">
          {resolved.map(({ item, kit }) => (
            <FeaturedKitCard
              key={`${item.kit_id}-${item.reason}`}
              kit={kit}
              reason={item.reason}
              category={item.category as Category}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedKitCard({
  kit,
  reason,
  category,
}: {
  kit: Kit
  reason: string
  category: Category
}) {
  const color = CATEGORY_COLOR[category] ?? 'var(--color-text-secondary)'

  return (
    <Link
      href={`/hangar/${kit.id}`}
      className="block w-[160px] shrink-0 transition-transform hover:-translate-y-0.5 sm:w-[200px] lg:w-[240px]"
      style={{ scrollSnapAlign: 'start' }}
    >
      <BlueprintFrame className="h-full">
        <div className="flex h-full flex-col">
          <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-elevated)]">
            {kit.box_art_url ? (
              <Image
                src={kit.box_art_url}
                alt={`${kit.name_zh} box art`}
                fill
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
                className="object-cover"
                {...(kit.box_art_lqip
                  ? {
                      placeholder: 'blur' as const,
                      blurDataURL: kit.box_art_lqip,
                    }
                  : {})}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                BOX ART // PENDING
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
            <div className="flex items-center gap-2">
              <GradeBadge grade={kit.grade} size="sm" />
            </div>
            {kit.ms_code && (
              <div
                className="line-clamp-1 break-all font-display text-2xl leading-none tracking-wider sm:text-3xl"
                style={{ color: 'var(--color-accent-magenta)' }}
              >
                {kit.ms_code}
              </div>
            )}
            <div className="line-clamp-1 text-sm text-[var(--color-text-primary)] sm:text-base">
              {kit.name_zh}
            </div>

            <div className="mt-auto pt-2">
              <span
                className="inline-block border px-2 py-1 font-mono text-xs uppercase tracking-wider sm:px-2.5 sm:text-sm"
                style={{ color, borderColor: color }}
              >
                ▸ {reason}
              </span>
            </div>
          </div>
        </div>
      </BlueprintFrame>
    </Link>
  )
}

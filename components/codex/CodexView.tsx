'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BlueprintFrame,
  GradeBadge,
  HangarSlot,
} from '@/components/atoms'
import { GRADE_DISPLAY_ORDER, groupKitsByGrade } from '@/lib/utils/kit'
import { useHydrated, useUserStore } from '@/lib/store/user-state'
import type { Kit, Grade } from '@/lib/types/kit'
import type { KitStatus } from '@/lib/types/user-state'

const STATUS_GROUPS: Array<{
  status: KitStatus
  label: string
  icon: string
  color: string
}> = [
  {
    status: 'wishlist',
    label: '心愿单',
    icon: '⭐',
    color: 'var(--color-accent-cyan)',
  },
  {
    status: 'owned',
    label: '已购入',
    icon: '◆',
    color: 'var(--color-uc-amber)',
  },
  {
    status: 'building',
    label: '组装中',
    icon: '⚒',
    color: 'var(--color-uc-amber)',
  },
  {
    status: 'completed',
    label: '已素组',
    icon: '✓',
    color: 'var(--color-uc-green)',
  },
  {
    status: 'painted',
    label: '已涂装',
    icon: '✓✓',
    color: 'var(--color-uc-green)',
  },
]

const FULL_PAGE_SIZE = 200

export function CodexView({ allKits }: { allKits: Kit[] }) {
  const hydrated = useHydrated()
  const userKits = useUserStore((s) => s.kits)
  const [showFullCodex, setShowFullCodex] = useState(false)

  const allKitsById = useMemo(() => {
    const m = new Map<string, Kit>()
    for (const k of allKits) m.set(k.id, k)
    return m
  }, [allKits])

  const markedByStatus = useMemo(() => {
    const map = new Map<KitStatus, Kit[]>()
    if (!hydrated) return map
    for (const group of STATUS_GROUPS) {
      const ids = Object.keys(userKits).filter(
        (id) => userKits[id]?.status === group.status,
      )
      const kits = ids
        .map((id) => allKitsById.get(id))
        .filter((k): k is Kit => Boolean(k))
      map.set(group.status, kits)
    }
    return map
  }, [userKits, allKitsById, hydrated])

  const totalMarked = useMemo(
    () =>
      Array.from(markedByStatus.values()).reduce(
        (acc, arr) => acc + arr.length,
        0,
      ),
    [markedByStatus],
  )

  return (
    <div className="container mx-auto px-6 py-10">
      <header className="mb-8">
        <h1
          className="font-display text-5xl tracking-wider"
          style={{ color: 'var(--color-accent-magenta)' }}
        >
          CODEX
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
          {'// 工具墙 + 机库档案'}
        </p>
      </header>

      <BlueprintFrame variant="cyan" className="p-6">
        <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
          {'// 工具墙'}
        </h2>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          工具数据库即将上线 —— 你拥有的工具会在这里以拼装情景墙的形式展开。
        </p>
      </BlueprintFrame>

      {/* 我的标注 */}
      <section className="mt-12">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-3xl tracking-wider text-[var(--color-text-primary)]">
            我的标注
          </h2>
          <span className="font-mono tabular-nums text-sm text-[var(--color-text-secondary)]">
            {hydrated ? totalMarked : 0}
          </span>
        </header>

        {!hydrated || totalMarked === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {STATUS_GROUPS.map((group) => {
              const kits = markedByStatus.get(group.status) ?? []
              if (kits.length === 0) return null
              return (
                <MyMarkedSection key={group.status} group={group} kits={kits} />
              )
            })}
          </div>
        )}
      </section>

      {/* 全机库 */}
      <section className="mt-16">
        <header className="mb-6 flex items-baseline justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowFullCodex((v) => !v)}
            aria-expanded={showFullCodex}
            className="group flex items-baseline gap-3 text-left transition-colors"
          >
            <span className="font-display text-3xl tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-cyan)]">
              全机库图鉴
            </span>
            <span className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-cyan)]">
              {showFullCodex ? '▾ 已展开' : '▸ 点击展开'}
            </span>
          </button>
          <span className="font-mono tabular-nums text-sm text-[var(--color-text-secondary)]">
            {allKits.length}
          </span>
        </header>
        {showFullCodex && (
          <FullCodex allKits={allKits} userKits={userKits} hydrated={hydrated} />
        )}
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <BlueprintFrame className="p-8">
      <div className="text-center">
        <p className="font-mono text-sm text-[var(--color-text-secondary)]">
          {'// 你还没标注任何机体'}
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          去{' '}
          <Link
            href="/hangar"
            className="underline"
            style={{ color: 'var(--color-accent-cyan)' }}
          >
            机库
          </Link>{' '}
          浏览，点进任意机体后可以标注 心愿单 / 已购入 / 组装中 / 已素组 / 已涂装。
        </p>
      </div>
    </BlueprintFrame>
  )
}

function MyMarkedSection({
  group,
  kits,
}: {
  group: (typeof STATUS_GROUPS)[number]
  kits: Kit[]
}) {
  const router = useRouter()
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span
          className="font-mono text-base"
          style={{ color: group.color }}
          aria-hidden
        >
          {group.icon}
        </span>
        <span
          className="font-mono text-sm uppercase tracking-widest"
          style={{ color: group.color }}
        >
          {group.label}
        </span>
        <span className="font-mono tabular-nums text-xs text-[var(--color-text-muted)]">
          ({kits.length})
        </span>
        <div
          className="h-px flex-1"
          style={{
            background:
              'color-mix(in srgb, var(--color-text-muted) 25%, transparent)',
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10">
        {kits.map((kit) => (
          <HangarSlot
            key={kit.id}
            kit={kit}
            owned
            onClick={() => router.push(`/hangar/${kit.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

function FullCodex({
  allKits,
  userKits,
  hydrated,
}: {
  allKits: Kit[]
  userKits: Record<string, { status: KitStatus }>
  hydrated: boolean
}) {
  const router = useRouter()
  const grouped = useMemo(() => groupKitsByGrade(allKits), [allKits])

  // Flatten in display order so we can lazy-load uniformly.
  const flat = useMemo(() => {
    const out: Array<{ grade: Grade; kit: Kit }> = []
    for (const grade of GRADE_DISPLAY_ORDER) {
      const arr = grouped.get(grade) ?? []
      for (const kit of arr) out.push({ grade, kit })
    }
    return out
  }, [grouped])

  const [visibleCount, setVisibleCount] = useState(FULL_PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + FULL_PAGE_SIZE, flat.length))
        }
      },
      { rootMargin: '600px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [flat.length])

  const visible = flat.slice(0, visibleCount)

  // Re-group visible items by grade for section rendering.
  const visibleByGrade = useMemo(() => {
    const m = new Map<Grade, Kit[]>()
    for (const grade of GRADE_DISPLAY_ORDER) m.set(grade, [])
    for (const { grade, kit } of visible) {
      m.get(grade)!.push(kit)
    }
    return m
  }, [visible])

  return (
    <div className="space-y-10">
      {GRADE_DISPLAY_ORDER.map((grade) => {
        const allInGrade = grouped.get(grade) ?? []
        const visibleInGrade = visibleByGrade.get(grade) ?? []
        if (allInGrade.length === 0 || visibleInGrade.length === 0) return null
        const ownedInGroup = hydrated
          ? allInGrade.filter(
              (k) => userKits[k.id] && userKits[k.id].status !== 'wishlist',
            ).length
          : 0
        const total = allInGrade.length
        const pct = total ? Math.round((ownedInGroup / total) * 100) : 0
        return (
          <div key={grade}>
            <div className="mb-3 flex items-center gap-3">
              <GradeBadge grade={grade} size="md" />
              <div
                className="h-px flex-1"
                style={{
                  background:
                    'color-mix(in srgb, var(--color-text-muted) 25%, transparent)',
                }}
              />
              <div
                className="relative h-1 w-32 overflow-hidden"
                style={{
                  background:
                    'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                }}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${pct}%`,
                    background: 'var(--color-uc-green)',
                  }}
                />
              </div>
              <span className="font-mono tabular-nums text-xs text-[var(--color-text-secondary)]">
                {ownedInGroup}/{total}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {visibleInGrade.map((kit) => {
                const isOwned = hydrated
                  ? Boolean(
                      userKits[kit.id] &&
                        userKits[kit.id].status !== 'wishlist',
                    )
                  : false
                return (
                  <HangarSlot
                    key={kit.id}
                    kit={kit}
                    owned={isOwned}
                    onClick={() => router.push(`/hangar/${kit.id}`)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {visibleCount < flat.length && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-12"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            LOADING MORE // {visibleCount} / {flat.length}
          </p>
        </div>
      )}
      {visibleCount >= flat.length && (
        <div className="py-6 text-center font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          {`// END OF DATABASE · ${flat.length} units`}
        </div>
      )}
    </div>
  )
}

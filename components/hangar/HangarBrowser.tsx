'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import {
  BlueprintFrame,
  FilterPanel,
  KitCard,
  type FilterGroup,
} from '@/components/atoms'
import { GRADE_LABELS } from '@/lib/constants/grades'
import { ERA_LABELS } from '@/lib/constants/works'
import { GRADE_DISPLAY_ORDER, kitSortKey } from '@/lib/utils/kit'
import { useUserStore, useHydrated } from '@/lib/store/user-state'
import type { Kit } from '@/lib/types/kit'
import type { Era } from '@/lib/types/work'
import type { KitStatus } from '@/lib/types/user-state'
import type { FeaturedItem } from '@/lib/data'
import { HeroRail } from './HeroRail'

type SortKey =
  | 'series'
  | 'release-asc'
  | 'release-desc'
  | 'price-asc'
  | 'price-desc'

const SORT_LABELS: Record<SortKey, string> = {
  series: '默认 / 序号',
  'release-desc': '发售日 ↓ 新',
  'release-asc': '发售日 ↑ 旧',
  'price-asc': '价格 ↑ 低',
  'price-desc': '价格 ↓ 高',
}

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[]

const PAGE_SIZE = 100

type Filters = {
  grade: string[]
  era: string[]
  work: string[]
  status: string[]
  search: string
  showPBandai: string
  sort: string
}

const FILTER_PARSERS = {
  grade: parseAsArrayOf(parseAsString).withDefault([]),
  era: parseAsArrayOf(parseAsString).withDefault([]),
  work: parseAsArrayOf(parseAsString).withDefault([]),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  search: parseAsString.withDefault(''),
  showPBandai: parseAsString.withDefault('hide'),
  sort: parseAsString.withDefault('series'),
}

const STATUS_OPTIONS: Array<{ value: KitStatus; label: string }> = [
  { value: 'wishlist', label: '心愿单' },
  { value: 'owned', label: '已拥有' },
  { value: 'building', label: '拼装中' },
  { value: 'completed', label: '已完成' },
  { value: 'painted', label: '已涂装' },
]

export function HangarBrowser({
  allKits,
  featuredItems,
}: {
  allKits: Kit[]
  featuredItems: FeaturedItem[]
}) {
  const hydrated = useHydrated()
  const userKits = useUserStore((s) => s.kits)

  const [filters, setFilters] = useQueryStates(FILTER_PARSERS, {
    shallow: true,
    history: 'replace',
  })

  const sortKey = (
    SORT_KEYS.includes(filters.sort as SortKey) ? filters.sort : 'series'
  ) as SortKey

  const filteredKits = useMemo(() => {
    const filtered = applyFilters(
      allKits,
      filters as Filters,
      hydrated ? userKits : {},
    )
    return sortKits(filtered, sortKey)
  }, [allKits, filters, userKits, hydrated, sortKey])

  const filterGroups = useMemo<FilterGroup[]>(() => {
    return buildFilterGroups(allKits, filters as Filters)
  }, [allKits, filters])

  const kitsById = useMemo(() => {
    const m = new Map<string, Kit>()
    for (const k of allKits) m.set(k.id, k)
    return m
  }, [allKits])

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filters])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredKits.length))
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredKits.length])

  const visibleKits = filteredKits.slice(0, visibleCount)

  const handleFilterChange = (groupId: string, selected: string[]) => {
    setFilters({ [groupId]: selected.length ? selected : null })
  }

  const reset = () =>
    setFilters({
      grade: null,
      era: null,
      work: null,
      status: null,
      search: null,
      showPBandai: null,
      sort: null,
    })

  const showPBandai = filters.showPBandai === 'show'

  const showHero =
    !filters.search &&
    filters.grade.length === 0 &&
    filters.era.length === 0 &&
    filters.work.length === 0 &&
    filters.status.length === 0

  return (
    <div className="container mx-auto min-w-0 max-w-full px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1
            className="font-display text-5xl tracking-wider"
            style={{ color: 'var(--color-accent-magenta)' }}
          >
            HANGAR
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
            {'// 全机体档案库'}
          </p>
        </div>
        <div className="font-mono tabular-nums text-sm text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-accent-cyan)]">
            {filteredKits.length}
          </span>
          <span className="mx-1">/</span>
          <span>{allKits.length}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <input
            type="search"
            placeholder="搜索机体编号 / 名称 …"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value || null })}
            className="w-full border bg-transparent px-3 py-2 font-mono text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
              color: 'var(--color-text-primary)',
            }}
          />

          <div className="flex items-center justify-between border-t pt-4 font-mono text-[11px] uppercase tracking-widest">
            <span className="text-[var(--color-text-muted)]">P-Bandai</span>
            <button
              type="button"
              onClick={() =>
                setFilters({ showPBandai: showPBandai ? null : 'show' })
              }
              className="border px-2 py-1 transition-colors"
              style={{
                borderColor: showPBandai
                  ? 'var(--color-accent-cyan)'
                  : 'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
                color: showPBandai
                  ? 'var(--color-accent-cyan)'
                  : 'var(--color-text-secondary)',
              }}
            >
              {showPBandai ? 'INCLUDE' : 'HIDE'}
            </button>
          </div>

          <FilterPanel groups={filterGroups} onChange={handleFilterChange} />

          <button
            type="button"
            onClick={reset}
            className="w-full border px-3 py-2 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent-cyan)]"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
            }}
          >
            重置筛选
          </button>
        </aside>

        <section>
          {showHero && (
            <HeroRail items={featuredItems} kitsById={kitsById} />
          )}

          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              全部机体 · {filteredKits.length} / {allKits.length}
            </p>
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              <span>排序</span>
              <select
                value={sortKey}
                onChange={(e) =>
                  setFilters({
                    sort: e.target.value === 'series' ? null : e.target.value,
                  })
                }
                className="border bg-transparent px-2 py-1 font-mono text-xs uppercase tracking-widest focus:outline-none"
                style={{
                  borderColor:
                    'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-deep)',
                }}
              >
                {SORT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredKits.length === 0 ? (
            <BlueprintFrame className="p-10">
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
                  {'// 没有匹配的机体'}
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="border px-4 py-2 font-mono text-xs uppercase tracking-widest"
                  style={{
                    borderColor: 'var(--color-accent-cyan)',
                    color: 'var(--color-accent-cyan)',
                  }}
                >
                  重置筛选
                </button>
              </div>
            </BlueprintFrame>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleKits.map((kit) => {
                  const owned = hydrated ? userKits[kit.id] : undefined
                  return (
                    <KitCard
                      key={kit.id}
                      kit={kit}
                      status={owned?.status ?? 'untracked'}
                    />
                  )
                })}
              </div>
              {visibleCount < filteredKits.length && (
                <div
                  ref={sentinelRef}
                  className="col-span-full flex items-center justify-center py-12"
                >
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                    LOADING MORE // {visibleCount} / {filteredKits.length}
                  </p>
                </div>
              )}
              {visibleCount >= filteredKits.length && filteredKits.length > 0 && (
                <div className="py-8 text-center font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  {`// END OF DATABASE · ${filteredKits.length} units`}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function applyFilters(
  kits: Kit[],
  filters: Filters,
  userKits: Record<string, { status: KitStatus }>,
): Kit[] {
  const search = filters.search.trim().toLowerCase()
  const showPBandai = filters.showPBandai === 'show'

  return kits.filter((k) => {
    if (!showPBandai && k.is_p_bandai) return false
    if (filters.grade.length && !filters.grade.includes(k.grade)) return false
    if (filters.era.length) {
      const matchesEra = k.source_works.some((w) =>
        filters.era.includes(w.era),
      )
      if (!matchesEra) return false
    }
    if (filters.work.length) {
      const titles = k.source_works.map((w) => w.title_zh)
      const matches = filters.work.some((w) => titles.includes(w))
      if (!matches) return false
    }
    if (filters.status.length) {
      const status = userKits[k.id]?.status
      if (!status || !filters.status.includes(status)) return false
    }
    if (search) {
      const hay = [k.ms_code, k.name_zh, k.name_en, k.name_jp]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(search)) return false
    }
    return true
  })
}

function sortKits(kits: Kit[], sortKey: SortKey): Kit[] {
  const sorted = [...kits]
  switch (sortKey) {
    case 'series':
      return sorted.sort((a, b) => {
        const ga = GRADE_DISPLAY_ORDER.indexOf(a.grade)
        const gb = GRADE_DISPLAY_ORDER.indexOf(b.grade)
        if (ga !== gb) return ga - gb
        return kitSortKey(a) - kitSortKey(b)
      })
    case 'release-desc':
      return sorted.sort((a, b) =>
        (b.release_date ?? '').localeCompare(a.release_date ?? ''),
      )
    case 'release-asc':
      return sorted.sort((a, b) =>
        (a.release_date ?? '').localeCompare(b.release_date ?? ''),
      )
    case 'price-asc':
      return sorted.sort(
        (a, b) => (a.price_jpy || 99999999) - (b.price_jpy || 99999999),
      )
    case 'price-desc':
      return sorted.sort((a, b) => (b.price_jpy || 0) - (a.price_jpy || 0))
  }
}

function buildFilterGroups(kits: Kit[], filters: Filters): FilterGroup[] {
  const gradeCounts = countBy(kits, (k) => k.grade)
  const eraCounts = new Map<Era, number>()
  const workCounts = new Map<string, number>()
  for (const k of kits) {
    for (const w of k.source_works) {
      eraCounts.set(w.era, (eraCounts.get(w.era) ?? 0) + 1)
      workCounts.set(w.title_zh, (workCounts.get(w.title_zh) ?? 0) + 1)
    }
  }

  const gradeOptions = GRADE_DISPLAY_ORDER.filter(
    (g) => (gradeCounts.get(g) ?? 0) > 0,
  ).map((g) => ({
    value: g,
    label: GRADE_LABELS[g],
    count: gradeCounts.get(g),
  }))

  const eraOptions = Array.from(eraCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([era, count]) => ({
      value: era,
      label: `${era} · ${ERA_LABELS[era]}`,
      count,
    }))

  const workOptions = Array.from(workCounts.entries())
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([title, count]) => ({ value: title, label: title, count }))

  const statusOptions = STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }))

  return [
    {
      id: 'grade',
      label: '规格',
      options: gradeOptions,
      selected: filters.grade,
      multi: true,
    },
    {
      id: 'era',
      label: '世界观',
      options: eraOptions,
      selected: filters.era,
      multi: true,
    },
    {
      id: 'work',
      label: '出自作品 (≥3 套)',
      options: workOptions,
      selected: filters.work,
      multi: true,
    },
    {
      id: 'status',
      label: '我的状态',
      options: statusOptions,
      selected: filters.status,
      multi: true,
    },
  ]
}

function countBy<T, K>(items: T[], key: (item: T) => K): Map<K, number> {
  const map = new Map<K, number>()
  for (const item of items) {
    const k = key(item)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return map
}

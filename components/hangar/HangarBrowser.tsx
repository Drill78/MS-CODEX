'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import {
  BlueprintFrame,
  FilterPanel,
  KitCard,
  type FilterGroup,
} from '@/components/atoms'
import { GRADE_LABELS } from '@/lib/constants/grades'
import { ERA_LABELS } from '@/lib/constants/works'
import { GRADE_DISPLAY_ORDER } from '@/lib/utils/kit'
import { useUserStore, useHydrated } from '@/lib/store/user-state'
import type { Kit } from '@/lib/types/kit'
import type { Era } from '@/lib/types/work'
import type { KitStatus } from '@/lib/types/user-state'

type Filters = {
  grade: string[]
  era: string[]
  work: string[]
  status: string[]
  search: string
  showPBandai: string
}

const FILTER_PARSERS = {
  grade: parseAsArrayOf(parseAsString).withDefault([]),
  era: parseAsArrayOf(parseAsString).withDefault([]),
  work: parseAsArrayOf(parseAsString).withDefault([]),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  search: parseAsString.withDefault(''),
  showPBandai: parseAsString.withDefault('hide'),
}

const STATUS_OPTIONS: Array<{ value: KitStatus; label: string }> = [
  { value: 'wishlist', label: '心愿单' },
  { value: 'owned', label: '已拥有' },
  { value: 'building', label: '拼装中' },
  { value: 'completed', label: '已完成' },
  { value: 'painted', label: '已涂装' },
]

export function HangarBrowser({ kits }: { kits: Kit[] }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const userKits = useUserStore((s) => s.kits)

  const [filters, setFilters] = useQueryStates(FILTER_PARSERS, {
    shallow: true,
    history: 'replace',
  })

  const filtered = useMemo(() => {
    return applyFilters(kits, filters as Filters, hydrated ? userKits : {})
  }, [kits, filters, userKits, hydrated])

  const filterGroups = useMemo<FilterGroup[]>(() => {
    return buildFilterGroups(kits, filters as Filters)
  }, [kits, filters])

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
    })

  const showPBandai = filters.showPBandai === 'show'

  return (
    <div className="container mx-auto px-6 py-10">
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
            {filtered.length}
          </span>
          <span className="mx-1">/</span>
          <span>{kits.length}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
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
          {filtered.length === 0 ? (
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map((kit) => {
                const owned = hydrated ? userKits[kit.id] : undefined
                return (
                  <KitCard
                    key={kit.id}
                    kit={kit}
                    status={owned?.status ?? 'untracked'}
                    onClick={() => router.push(`/hangar/${kit.id}`)}
                  />
                )
              })}
            </div>
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

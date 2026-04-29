'use client'

import { useMemo } from 'react'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { BlueprintFrame } from '@/components/atoms'
import { useHydrated, useUserStore } from '@/lib/store/user-state'
import type {
  SubcategoryCategory,
  ToolSubcategory,
  Urgency,
} from '@/lib/types/tool-subcategory'
import { SubcategoryCard } from './SubcategoryCard'

const CATEGORY_ORDER: SubcategoryCategory[] = [
  'cutting',
  'sanding',
  'painting',
  'finishing',
  'assist',
  'workspace',
]

const CATEGORY_LABEL: Record<SubcategoryCategory, string> = {
  cutting: 'CUTTING // 剪 / 切割',
  sanding: 'SANDING // 打磨',
  painting: 'PAINTING // 涂装',
  finishing: 'FINISHING // 修饰',
  assist: 'ASSIST // 辅助',
  workspace: 'WORKSPACE // 工作环境',
}

const URGENCY_OPTIONS: Array<{ value: Urgency; label: string }> = [
  { value: 'essential', label: '必备' },
  { value: 'recommended', label: '建议' },
  { value: 'advanced', label: '进阶' },
]

const FILTER_PARSERS = {
  urgency: parseAsArrayOf(parseAsString).withDefault([]),
  category: parseAsArrayOf(parseAsString).withDefault([]),
}

export function ToolboxBrowser({
  subcategories,
}: {
  subcategories: ToolSubcategory[]
}) {
  const hydrated = useHydrated()
  const userTools = useUserStore((s) => s.tools)

  const [filters, setFilters] = useQueryStates(FILTER_PARSERS, {
    shallow: true,
    history: 'replace',
  })

  const filtered = useMemo(() => {
    return subcategories.filter((sc) => {
      if (filters.urgency.length && !filters.urgency.includes(sc.urgency))
        return false
      if (filters.category.length && !filters.category.includes(sc.category))
        return false
      return true
    })
  }, [subcategories, filters])

  const grouped = useMemo(() => {
    const map = new Map<SubcategoryCategory, ToolSubcategory[]>()
    for (const cat of CATEGORY_ORDER) map.set(cat, [])
    for (const sc of filtered) map.get(sc.category)!.push(sc)
    return map
  }, [filtered])

  const ownedCount = useMemo(() => {
    if (!hydrated) return 0
    return Object.values(userTools).filter((t) => t.owned).length
  }, [userTools, hydrated])

  const toggleUrgency = (u: Urgency) => {
    const next = filters.urgency.includes(u)
      ? filters.urgency.filter((x) => x !== u)
      : [...filters.urgency, u]
    setFilters({ urgency: next.length ? next : null })
  }

  const toggleCategory = (c: SubcategoryCategory) => {
    const next = filters.category.includes(c)
      ? filters.category.filter((x) => x !== c)
      : [...filters.category, c]
    setFilters({ category: next.length ? next : null })
  }

  return (
    <div className="container mx-auto min-w-0 max-w-full px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1
            className="font-display text-5xl tracking-wider"
            style={{ color: 'var(--color-accent-magenta)' }}
          >
            TOOLBOX
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
            {'// 工具知识图谱'}
          </p>
        </div>
        <div className="font-mono tabular-nums text-sm text-[var(--color-text-secondary)]">
          已拥有：
          <span className="text-[var(--color-accent-magenta)]">
            {hydrated ? ownedCount : 0}
          </span>
          <span className="mx-1">/</span>
          <span>{subcategories.length}</span>
        </div>
      </header>

      {/* Filter rails */}
      <div className="mb-8 space-y-3">
        <FilterRail label="按 URGENCY">
          {URGENCY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.urgency.includes(opt.value)}
              onClick={() => toggleUrgency(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </FilterRail>
        <FilterRail label="按 大类">
          {CATEGORY_ORDER.map((c) => (
            <Chip
              key={c}
              active={filters.category.includes(c)}
              onClick={() => toggleCategory(c)}
            >
              {CATEGORY_LABEL[c].split(' // ')[0]}
            </Chip>
          ))}
        </FilterRail>
      </div>

      {filtered.length === 0 ? (
        <BlueprintFrame className="p-10">
          <p className="text-center font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
            {'// 没有匹配的工具'}
          </p>
        </BlueprintFrame>
      ) : (
        <div className="space-y-10">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? []
            if (items.length === 0) return null
            return (
              <section key={cat}>
                <header className="mb-4 flex items-center gap-3">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
                    ━━ {CATEGORY_LABEL[cat]}
                  </h2>
                  <div
                    className="h-px flex-1"
                    style={{
                      background:
                        'color-mix(in srgb, var(--color-text-muted) 25%, transparent)',
                    }}
                  />
                  <span className="font-mono text-xs tabular-nums text-[var(--color-text-muted)]">
                    {items.length}
                  </span>
                </header>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {items.map((sc) => (
                    <SubcategoryCard
                      key={sc.id}
                      subcategory={sc}
                      owned={
                        hydrated && Boolean(userTools[sc.id]?.owned)
                      }
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterRail({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </span>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="border px-2 py-1 font-mono text-xs transition-colors"
      style={{
        borderColor: active
          ? 'var(--color-accent-cyan)'
          : 'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
        color: active
          ? 'var(--color-accent-cyan)'
          : 'var(--color-text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

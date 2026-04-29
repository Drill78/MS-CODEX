'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'
import { ToolIcon } from '@/components/icons/tools/ToolIcon'
import { useHydrated, useUserStore } from '@/lib/store/user-state'
import type { ToolSubcategory, WorkshopZone } from '@/lib/types/tool-subcategory'

const ZONE_LABEL: Record<WorkshopZone, string> = {
  pegboard: 'PEGBOARD // 洞洞板',
  workbench: 'WORKBENCH // 工作台',
  'cabinet-left': 'CABINET // 左柜子',
  'cabinet-right': 'CABINET // 右柜子',
}

export function Workshop({
  subcategories,
}: {
  subcategories: ToolSubcategory[]
}) {
  const hydrated = useHydrated()
  const userTools = useUserStore((s) => s.tools)

  const ownedCount = useMemo(() => {
    if (!hydrated) return 0
    return Object.values(userTools).filter((t) => t.owned).length
  }, [userTools, hydrated])

  const grouped = useMemo(() => {
    const m: Record<WorkshopZone, ToolSubcategory[]> = {
      pegboard: [],
      workbench: [],
      'cabinet-left': [],
      'cabinet-right': [],
    }
    for (const sc of subcategories) m[sc.workshop_zone].push(sc)
    return m
  }, [subcategories])

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1920px]">
        {/* Mobile / narrow viewport hint — non-blocking */}
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] lg:hidden">
          {'// 工坊视图建议在桌面端浏览（≥1024px）'}
        </p>

        <div
          className="relative w-full overflow-hidden border"
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--color-bg-paper)',
            borderColor:
              'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
          }}
        >
          {/* Header strip */}
          <header className="absolute inset-x-0 top-0 z-10 flex items-baseline justify-between border-b px-6 py-3"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
              background:
                'color-mix(in srgb, var(--color-bg-deep) 70%, transparent)',
            }}
          >
            <div>
              <h2 className="font-display text-2xl tracking-wider text-[var(--color-text-primary)]">
                我的工坊
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                {'// MY WORKSHOP'}
              </p>
            </div>
            <div className="font-mono tabular-nums text-sm text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-accent-magenta)]">
                {hydrated ? ownedCount : 0}
              </span>
              <span className="mx-1">/</span>
              <span>{subcategories.length}</span>
              <span className="ml-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                已点亮
              </span>
            </div>
          </header>

          {/* 3-zone grid (top header is absolute, content sits below) */}
          <div
            className="absolute inset-0 grid pt-[68px]"
            style={{
              gridTemplateColumns: '1fr 3fr 1fr',
              gridTemplateRows: 'minmax(0,1fr) minmax(0,1fr)',
            }}
          >
            {/* Left cabinet — spans 2 rows */}
            <Cabinet
              side="left"
              tools={grouped['cabinet-left']}
              userTools={userTools}
              hydrated={hydrated}
            />

            {/* Pegboard (top center) */}
            <Pegboard
              tools={grouped.pegboard}
              userTools={userTools}
              hydrated={hydrated}
            />

            {/* Right cabinet — spans 2 rows */}
            <Cabinet
              side="right"
              tools={grouped['cabinet-right']}
              userTools={userTools}
              hydrated={hydrated}
            />

            {/* Workbench (bottom center) */}
            <Workbench
              tools={grouped.workbench}
              userTools={userTools}
              hydrated={hydrated}
            />
          </div>
        </div>

        {/* Zone legend */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {(Object.keys(ZONE_LABEL) as WorkshopZone[]).map((z) => (
            <span key={z}>
              {ZONE_LABEL[z]} · {grouped[z].length}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

type ZoneProps = {
  tools: ToolSubcategory[]
  userTools: Record<string, { owned: boolean }>
  hydrated: boolean
}

function Cabinet({
  side,
  tools,
  userTools,
  hydrated,
}: ZoneProps & { side: 'left' | 'right' }) {
  return (
    <div
      className="row-span-2 relative flex flex-col gap-2 border-r p-3"
      style={{
        gridColumn: side === 'left' ? 1 : 3,
        gridRow: '1 / span 2',
        borderColor:
          side === 'left'
            ? 'color-mix(in srgb, var(--color-text-muted) 20%, transparent)'
            : 'transparent',
        borderLeftWidth: side === 'right' ? 1 : 0,
        borderLeftColor:
          'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--color-bg-elevated) 60%, transparent), color-mix(in srgb, var(--color-bg-paper) 90%, transparent))',
      }}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        {side === 'left' ? '左柜' : '右柜'} · {tools.length}
      </span>
      <div className="flex flex-1 flex-col justify-around gap-2 overflow-hidden">
        {tools.map((t) => (
          <ToolSlot
            key={t.id}
            tool={t}
            lit={hydrated && Boolean(userTools[t.id]?.owned)}
            iconSize={36}
          />
        ))}
      </div>
    </div>
  )
}

function Pegboard({ tools, userTools, hydrated }: ZoneProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        gridColumn: 2,
        gridRow: 1,
        backgroundImage:
          'radial-gradient(circle at 8px 8px, rgba(120,180,255,0.10) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        background:
          'linear-gradient(180deg, var(--color-bg-paper), color-mix(in srgb, var(--color-bg-deep) 80%, transparent)), radial-gradient(circle at 8px 8px, rgba(120,180,255,0.08) 1px, transparent 1px)',
      }}
    >
      <span className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        PEGBOARD · {tools.length}
      </span>
      {tools.map((t) => (
        <PositionedSlot
          key={t.id}
          tool={t}
          lit={hydrated && Boolean(userTools[t.id]?.owned)}
        />
      ))}
    </div>
  )
}

function Workbench({ tools, userTools, hydrated }: ZoneProps) {
  return (
    <div
      className="relative overflow-hidden border-t"
      style={{
        gridColumn: 2,
        gridRow: 2,
        borderColor:
          'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
        background:
          'repeating-linear-gradient(0deg, transparent 0 23px, color-mix(in srgb, var(--color-text-muted) 8%, transparent) 23px 24px), repeating-linear-gradient(90deg, transparent 0 23px, color-mix(in srgb, var(--color-text-muted) 8%, transparent) 23px 24px), color-mix(in srgb, var(--color-bg-elevated) 80%, transparent)',
      }}
    >
      <span className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
        WORKBENCH · {tools.length}
      </span>

      {/* Center silhouette — visual anchor */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center justify-center opacity-40"
        style={{ width: '20%' }}
      >
        <Image
          src="/icons/gundam-silhouette.svg"
          alt=""
          width={100}
          height={200}
          className="h-full w-auto"
          style={{ color: 'var(--color-accent-cyan)' }}
        />
      </div>

      {tools.map((t) => (
        <PositionedSlot
          key={t.id}
          tool={t}
          lit={hydrated && Boolean(userTools[t.id]?.owned)}
        />
      ))}
    </div>
  )
}

function PositionedSlot({
  tool,
  lit,
}: {
  tool: ToolSubcategory
  lit: boolean
}) {
  return (
    <Link
      href={`/toolbox/${tool.id}`}
      title={tool.name_zh}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-transform hover:scale-110"
      style={{
        left: `${tool.workshop_position.x}%`,
        top: `${tool.workshop_position.y}%`,
      }}
    >
      <ToolIcon id={tool.icon} lit={lit} size={28} />
      <span
        className="max-w-[80px] truncate font-mono text-[9px] uppercase tracking-widest"
        style={{
          color: lit
            ? 'var(--color-text-primary)'
            : 'color-mix(in srgb, var(--color-text-muted) 60%, transparent)',
        }}
      >
        {tool.name_zh}
      </span>
    </Link>
  )
}

function ToolSlot({
  tool,
  lit,
  iconSize = 28,
}: {
  tool: ToolSubcategory
  lit: boolean
  iconSize?: number
}) {
  return (
    <Link
      href={`/toolbox/${tool.id}`}
      title={tool.name_zh}
      className="flex items-center gap-2 transition-transform hover:translate-x-0.5"
    >
      <ToolIcon id={tool.icon} lit={lit} size={iconSize} />
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-xs"
          style={{
            color: lit
              ? 'var(--color-text-primary)'
              : 'color-mix(in srgb, var(--color-text-muted) 60%, transparent)',
          }}
        >
          {tool.name_zh}
        </div>
        <div className="truncate font-mono text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {tool.urgency}
        </div>
      </div>
    </Link>
  )
}

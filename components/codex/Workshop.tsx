'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { BlueprintFrame } from '@/components/atoms'
import { ToolIcon } from '@/components/icons/tools/ToolIcon'
import { useHydrated, useUserStore } from '@/lib/store/user-state'
import type { ToolSubcategory } from '@/lib/types/tool-subcategory'

export function Workshop({
  subcategories,
}: {
  subcategories: ToolSubcategory[]
}) {
  return (
    <>
      <div className="hidden lg:block">
        <WorkshopDesktop subcategories={subcategories} />
      </div>
      <div className="lg:hidden">
        <WorkshopMobile subcategories={subcategories} />
      </div>
    </>
  )
}

function WorkshopDesktop({
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
    return {
      pegboard: subcategories.filter((t) => t.workshop_zone === 'pegboard'),
      workbench: subcategories.filter((t) => t.workshop_zone === 'workbench'),
      cabinetLeft: subcategories.filter(
        (t) => t.workshop_zone === 'cabinet-left',
      ),
      cabinetRight: subcategories.filter(
        (t) => t.workshop_zone === 'cabinet-right',
      ),
    }
  }, [subcategories])

  return (
    <section className="mx-auto w-full max-w-[1920px]">
      <BlueprintFrame
        variant="default"
        className="relative w-full overflow-hidden"
      >
        <div
          className="relative w-full"
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--color-bg-paper)',
            backgroundImage:
              'radial-gradient(ellipse at 50% 70%, color-mix(in srgb, var(--color-accent-cyan) 6%, transparent), transparent 60%)',
          }}
        >
          {/* Header */}
          <header
            className="absolute inset-x-0 top-0 z-20 flex items-baseline justify-between border-b px-6 py-3"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
              background:
                'color-mix(in srgb, var(--color-bg-deep) 70%, transparent)',
            }}
          >
            <div>
              <h2 className="font-display text-3xl tracking-wider text-[var(--color-text-primary)]">
                我的工坊
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                {'// MY WORKSHOP'}
              </p>
            </div>
            <div className="font-mono tabular-nums">
              <span className="text-3xl text-[var(--color-accent-magenta)]">
                {hydrated ? ownedCount : 0}
              </span>
              <span className="ml-1 text-base text-[var(--color-text-muted)]">
                / {subcategories.length}
              </span>
              <span className="ml-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                已点亮
              </span>
            </div>
          </header>

          {/* Workshop layout grid */}
          <div className="absolute inset-0 grid grid-cols-[1fr_3fr_1fr] grid-rows-[1fr_1fr] gap-4 px-6 pb-6 pt-24">
            {/* Left cabinet — spans both rows */}
            <div className="row-span-2 min-h-0">
              <CabinetZone tools={grouped.cabinetLeft} side="left" />
            </div>

            {/* Pegboard — top center */}
            <div className="min-h-0">
              <PegboardZone tools={grouped.pegboard} />
            </div>

            {/* Right cabinet — spans both rows */}
            <div className="row-span-2 min-h-0">
              <CabinetZone tools={grouped.cabinetRight} side="right" />
            </div>

            {/* Workbench — bottom center */}
            <div className="min-h-0">
              <WorkbenchZone tools={grouped.workbench} />
            </div>
          </div>
        </div>
      </BlueprintFrame>
    </section>
  )
}

function WorkshopMobile({
  subcategories,
}: {
  subcategories: ToolSubcategory[]
}) {
  const hydrated = useHydrated()
  const userTools = useUserStore((s) => s.tools)

  const { owned, unowned, ownedCount } = useMemo(() => {
    const ownedList: ToolSubcategory[] = []
    const unownedList: ToolSubcategory[] = []
    for (const sc of subcategories) {
      const isOwned = hydrated && Boolean(userTools[sc.id]?.owned)
      if (isOwned) ownedList.push(sc)
      else unownedList.push(sc)
    }
    return {
      owned: ownedList,
      unowned: unownedList,
      ownedCount: ownedList.length,
    }
  }, [subcategories, userTools, hydrated])

  return (
    <section className="mx-auto w-full max-w-2xl">
      <BlueprintFrame variant="default" className="mb-4 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {'// WORKSHOP 工坊视图建议在桌面端浏览（≥1024px）'}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          这里展示精简的工具列表。点亮{' '}
          <span className="font-mono tabular-nums text-[var(--color-accent-magenta)]">
            {hydrated ? ownedCount : 0}
          </span>
          <span className="font-mono text-[var(--color-text-muted)]">
            {' / '}
            {subcategories.length}
          </span>
        </p>
      </BlueprintFrame>

      <section className="mb-6">
        <header className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-2xl tracking-wider">已拥有</h3>
          <span className="font-mono tabular-nums text-[var(--color-accent-magenta)]">
            {hydrated ? owned.length : 0}
          </span>
        </header>
        {owned.length === 0 ? (
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            {'// 还没有标注任何工具，去 TOOLBOX 看看吧'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {owned.map((t) => (
              <MobileToolTile key={t.id} tool={t} lit />
            ))}
          </div>
        )}
      </section>

      <section>
        <details>
          <summary className="cursor-pointer list-none font-display text-2xl tracking-wider text-[var(--color-text-secondary)]">
            未拥有{' '}
            <span className="font-mono text-base tabular-nums text-[var(--color-text-muted)]">
              ({unowned.length})
            </span>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {unowned.map((t) => (
              <MobileToolTile key={t.id} tool={t} lit={false} />
            ))}
          </div>
        </details>
      </section>
    </section>
  )
}

function MobileToolTile({
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
      className={cn(
        'flex flex-col items-center gap-1 border p-3 transition-colors',
        lit
          ? 'border-[var(--color-accent-magenta)]/50 bg-[color-mix(in_oklch,var(--color-accent-magenta)_4%,transparent)]'
          : 'border-[var(--color-text-muted)]/30',
      )}
    >
      <ToolIcon id={tool.icon} lit={lit} size={48} />
      <span
        className={cn(
          'max-w-full truncate text-center font-mono text-xs',
          lit
            ? 'text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-muted)]',
        )}
      >
        {tool.name_zh}
      </span>
    </Link>
  )
}

function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-2 top-2 z-10">
      <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        {children}
      </span>
    </div>
  )
}

function PegboardZone({ tools }: { tools: ToolSubcategory[] }) {
  return (
    <div className="relative h-full w-full">
      <ZoneLabel>{'PEGBOARD // 洞洞板'}</ZoneLabel>

      <div
        aria-hidden
        className="absolute inset-0 border"
        style={{
          borderColor:
            'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
          backgroundImage:
            'radial-gradient(circle at 12px 12px, var(--color-text-muted) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '12px 12px',
          opacity: 0.4,
        }}
      />

      <div className="absolute inset-0">
        {tools.map((tool) => (
          <ToolMarker key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

function WorkbenchZone({ tools }: { tools: ToolSubcategory[] }) {
  return (
    <div className="relative h-full w-full">
      <ZoneLabel>{'WORKBENCH // 工作台'}</ZoneLabel>

      <div
        aria-hidden
        className="absolute inset-0 border"
        style={{
          borderColor:
            'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
          backgroundImage:
            'linear-gradient(to right, var(--color-text-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--color-text-muted) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.25,
        }}
      />

      <div className="absolute inset-0">
        {tools.map((tool) => (
          <ToolMarker key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

function CabinetZone({
  tools,
  side,
}: {
  tools: ToolSubcategory[]
  side: 'left' | 'right'
}) {
  return (
    <div className="relative h-full w-full">
      <ZoneLabel>
        {`CABINET-${side.toUpperCase()} // ${side === 'left' ? '左柜' : '右柜'}`}
      </ZoneLabel>

      <div
        aria-hidden
        className="absolute inset-0 border"
        style={{
          borderColor:
            'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
        }}
      />

      <div className="absolute inset-0 flex flex-col gap-2 px-2 pb-2 pt-8">
        {tools.map((tool) => (
          <CabinetSlot key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

function CabinetSlot({ tool }: { tool: ToolSubcategory }) {
  const hydrated = useHydrated()
  const owned = useUserStore((s) => Boolean(s.tools[tool.id]?.owned))
  const lit = hydrated && owned

  return (
    <Link
      href={`/toolbox/${tool.id}`}
      title={tool.name_zh}
      className={cn(
        'group relative flex min-h-0 flex-1 flex-col items-center justify-center gap-1 border transition-colors',
        lit
          ? 'border-[var(--color-accent-magenta)]/50 bg-[color-mix(in_oklch,var(--color-accent-magenta)_4%,transparent)]'
          : 'border-[var(--color-text-muted)]/30 hover:border-[var(--color-accent-cyan)]/50',
      )}
    >
      <ToolIcon id={tool.icon} lit={lit} size={60} />
      <span
        className={cn(
          'max-w-full truncate px-1 font-mono text-sm',
          lit
            ? 'text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]',
        )}
      >
        {tool.name_zh}
      </span>
    </Link>
  )
}

function ToolMarker({ tool }: { tool: ToolSubcategory }) {
  const hydrated = useHydrated()
  const owned = useUserStore((s) => Boolean(s.tools[tool.id]?.owned))
  const lit = hydrated && owned

  return (
    <Link
      href={`/toolbox/${tool.id}`}
      title={tool.name_zh}
      className="group absolute"
      style={{
        left: `${tool.workshop_position.x}%`,
        top: `${tool.workshop_position.y}%`,
        width: '120px',
        height: '110px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Fixed bounding box — visible only on hover for collision debugging */}
      <span
        aria-hidden
        className="absolute inset-0 border border-transparent transition-colors group-hover:border-[var(--color-accent-cyan)]/30"
      />

      <span className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-1 transition-transform group-hover:scale-105">
        <ToolIcon id={tool.icon} lit={lit} size={72} />
        <span
          className={cn(
            'max-w-full truncate text-center font-mono text-sm transition-colors',
            lit
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]',
          )}
          style={{
            textShadow:
              '0 0 4px var(--color-bg-paper), 0 0 4px var(--color-bg-paper), 0 0 4px var(--color-bg-paper)',
          }}
        >
          {tool.name_zh}
        </span>
      </span>
    </Link>
  )
}

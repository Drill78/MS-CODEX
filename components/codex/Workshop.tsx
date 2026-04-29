'use client'

import Link from 'next/link'
import Image from 'next/image'
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
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)] lg:hidden">
        {'// 工坊视图建议在桌面端浏览（≥1024px）'}
      </p>

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

      {/* Gundam silhouette anchor — upper half, leaving lower workbench for tools */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/icons/rx-78-2-head.svg"
          alt="RX-78-2"
          width={120}
          height={144}
          className="absolute h-[55%] w-auto opacity-30"
          style={{
            left: '50%',
            top: '38%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--color-accent-cyan)',
            filter: 'brightness(1.5)',
          }}
        />
      </div>

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

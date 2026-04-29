'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BlueprintFrame,
  GradeBadge,
  HangarSlot,
} from '@/components/atoms'
import { GRADE_DISPLAY_ORDER, groupKitsByGrade } from '@/lib/utils/kit'
import { useHydrated, useUserStore } from '@/lib/store/user-state'
import type { Kit, Grade } from '@/lib/types/kit'

export function CodexView({ allKits }: { allKits: Kit[] }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const userKits = useUserStore((s) => s.kits)

  const grouped = useMemo(() => groupKitsByGrade(allKits), [allKits])

  const ownedTotal = useMemo(() => {
    if (!hydrated) return 0
    return Object.values(userKits).filter((v) => v.status !== 'wishlist').length
  }, [userKits, hydrated])

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
        <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
          {'// 工具墙'}
        </h2>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          工具数据库即将上线 —— 你拥有的工具会在这里以拼装情景墙的形式展开。
        </p>
      </BlueprintFrame>

      <section className="mt-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-wider text-[var(--color-text-primary)]">
            我的机库
          </h2>
          <div className="font-mono tabular-nums text-sm text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-uc-green)]">{ownedTotal}</span>
            <span className="mx-1">/</span>
            <span>{allKits.length}</span>
          </div>
        </div>

        <div className="space-y-10">
          {GRADE_DISPLAY_ORDER.map((grade) => {
            const kits = grouped.get(grade) ?? []
            if (kits.length === 0) return null
            const ownedInGroup = hydrated
              ? kits.filter(
                  (k) =>
                    userKits[k.id] && userKits[k.id].status !== 'wishlist',
                ).length
              : 0
            return (
              <GradeSection
                key={grade}
                grade={grade}
                kits={kits}
                owned={ownedInGroup}
                userKits={userKits}
                hydrated={hydrated}
                onSelect={(id) => router.push(`/hangar/${id}`)}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

function GradeSection({
  grade,
  kits,
  owned,
  userKits,
  hydrated,
  onSelect,
}: {
  grade: Grade
  kits: Kit[]
  owned: number
  userKits: Record<string, { status: string }>
  hydrated: boolean
  onSelect: (id: string) => void
}) {
  const total = kits.length
  const pct = total ? Math.round((owned / total) * 100) : 0

  return (
    <div>
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
          {owned}/{total}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {kits.map((kit) => {
          const isOwned = hydrated
            ? Boolean(userKits[kit.id] && userKits[kit.id].status !== 'wishlist')
            : false
          return (
            <HangarSlot
              key={kit.id}
              kit={kit}
              owned={isOwned}
              onClick={() => onSelect(kit.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

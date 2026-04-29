'use client'

import Link from 'next/link'
import { BlueprintFrame, GradeBadge } from '@/components/atoms'
import { ToolIcon } from '@/components/icons/tools/ToolIcon'
import { useHydrated, useUserStore } from '@/lib/store/user-state'
import type { ToolSubcategory, Urgency } from '@/lib/types/tool-subcategory'

const URGENCY_LABEL: Record<Urgency, string> = {
  essential: '必备 ★★★',
  recommended: '建议 ★★',
  advanced: '进阶 ★',
}

const URGENCY_COLOR: Record<Urgency, string> = {
  essential: 'var(--color-accent-magenta)',
  recommended: 'var(--color-accent-cyan)',
  advanced: 'var(--color-text-muted)',
}

export function ToolboxDetail({
  subcategory,
}: {
  subcategory: ToolSubcategory
}) {
  const hydrated = useHydrated()
  const owned = useUserStore((s) => Boolean(s.tools[subcategory.id]?.owned))
  const setToolOwned = useUserStore((s) => s.setToolOwned)

  const lit = hydrated && owned
  const color = URGENCY_COLOR[subcategory.urgency]

  return (
    <div className="container mx-auto px-6 py-8">
      <Link
        href="/toolbox"
        className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-cyan)]"
      >
        ← 返回工具图谱
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: icon + ownership toggle + meta (sticky on desktop) */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <BlueprintFrame variant={lit ? 'magenta' : 'default'} className="p-8">
            <div className="flex flex-col items-center gap-6">
              <div
                className="flex h-48 w-48 items-center justify-center"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border:
                    '1px solid color-mix(in srgb, var(--color-text-muted) 25%, transparent)',
                }}
              >
                <ToolIcon
                  id={subcategory.icon}
                  lit={lit}
                  size={120}
                  strokeWidth={1.5}
                />
              </div>

              <div className="text-center">
                <span
                  className="inline-block border px-3 py-1 font-mono text-sm uppercase tracking-widest"
                  style={{ color, borderColor: color }}
                >
                  {URGENCY_LABEL[subcategory.urgency]}
                </span>
              </div>

              <div className="w-full">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                  适用 GRADE
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subcategory.recommended_for_grades.map((g) => (
                    <GradeBadge key={g} grade={g} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          </BlueprintFrame>

          {/* Ownership toggle — primary action, directly under icon card */}
          <OwnershipToggle
            owned={lit}
            onToggle={() => setToolOwned(subcategory.id, !owned)}
          />
        </div>

        {/* Right: knowledge graph */}
        <div className="space-y-6">
          <header>
            <h1 className="font-display text-4xl tracking-wider text-[var(--color-text-primary)]">
              {subcategory.name_zh}
            </h1>
            <div className="mt-2 font-mono text-sm text-[var(--color-text-secondary)]">
              {subcategory.name_en}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
              {subcategory.category} · {subcategory.workshop_zone}
            </div>
          </header>

          <Section title="── 是什么 ──">{subcategory.what_it_is}</Section>
          <Section title="── 为什么需要 ──">
            {subcategory.why_you_need_it}
          </Section>
          <Section title="── 何时使用 ──">{subcategory.when_to_use}</Section>
          {subcategory.vs_alternatives && (
            <Section title="── 与替代品对比 ──">
              {subcategory.vs_alternatives}
            </Section>
          )}
          {subcategory.pitfalls.length > 0 && (
            <BlueprintFrame variant="cyan" className="p-6">
              <h3 className="mb-3 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
                ── 新手避坑 ──
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-primary)]">
                {subcategory.pitfalls.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className="font-mono text-[var(--color-uc-amber)]"
                      aria-hidden
                    >
                      ▸
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </BlueprintFrame>
          )}

          <BlueprintFrame className="p-6">
            <h3 className="mb-3 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
              ── 推荐型号 ──
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              具体型号推荐即将上线 —— 这里会按价位档（入门 / 性价比 / 进阶）展开主流国产 / 田宫 / 郡士 等品牌。
            </p>
          </BlueprintFrame>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <BlueprintFrame className="p-6">
      <h3 className="mb-3 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
        {children}
      </p>
    </BlueprintFrame>
  )
}

function OwnershipToggle({
  owned,
  onToggle,
}: {
  owned: boolean
  onToggle: () => void
}) {
  return (
    <BlueprintFrame variant={owned ? 'magenta' : 'default'} className="p-0">
      <button
        type="button"
        role="switch"
        aria-checked={owned}
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent-cyan)_8%,transparent)]"
      >
        <span className="flex items-center gap-3">
          {/* Checkbox indicator */}
          <span
            aria-hidden
            className="flex h-6 w-6 flex-none items-center justify-center border transition-colors"
            style={{
              backgroundColor: owned
                ? 'var(--color-accent-magenta)'
                : 'transparent',
              borderColor: owned
                ? 'var(--color-accent-magenta)'
                : 'color-mix(in srgb, var(--color-text-muted) 40%, transparent)',
            }}
          >
            {owned && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 7 L6 11 L12 3" />
              </svg>
            )}
          </span>
          <span
            className="font-mono text-sm uppercase tracking-wider"
            style={{
              color: owned
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
            }}
          >
            {owned ? '已拥有此类工具' : '标记为已拥有'}
          </span>
        </span>
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{
            color: owned
              ? 'var(--color-accent-magenta)'
              : 'var(--color-text-muted)',
          }}
        >
          {owned ? '◆ OWNED' : 'CLICK TO TOGGLE'}
        </span>
      </button>
    </BlueprintFrame>
  )
}

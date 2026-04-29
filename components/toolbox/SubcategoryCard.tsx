'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BlueprintFrame, GradeBadge } from '@/components/atoms'
import { ToolIcon } from '@/components/icons/tools/ToolIcon'
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

export function SubcategoryCard({
  subcategory,
  owned,
  className,
}: {
  subcategory: ToolSubcategory
  owned: boolean
  className?: string
}) {
  const color = URGENCY_COLOR[subcategory.urgency]

  return (
    <Link
      href={`/toolbox/${subcategory.id}`}
      className={cn(
        'group block w-full transition-transform hover:-translate-y-0.5 focus:outline-none',
        className,
      )}
    >
      <BlueprintFrame className="h-full w-full">
        <div className="relative flex h-full flex-col gap-2 p-4">
          {owned && (
            <span
              className="absolute right-3 top-3 font-mono text-sm"
              style={{ color: 'var(--color-uc-amber)' }}
              title="已拥有"
            >
              ◆
            </span>
          )}

          <div
            className="flex h-16 items-center justify-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ToolIcon id={subcategory.icon} lit={owned} size={48} />
          </div>

          <div className="text-center">
            <div className="line-clamp-1 text-base text-[var(--color-text-primary)]">
              {subcategory.name_zh}
            </div>
            <div className="line-clamp-1 font-mono text-xs text-[var(--color-text-muted)]">
              {subcategory.name_en}
            </div>
          </div>

          <div className="flex justify-center">
            <span
              className="inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
              style={{ color, borderColor: color }}
            >
              {URGENCY_LABEL[subcategory.urgency]}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap justify-center gap-1">
            {subcategory.recommended_for_grades.slice(0, 6).map((g) => (
              <GradeBadge key={g} grade={g} size="sm" />
            ))}
            {subcategory.recommended_for_grades.length > 6 && (
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                +{subcategory.recommended_for_grades.length - 6}
              </span>
            )}
          </div>
        </div>
      </BlueprintFrame>
    </Link>
  )
}

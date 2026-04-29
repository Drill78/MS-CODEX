'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BlueprintFrame, GradeBadge } from '@/components/atoms'
import { ToolIcon } from '@/components/icons/tools/ToolIcon'
import { CATEGORY_VISUALS } from '@/lib/constants/tool-categories'
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

const MAX_VISIBLE_GRADES = 3

export function SubcategoryCard({
  subcategory,
  owned,
  className,
}: {
  subcategory: ToolSubcategory
  owned: boolean
  className?: string
}) {
  const urgencyColor = URGENCY_COLOR[subcategory.urgency]
  const visual = CATEGORY_VISUALS[subcategory.category]

  const visibleGrades = subcategory.recommended_for_grades.slice(
    0,
    MAX_VISIBLE_GRADES,
  )
  const overflowGrades =
    subcategory.recommended_for_grades.length - visibleGrades.length

  return (
    <Link
      href={`/toolbox/${subcategory.id}`}
      className={cn(
        'group block w-full transition-transform hover:-translate-y-0.5 focus:outline-none',
        className,
      )}
    >
      <BlueprintFrame className="h-full w-full">
        <div
          className="relative flex h-full min-h-[200px] flex-col overflow-hidden border"
          style={{
            backgroundColor: visual.bg,
            borderColor: visual.border,
          }}
        >
          {/* Category color band */}
          <div
            aria-hidden
            className="h-1 w-full flex-none"
            style={{ backgroundColor: visual.color }}
          />

          <div className="relative flex flex-1 flex-col gap-2 p-4">
            {owned && (
              <span
                className="absolute right-2 top-2 font-mono text-base"
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
              <ToolIcon id={subcategory.icon} lit={owned} size={64} />
            </div>

            <div className="text-center">
              <div className="line-clamp-1 text-base font-medium text-[var(--color-text-primary)]">
                {subcategory.name_zh}
              </div>
              <div className="line-clamp-1 mt-0.5 font-mono text-sm text-[var(--color-text-secondary)]">
                {subcategory.name_en}
              </div>
            </div>

            <div className="flex justify-center">
              <span
                className="inline-block border px-2 py-0.5 font-mono text-xs uppercase tracking-widest"
                style={{ color: urgencyColor, borderColor: urgencyColor }}
              >
                {URGENCY_LABEL[subcategory.urgency]}
              </span>
            </div>

            <div className="mt-auto flex flex-wrap justify-center gap-1">
              {visibleGrades.map((g) => (
                <GradeBadge key={g} grade={g} size="sm" />
              ))}
              {overflowGrades > 0 && (
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  +{overflowGrades}
                </span>
              )}
            </div>
          </div>
        </div>
      </BlueprintFrame>
    </Link>
  )
}

import { cn } from '@/lib/utils'

export type FilterGroup = {
  id: string
  label: string
  options: { value: string; label: string; count?: number }[]
  selected: string[]
  multi?: boolean
}

export type FilterPanelProps = {
  groups: FilterGroup[]
  onChange: (groupId: string, selected: string[]) => void
  className?: string
}

export function FilterPanel({ groups, onChange, className }: FilterPanelProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {groups.map((group, idx) => {
        const isMulti = group.multi !== false
        return (
          <div
            key={group.id}
            className={cn(idx > 0 && 'border-t pt-4')}
            style={
              idx > 0
                ? {
                    borderColor:
                      'color-mix(in srgb, var(--color-text-muted) 12%, transparent)',
                  }
                : undefined
            }
          >
            <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((opt) => {
                const active = group.selected.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      if (isMulti) {
                        const next = active
                          ? group.selected.filter((v) => v !== opt.value)
                          : [...group.selected, opt.value]
                        onChange(group.id, next)
                      } else {
                        onChange(group.id, active ? [] : [opt.value])
                      }
                    }}
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
                    {opt.label}
                    {opt.count !== undefined && (
                      <span className="ml-1 text-[10px] tabular-nums text-[var(--color-text-muted)]">
                        ({opt.count})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FilterPanel

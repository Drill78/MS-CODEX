import type { SubcategoryCategory } from '@/lib/types/tool-subcategory'

export type CategoryVisual = {
  color: string
  bg: string
  border: string
  label_zh: string
  label_en: string
}

export const CATEGORY_VISUALS: Record<SubcategoryCategory, CategoryVisual> = {
  cutting: {
    color: 'var(--color-accent-cyan)',
    bg: 'color-mix(in oklch, var(--color-accent-cyan) 6%, var(--color-bg-elevated))',
    border: 'color-mix(in oklch, var(--color-accent-cyan) 30%, transparent)',
    label_zh: '剪 / 切割',
    label_en: 'CUTTING',
  },
  sanding: {
    color: 'var(--color-uc-amber)',
    bg: 'color-mix(in oklch, var(--color-uc-amber) 6%, var(--color-bg-elevated))',
    border: 'color-mix(in oklch, var(--color-uc-amber) 30%, transparent)',
    label_zh: '打磨',
    label_en: 'SANDING',
  },
  painting: {
    color: 'var(--color-accent-magenta)',
    bg: 'color-mix(in oklch, var(--color-accent-magenta) 6%, var(--color-bg-elevated))',
    border: 'color-mix(in oklch, var(--color-accent-magenta) 30%, transparent)',
    label_zh: '涂装',
    label_en: 'PAINTING',
  },
  finishing: {
    color: 'var(--color-pg)',
    bg: 'color-mix(in oklch, var(--color-pg) 6%, var(--color-bg-elevated))',
    border: 'color-mix(in oklch, var(--color-pg) 30%, transparent)',
    label_zh: '修饰',
    label_en: 'FINISHING',
  },
  assist: {
    color: 'var(--color-fm)',
    bg: 'color-mix(in oklch, var(--color-fm) 6%, var(--color-bg-elevated))',
    border: 'color-mix(in oklch, var(--color-fm) 30%, transparent)',
    label_zh: '辅助',
    label_en: 'ASSIST',
  },
  workspace: {
    color: 'var(--color-re100)',
    bg: 'color-mix(in oklch, var(--color-re100) 6%, var(--color-bg-elevated))',
    border: 'color-mix(in oklch, var(--color-re100) 30%, transparent)',
    label_zh: '工作环境',
    label_en: 'WORKSPACE',
  },
}

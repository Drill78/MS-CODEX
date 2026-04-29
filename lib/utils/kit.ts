import type { Kit, Grade } from '@/lib/types/kit'

/** Extract the leading integer from `series_number` (e.g. "001" → 1). */
export function kitSortKey(kit: Kit): number {
  const m = kit.series_number?.match(/\d+/)
  return m ? parseInt(m[0], 10) : 9999
}

/** Render `YYYY-MM-DD` / `YYYY-MM-00` / `YYYY-00-00` at appropriate precision. */
export function formatReleaseDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  if (!y) return '—'
  if (!m || m === '00') return `${y}`
  if (!d || d === '00') return `${y}/${m}`
  return `${y}/${m}/${d}`
}

export function formatPriceJpy(
  price: number | undefined,
  uncertain?: boolean,
): string {
  if (!price || price <= 0) return '—'
  return `¥${price.toLocaleString('ja-JP')}${uncertain ? '?' : ''}`
}

export const GRADE_DISPLAY_ORDER: Grade[] = [
  'PG',
  'PG-Unleashed',
  'MG-VerKa',
  'MG',
  'RG',
  'RE100',
  'FM',
  'HG',
  'EG',
  'SDCS',
  'SD',
]

export function groupKitsByGrade(kits: Kit[]): Map<Grade, Kit[]> {
  const map = new Map<Grade, Kit[]>()
  for (const grade of GRADE_DISPLAY_ORDER) map.set(grade, [])
  for (const kit of kits) {
    const arr = map.get(kit.grade) ?? []
    arr.push(kit)
    map.set(kit.grade, arr)
  }
  for (const [g, arr] of map) {
    arr.sort((a, b) => kitSortKey(a) - kitSortKey(b))
    map.set(g, arr)
  }
  return map
}

export const COLOR_SEPARATION_LABEL: Record<
  NonNullable<Kit['color_separation']>,
  string
> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  'requires-paint': '需涂装',
}

export const DECAL_LABEL: Record<NonNullable<Kit['decals']>, string> = {
  'water-slide': '水贴',
  sticker: '普通贴纸',
  both: '水贴 + 贴纸',
  none: '无',
}

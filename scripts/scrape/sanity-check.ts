import type { Kit } from '@/lib/types/kit'
import type { Work } from '@/lib/types/work'
import { GRADES } from '@/lib/constants/grades'

export type SanityResult = {
  passed: boolean
  errors: string[]
  warnings: string[]
}

const SCALE_PATTERN = /^1\/(48|60|100|144|35|24|72|400|550)$/

export function sanityCheck(kits: Kit[], works: Work[]): SanityResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 1) id 全局唯一
  const idCounts = new Map<string, number>()
  for (const k of kits) {
    idCounts.set(k.id, (idCounts.get(k.id) ?? 0) + 1)
  }
  for (const [id, n] of idCounts) {
    if (n > 1) errors.push(`duplicate kit.id: ${id} (×${n})`)
  }

  // 2) grade 在 GRADES 集合里
  const gradeSet = new Set<string>(GRADES)
  for (const k of kits) {
    if (!gradeSet.has(k.grade)) {
      errors.push(`unknown grade '${k.grade}' on kit ${k.id}`)
    }
  }

  // 3) scale 形如 1/NN
  for (const k of kits) {
    if (k.scale && !SCALE_PATTERN.test(k.scale)) {
      warnings.push(`unusual scale '${k.scale}' on kit ${k.id}`)
    }
  }

  // 4) source_works[*].id 在 works.json 里
  const workIds = new Set(works.map((w) => w.id))
  for (const k of kits) {
    for (const w of k.source_works ?? []) {
      if (!workIds.has(w.id)) {
        errors.push(
          `kit ${k.id} references unknown work id '${w.id}' (not in works.json)`,
        )
      }
    }
  }

  return { passed: errors.length === 0, errors, warnings }
}

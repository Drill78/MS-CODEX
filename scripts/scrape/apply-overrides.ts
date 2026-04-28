import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { KitWithMeta } from './types'
import type { Kit } from '@/lib/types/kit'

const OVERRIDES_PATH = path.resolve('data', 'manual-overrides.json')

export async function applyOverrides(
  kits: KitWithMeta[],
): Promise<{ applied: number; missing_ids: string[] }> {
  let raw: string | undefined
  try {
    raw = await fs.readFile(OVERRIDES_PATH, 'utf-8')
  } catch {
    return { applied: 0, missing_ids: [] }
  }

  let parsed: Record<string, Partial<Kit>>
  try {
    parsed = raw.trim() ? JSON.parse(raw) : {}
  } catch {
    return { applied: 0, missing_ids: [] }
  }

  const byId = new Map(kits.map((k) => [k.id, k] as const))
  let applied = 0
  const missing: string[] = []
  for (const [kitId, patch] of Object.entries(parsed)) {
    const kit = byId.get(kitId)
    if (!kit) {
      missing.push(kitId)
      continue
    }
    Object.assign(kit, patch)
    applied++
  }

  return { applied, missing_ids: missing }
}

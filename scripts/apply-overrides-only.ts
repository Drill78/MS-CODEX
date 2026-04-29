import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Kit } from '@/lib/types/kit'

const KITS_PATH = path.resolve('data', 'kits.json')
const OVERRIDES_PATH = path.resolve('data', 'manual-overrides.json')

async function main() {
  const [kitsRaw, ovrRaw] = await Promise.all([
    fs.readFile(KITS_PATH, 'utf-8'),
    fs.readFile(OVERRIDES_PATH, 'utf-8'),
  ])

  const kits = JSON.parse(kitsRaw) as Kit[]
  const overrides = (
    ovrRaw.trim() ? JSON.parse(ovrRaw) : {}
  ) as Record<string, Partial<Kit>>

  const byId = new Map(kits.map((k) => [k.id, k] as const))
  let applied = 0
  const missing: string[] = []

  for (const [kitId, patch] of Object.entries(overrides)) {
    const kit = byId.get(kitId)
    if (!kit) {
      missing.push(kitId)
      continue
    }
    Object.assign(kit, patch)
    applied++
  }

  await fs.writeFile(KITS_PATH, JSON.stringify(kits, null, 2) + '\n', 'utf-8')

  console.log(
    `Applied ${applied} override(s) to ${KITS_PATH}` +
      (missing.length ? `\nMissing kit ids: ${missing.join(', ')}` : ''),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

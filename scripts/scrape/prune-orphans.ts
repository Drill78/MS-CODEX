import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Kit } from '@/lib/types/kit'

const IMAGE_DIR = path.resolve('public', 'images', 'kits')
const ORPHAN_DIR = path.resolve('data', 'raw', 'orphan-images')

export type PruneResult = {
  pruned_count: number
  pruned_size_bytes: number
  remaining_count: number
  remaining_size_bytes: number
}

/**
 * Move .jpg files in /public/images/kits/ that don't correspond to a kit.id
 * in the current kits list into /data/raw/orphan-images/. Non-destructive.
 */
export async function pruneOrphanImages(kits: Kit[]): Promise<PruneResult> {
  let files: string[]
  try {
    files = await fs.readdir(IMAGE_DIR)
  } catch {
    return { pruned_count: 0, pruned_size_bytes: 0, remaining_count: 0, remaining_size_bytes: 0 }
  }

  const validIds = new Set(kits.map((k) => k.id))
  await fs.mkdir(ORPHAN_DIR, { recursive: true })

  let prunedCount = 0
  let prunedBytes = 0
  let remainingCount = 0
  let remainingBytes = 0

  for (const f of files) {
    if (!f.endsWith('.jpg')) continue
    const id = f.slice(0, -'.jpg'.length)
    const src = path.join(IMAGE_DIR, f)
    let stat
    try {
      stat = await fs.stat(src)
    } catch {
      continue
    }
    if (validIds.has(id)) {
      remainingCount++
      remainingBytes += stat.size
      continue
    }
    const dest = path.join(ORPHAN_DIR, f)
    try {
      await fs.rename(src, dest)
      prunedCount++
      prunedBytes += stat.size
    } catch {
      // already there or rename across devices — try copy + unlink
      try {
        await fs.copyFile(src, dest)
        await fs.unlink(src)
        prunedCount++
        prunedBytes += stat.size
      } catch {
        // give up on this file; not destructive — leave it in place
      }
    }
  }

  return {
    pruned_count: prunedCount,
    pruned_size_bytes: prunedBytes,
    remaining_count: remainingCount,
    remaining_size_bytes: remainingBytes,
  }
}

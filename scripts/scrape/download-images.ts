import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cachedFetchBinary, REFRESH_MODE } from './fetch'
import type { KitWithMeta } from './types'

export type DownloadStats = {
  total: number
  downloaded: number
  skipped_cached: number
  failed: number
  failed_list: string[]
}

const IMAGE_DIR = path.resolve('public', 'images', 'kits')
const CONCURRENCY = 3

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function downloadOne(
  kit: KitWithMeta,
  originalUrl: string | undefined,
): Promise<{ ok: boolean; cached: boolean; err?: string }> {
  if (!originalUrl) return { ok: false, cached: false, err: 'no source URL' }

  const targetPath = path.join(IMAGE_DIR, `${kit.id}.jpg`)
  if (!REFRESH_MODE && (await fileExists(targetPath))) {
    kit.box_art_url = `/images/kits/${kit.id}.jpg`
    return { ok: true, cached: true }
  }

  try {
    await cachedFetchBinary(originalUrl, targetPath)
    kit.box_art_url = `/images/kits/${kit.id}.jpg`
    return { ok: true, cached: false }
  } catch (err) {
    kit.box_art_url = undefined
    return { ok: false, cached: false, err: (err as Error).message }
  }
}

export async function downloadImages(
  kits: KitWithMeta[],
  originalUrls: Map<string, string | undefined>,
  // map from kit.id (post-merge) → seriesNumberNormalized so we can look up the source URL
  idToSeries: Map<string, string>,
): Promise<DownloadStats> {
  await fs.mkdir(IMAGE_DIR, { recursive: true })
  const stats: DownloadStats = {
    total: kits.length,
    downloaded: 0,
    skipped_cached: 0,
    failed: 0,
    failed_list: [],
  }

  // Promise pool with bounded concurrency
  let cursor = 0
  const workers: Promise<void>[] = []
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(
      (async () => {
        while (true) {
          const idx = cursor++
          if (idx >= kits.length) return
          const kit = kits[idx]
          const series = idToSeries.get(kit.id)
          const url = series ? originalUrls.get(series) : undefined
          const result = await downloadOne(kit, url)
          if (result.ok) {
            if (result.cached) stats.skipped_cached++
            else stats.downloaded++
          } else {
            stats.failed++
            stats.failed_list.push(kit.id)
          }
        }
      })(),
    )
  }
  await Promise.all(workers)
  return stats
}

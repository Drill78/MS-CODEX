import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
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
const ARCHIVE_DIR = path.resolve('data', 'raw', 'box-art-original')
const CONCURRENCY = 4

const MAX_DIMENSION = 600
const WEBP_QUALITY = 80
const LQIP_DIMENSION = 20
const LQIP_QUALITY = 40

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function processBuffer(
  buffer: Buffer,
  webpPath: string,
): Promise<{ webpSize: number; lqip: string }> {
  await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath)
  const webpSize = (await fs.stat(webpPath)).size

  const lqipBuffer = await sharp(buffer)
    .resize(LQIP_DIMENSION, LQIP_DIMENSION, { fit: 'inside' })
    .webp({ quality: LQIP_QUALITY })
    .toBuffer()
  const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`

  return { webpSize, lqip }
}

async function regenerateLqipFromWebp(webpPath: string): Promise<string | null> {
  try {
    const buf = await fs.readFile(webpPath)
    const lqipBuffer = await sharp(buf)
      .resize(LQIP_DIMENSION, LQIP_DIMENSION, { fit: 'inside' })
      .webp({ quality: LQIP_QUALITY })
      .toBuffer()
    return `data:image/webp;base64,${lqipBuffer.toString('base64')}`
  } catch {
    return null
  }
}

async function downloadOne(
  kit: KitWithMeta,
  originalUrl: string | undefined,
): Promise<{ ok: boolean; cached: boolean; err?: string }> {
  if (!originalUrl) return { ok: false, cached: false, err: 'no source URL' }

  const archivePath = path.join(ARCHIVE_DIR, `${kit.id}.jpg`)
  const webpPath = path.join(IMAGE_DIR, `${kit.id}.webp`)
  const legacyJpgPath = path.join(IMAGE_DIR, `${kit.id}.jpg`)

  // 缓存命中：webp 已存在 → 仅补 lqip 即可
  if (!REFRESH_MODE && (await fileExists(webpPath))) {
    kit.box_art_url = `/images/kits/${kit.id}.webp`
    if (!kit.box_art_lqip) {
      const lqip = await regenerateLqipFromWebp(webpPath)
      if (lqip) kit.box_art_lqip = lqip
    }
    return { ok: true, cached: true }
  }

  try {
    // cachedFetchBinary 把原图写到归档目录（既是 archive 也是 fetch cache）
    const buffer = await cachedFetchBinary(originalUrl, archivePath)

    // 转成 webp + 生成 lqip
    const { lqip } = await processBuffer(buffer, webpPath)

    kit.box_art_url = `/images/kits/${kit.id}.webp`
    kit.box_art_lqip = lqip

    // 清理可能残留的旧 jpg（同 id 早期的产物）
    if (await fileExists(legacyJpgPath)) {
      try { await fs.unlink(legacyJpgPath) } catch { /* ignore */ }
    }
    return { ok: true, cached: false }
  } catch (err) {
    kit.box_art_url = undefined
    kit.box_art_lqip = undefined
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
  await fs.mkdir(ARCHIVE_DIR, { recursive: true })
  const stats: DownloadStats = {
    total: kits.length,
    downloaded: 0,
    skipped_cached: 0,
    failed: 0,
    failed_list: [],
  }

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

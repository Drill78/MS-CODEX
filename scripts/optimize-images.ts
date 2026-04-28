import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Kit } from '../lib/types/kit'

const PROJECT_ROOT = process.cwd()
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'kits')
const ORIGINAL_ARCHIVE_DIR = path.join(PROJECT_ROOT, 'data', 'raw', 'box-art-original')
const KITS_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'kits.json')
const REPORTS_DIR = path.join(PROJECT_ROOT, 'data', 'reports')

const MAX_DIMENSION = 600
const WEBP_QUALITY = 80
const LQIP_DIMENSION = 20
const LQIP_QUALITY = 40
const CONCURRENCY = 4

interface OptimizationResult {
  kitId: string
  originalPath: string
  originalSize: number
  webpPath: string
  webpSize: number
  lqip: string
  width: number
  height: number
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function optimizeOne(jpgPath: string, kitId: string): Promise<OptimizationResult | null> {
  const fileName = path.basename(jpgPath)
  const archivePath = path.join(ORIGINAL_ARCHIVE_DIR, fileName)
  const webpPath = path.join(PUBLIC_IMAGES_DIR, `${kitId}.webp`)

  try {
    const stat = await fs.stat(jpgPath)
    const originalSize = stat.size

    try {
      await fs.access(archivePath)
    } catch {
      await fs.copyFile(jpgPath, archivePath)
    }

    const buffer = await fs.readFile(jpgPath)
    const metadata = await sharp(buffer).metadata()
    const width = metadata.width ?? 0
    const height = metadata.height ?? 0

    await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath)

    const webpStat = await fs.stat(webpPath)
    const webpSize = webpStat.size

    const lqipBuffer = await sharp(buffer)
      .resize(LQIP_DIMENSION, LQIP_DIMENSION, { fit: 'inside' })
      .webp({ quality: LQIP_QUALITY })
      .toBuffer()
    const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`

    await fs.unlink(jpgPath)

    return {
      kitId,
      originalPath: jpgPath,
      originalSize,
      webpPath,
      webpSize,
      lqip,
      width,
      height,
    }
  } catch (err) {
    console.error(`[optimize-images] Failed for ${kitId}:`, err)
    return null
  }
}

async function runWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency = CONCURRENCY,
): Promise<R[]> {
  const results: R[] = []
  let cursor = 0
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx])
    }
  })
  await Promise.all(workers)
  return results
}

async function regenerateLqipFromExistingWebp(kitId: string): Promise<string | null> {
  const webpPath = path.join(PUBLIC_IMAGES_DIR, `${kitId}.webp`)
  try {
    const buffer = await fs.readFile(webpPath)
    const lqipBuffer = await sharp(buffer)
      .resize(LQIP_DIMENSION, LQIP_DIMENSION, { fit: 'inside' })
      .webp({ quality: LQIP_QUALITY })
      .toBuffer()
    return `data:image/webp;base64,${lqipBuffer.toString('base64')}`
  } catch {
    return null
  }
}

async function main() {
  console.log('[optimize-images] Start')
  await ensureDir(ORIGINAL_ARCHIVE_DIR)
  await ensureDir(PUBLIC_IMAGES_DIR)
  await ensureDir(REPORTS_DIR)

  const kitsRaw = await fs.readFile(KITS_JSON_PATH, 'utf-8')
  const kits: Kit[] = JSON.parse(kitsRaw)
  console.log(`[optimize-images] Loaded ${kits.length} kits from kits.json`)

  const allFiles = await fs.readdir(PUBLIC_IMAGES_DIR)
  const jpgs = allFiles.filter((f) => f.endsWith('.jpg'))
  const webps = allFiles.filter((f) => f.endsWith('.webp'))
  console.log(`[optimize-images] Found ${jpgs.length} jpg + ${webps.length} webp in target dir`)

  const pendingItems = jpgs.map((f) => ({
    fileName: f,
    fullPath: path.join(PUBLIC_IMAGES_DIR, f),
    kitId: f.replace(/\.jpg$/, ''),
  }))

  console.log(`[optimize-images] Optimizing ${pendingItems.length} images (concurrency=${CONCURRENCY})...`)
  const startedAt = Date.now()

  const results = await runWithConcurrency(
    pendingItems,
    async (item) => {
      const result = await optimizeOne(item.fullPath, item.kitId)
      if (result) {
        const ratio = ((1 - result.webpSize / result.originalSize) * 100).toFixed(1)
        process.stdout.write(`  ✓ ${item.kitId} (${ratio}% reduction)\n`)
      } else {
        process.stdout.write(`  ✗ ${item.kitId} FAILED\n`)
      }
      return { item, result }
    },
    CONCURRENCY,
  )

  const ok = results.filter((r) => r.result).map((r) => r.result!)
  const failed = results.filter((r) => !r.result).map((r) => r.item)

  let updatedCount = 0
  const lqipMap = new Map(ok.map((r) => [r.kitId, r]))
  for (const kit of kits) {
    const result = lqipMap.get(kit.id)
    if (result) {
      kit.box_art_url = `/images/kits/${kit.id}.webp`
      kit.box_art_lqip = result.lqip
      updatedCount++
    } else {
      const existingWebp = path.join(PUBLIC_IMAGES_DIR, `${kit.id}.webp`)
      try {
        await fs.access(existingWebp)
        let touched = false
        if (kit.box_art_url !== `/images/kits/${kit.id}.webp`) {
          kit.box_art_url = `/images/kits/${kit.id}.webp`
          touched = true
        }
        if (!kit.box_art_lqip) {
          const lqip = await regenerateLqipFromExistingWebp(kit.id)
          if (lqip) {
            kit.box_art_lqip = lqip
            touched = true
          }
        }
        if (touched) updatedCount++
      } catch {
        if (kit.box_art_url) {
          kit.box_art_url = undefined
          updatedCount++
        }
        if (kit.box_art_lqip) {
          kit.box_art_lqip = undefined
        }
      }
    }
  }

  await fs.writeFile(KITS_JSON_PATH, JSON.stringify(kits, null, 2), 'utf-8')

  const totalOriginalSize = ok.reduce((s, r) => s + r.originalSize, 0)
  const totalWebpSize = ok.reduce((s, r) => s + r.webpSize, 0)
  const totalLqipSize = ok.reduce((s, r) => s + r.lqip.length, 0)
  const safe = ok.length || 1

  const report = {
    ran_at: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    processed: ok.length,
    failed: failed.length,
    failed_list: failed.map((f) => f.kitId),
    size_before_mb: +(totalOriginalSize / 1024 / 1024).toFixed(2),
    size_after_mb: +(totalWebpSize / 1024 / 1024).toFixed(2),
    reduction_percent: +((1 - totalWebpSize / Math.max(totalOriginalSize, 1)) * 100).toFixed(1),
    avg_size_before_kb: +(totalOriginalSize / safe / 1024).toFixed(1),
    avg_size_after_kb: +(totalWebpSize / safe / 1024).toFixed(1),
    lqip_total_size_kb: +(totalLqipSize / 1024).toFixed(1),
    avg_lqip_size_bytes: Math.round(totalLqipSize / safe),
    kits_json_updated_count: updatedCount,
  }

  await fs.writeFile(
    path.join(REPORTS_DIR, 'last-image-optimization.json'),
    JSON.stringify(report, null, 2),
    'utf-8',
  )

  console.log('\n[optimize-images] Done')
  console.log(`  Processed: ${ok.length}`)
  console.log(`  Failed: ${failed.length}`)
  console.log(`  Size: ${report.size_before_mb}MB → ${report.size_after_mb}MB (-${report.reduction_percent}%)`)
  console.log(`  Avg: ${report.avg_size_before_kb}KB → ${report.avg_size_after_kb}KB`)
  console.log(`  LQIP total: ${report.lqip_total_size_kb}KB (avg ${report.avg_lqip_size_bytes}B/kit)`)
  console.log(`  Report: data/reports/last-image-optimization.json`)
}

main().catch((err) => {
  console.error('[optimize-images] FATAL', err)
  process.exit(1)
})

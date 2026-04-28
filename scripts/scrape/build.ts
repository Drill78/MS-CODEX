import { promises as fs } from 'node:fs'
import path from 'node:path'
import { applyOverrides } from './apply-overrides'
import { downloadImages } from './download-images'
import { fetchBiligame } from './fetch-biligame'
import { fetchFandom } from './fetch-fandom'
import { getOriginalImageUrls, mergeKits } from './merge-data'
import { parseBiligame } from './parse-biligame'
import { parseFandom } from './parse-fandom'
import type { KitWithMeta } from './types'
import { WORKS_SEED } from './works-mapping'

const REPORT_PATH = path.resolve('data', 'reports', 'last-build.json')
const KITS_PATH = path.resolve('data', 'kits.json')
const WORKS_PATH = path.resolve('data', 'works.json')
const OVERRIDES_PATH = path.resolve('data', 'manual-overrides.json')

async function ensureDirs(): Promise<void> {
  await fs.mkdir(path.resolve('data', 'raw', 'fandom'), { recursive: true })
  await fs.mkdir(path.resolve('data', 'raw', 'biligame'), { recursive: true })
  await fs.mkdir(path.resolve('data', 'reports'), { recursive: true })
  await fs.mkdir(path.resolve('public', 'images', 'kits'), { recursive: true })
}

async function ensureOverridesFile(): Promise<void> {
  try {
    await fs.access(OVERRIDES_PATH)
  } catch {
    await fs.writeFile(OVERRIDES_PATH, '{}\n', 'utf-8')
  }
}

async function main() {
  const t0 = Date.now()
  console.log('[scrape] starting…')
  await ensureDirs()
  await ensureOverridesFile()

  // Step 1: fetch sources (with on-disk cache)
  let fandomHtml = ''
  let biligameHtml = ''
  const sourceErrors: string[] = []

  try {
    console.log('[scrape] fetching Fandom Real_Grade…')
    fandomHtml = await fetchFandom()
  } catch (err) {
    sourceErrors.push(`fandom fetch: ${(err as Error).message}`)
  }
  try {
    console.log('[scrape] fetching B站 wiki RG模型…')
    biligameHtml = await fetchBiligame()
  } catch (err) {
    sourceErrors.push(`biligame fetch: ${(err as Error).message}`)
  }

  // Step 2: parse
  console.log('[scrape] parsing Fandom HTML…')
  const fandomParse = fandomHtml
    ? parseFandom(fandomHtml)
    : { records: [], errors: ['fandom html empty'] }
  console.log(`[scrape] fandom: ${fandomParse.records.length} records, ${fandomParse.errors.length} errors`)

  console.log('[scrape] parsing B站 HTML…')
  const biligameParse = biligameHtml
    ? parseBiligame(biligameHtml)
    : { records: [], errors: ['biligame html empty'] }
  console.log(
    `[scrape] biligame: ${biligameParse.records.length} records, ${biligameParse.errors.length} errors`,
  )

  // Step 3: merge
  const merged = mergeKits(fandomParse.records, biligameParse.records)
  console.log(
    `[scrape] merged: ${merged.kits.length} kits (zh matched ${merged.name_zh_matched} / missing ${merged.name_zh_missing})`,
  )

  // Step 4: download images
  const originalUrls = getOriginalImageUrls(fandomParse.records)
  // Build id → seriesNumberNormalized map (after dedupe etc.)
  const idToSeries = new Map<string, string>()
  // Walk parallel arrays — kits are produced in fandomRecords order
  fandomParse.records.forEach((rec, i) => {
    const kit = merged.kits[i]
    if (kit) idToSeries.set(kit.id, rec.series_number_normalized)
  })

  console.log('[scrape] downloading images…')
  const imageStats = await downloadImages(merged.kits, originalUrls, idToSeries)
  console.log(
    `[scrape] images: downloaded ${imageStats.downloaded}, cached ${imageStats.skipped_cached}, failed ${imageStats.failed}`,
  )

  // Step 5: apply manual overrides
  const overrideStats = await applyOverrides(merged.kits)
  if (overrideStats.applied > 0) {
    console.log(`[scrape] applied ${overrideStats.applied} manual overrides`)
  }

  // Step 6: write outputs
  await fs.writeFile(KITS_PATH, JSON.stringify(merged.kits, null, 2), 'utf-8')
  const works = Array.from(
    new Map(
      Object.values(WORKS_SEED).map((w) => [w.id, w] as const),
    ).values(),
  )
  await fs.writeFile(WORKS_PATH, JSON.stringify(works, null, 2), 'utf-8')

  const duration_ms = Date.now() - t0
  const withBoxArt = merged.kits.filter((k: KitWithMeta) => !!k.box_art_url).length
  const withNameZh = merged.kits.filter(
    (k: KitWithMeta) => !k._meta?.name_zh_missing,
  ).length

  const report = {
    built_at: new Date().toISOString(),
    duration_ms,
    refresh_mode: process.argv.includes('--refresh'),
    source: {
      fandom: {
        records: fandomParse.records.length,
        errors: fandomParse.errors.length,
      },
      biligame: {
        records: biligameParse.records.length,
        errors: biligameParse.errors.length,
      },
      fetch_errors: sourceErrors,
    },
    merge: {
      total_kits: merged.kits.length,
      name_zh_matched: merged.name_zh_matched,
      name_zh_missing: merged.name_zh_missing,
      with_name_zh: withNameZh,
      unmatched_biligame: merged.unmatched_biligame.length,
      unmatched_biligame_list: merged.unmatched_biligame.map(
        (b) => `${b.series_number_normalized}: ${b.raw_text}`,
      ),
    },
    works: {
      mapped: merged.kits.filter(
        (k: KitWithMeta) => (k.source_works ?? []).length > 0,
      ).length,
      unmapped_count: merged.unmapped_works.length,
      unmapped_list: merged.unmapped_works,
    },
    images: {
      total: imageStats.total,
      downloaded: imageStats.downloaded,
      skipped_cached: imageStats.skipped_cached,
      failed: imageStats.failed,
      failed_list: imageStats.failed_list,
      with_box_art: withBoxArt,
    },
    overrides: {
      applied: overrideStats.applied,
      missing_ids: overrideStats.missing_ids,
    },
    errors: {
      fandom_parse: fandomParse.errors,
      biligame_parse: biligameParse.errors,
    },
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`[scrape] done in ${duration_ms}ms — report: ${REPORT_PATH}`)
}

main().catch(async (err) => {
  console.error('[scrape] FATAL', err)
  // Try to write a minimal report so subsequent runs have a trail
  try {
    await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true })
    await fs.writeFile(
      REPORT_PATH,
      JSON.stringify(
        {
          built_at: new Date().toISOString(),
          fatal: (err as Error).message,
          stack: (err as Error).stack,
        },
        null,
        2,
      ),
      'utf-8',
    )
  } catch {
    /* ignore */
  }
  process.exitCode = 1
})

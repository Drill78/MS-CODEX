import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Grade, Kit } from '@/lib/types/kit'
import type { Work } from '@/lib/types/work'
import { GRADES } from '@/lib/constants/grades'
import { applyOverrides } from './apply-overrides'
import { downloadImages } from './download-images'
import { fetchBiligameGrade } from './fetch-biligame'
import { fetchFandomGrade } from './fetch-fandom'
import { getOriginalImageUrls, mergeKits } from './merge-data'
import { parseBiligame } from './parse-biligame'
import { parseFandom } from './parse-fandom'
import { sanityCheck } from './sanity-check'
import { FANDOM_SOURCES } from './sources'
import type { FandomKitRecord } from './types'
import { WORKS_SEED } from './works-mapping'

const REPORT_PATH = path.resolve('data', 'reports', 'last-build.json')
const KITS_PATH = path.resolve('data', 'kits.json')
const WORKS_PATH = path.resolve('data', 'works.json')
const OVERRIDES_PATH = path.resolve('data', 'manual-overrides.json')

type GradeStat = {
  fetched_pages: number
  fandom_records: number
  biligame_records: number
  merged_kits: number
  images_downloaded: number
  images_skipped_cached: number
  images_failed: number
  sub_grades: Record<string, number>
  errors: string[]
}

function emptyGradeStat(): GradeStat {
  return {
    fetched_pages: 0,
    fandom_records: 0,
    biligame_records: 0,
    merged_kits: 0,
    images_downloaded: 0,
    images_skipped_cached: 0,
    images_failed: 0,
    sub_grades: {},
    errors: [],
  }
}

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

function parseArgs(): { refresh: boolean; onlyGrade?: Grade } {
  const args = process.argv.slice(2)
  const refresh = args.includes('--refresh')
  const gradeArg = args.find((a) => a.startsWith('--grade='))
  let onlyGrade: Grade | undefined
  if (gradeArg) {
    const v = gradeArg.split('=')[1]
    if (v && GRADES.includes(v as Grade)) onlyGrade = v as Grade
    else throw new Error(`--grade='${v}' is not a known grade`)
  }
  return { refresh, onlyGrade }
}

async function processGrade(
  grade: Grade,
): Promise<{
  kits: Kit[]
  fandomRecords: FandomKitRecord[]
  unmappedWorks: string[]
  unmatchedBiligame: number
  stat: GradeStat
}> {
  const stat = emptyGradeStat()
  const allFandomRecords: FandomKitRecord[] = []

  // ── Fetch + parse Fandom（HG 多页）
  const fandomFetch = await fetchFandomGrade(grade)
  stat.errors.push(...fandomFetch.errors)
  stat.fetched_pages = fandomFetch.results.length

  for (const f of fandomFetch.results) {
    try {
      const parsed = parseFandom(f.html, grade, { sourceGradePage: f.sourceUrl })
      stat.fandom_records += parsed.records.length
      stat.errors.push(...parsed.errors.map((e) => `[${f.source.cacheSlug}] ${e}`))
      allFandomRecords.push(...parsed.records)
    } catch (err) {
      stat.errors.push(
        `[${f.source.cacheSlug}] parse fatal: ${(err as Error).message}`,
      )
    }
  }

  // 同 grade 多页可能产出同 series_number_normalized 的重复。
  // 用 (source_grade_page + section_heading + series_number_normalized) 做唯一键，
  // 否则会吞掉：(a) 不同 fandom 子页同序号 / (b) 同页不同 H2 section 同序号（PG vs PG Unleashed）
  const dedup = new Map<string, FandomKitRecord>()
  for (const r of allFandomRecords) {
    const k = `${r.source_grade_page ?? ''}::${r.section_heading ?? ''}::${r.series_number_normalized}`
    if (!dedup.has(k)) dedup.set(k, r)
  }
  const fandomRecords = Array.from(dedup.values())

  // 补回真正的全局序号（同一 grade 跨子线 / 跨 section 时保证不撞 id）：
  // 对相同 normalized 出现 >1 次的，往后缀加 -<sub-slug>，sub-slug 取 fandom 子页 slug + section
  const counts = new Map<string, number>()
  for (const r of fandomRecords) {
    counts.set(r.series_number_normalized, (counts.get(r.series_number_normalized) ?? 0) + 1)
  }
  if ([...counts.values()].some((n) => n > 1)) {
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12)
    for (const r of fandomRecords) {
      if ((counts.get(r.series_number_normalized) ?? 0) > 1) {
        const pageSlug = slugify((r.source_grade_page ?? '').split('/').pop() ?? '')
        const sectionSlug = slugify(r.section_heading ?? '')
        const sub = [pageSlug, sectionSlug].filter(Boolean).join('-') || 'x'
        r.series_number_normalized = `${r.series_number_normalized}-${sub}`
      }
    }
  }

  // ── Fetch + parse Biligame（单页）
  const biligameFetch = await fetchBiligameGrade(grade)
  if (biligameFetch.error) stat.errors.push(biligameFetch.error)
  let biligameParse: { records: ReturnType<typeof parseBiligame>['records']; errors: string[] } = {
    records: [],
    errors: [],
  }
  if (biligameFetch.result) {
    try {
      biligameParse = parseBiligame(biligameFetch.result.html, grade)
      stat.biligame_records = biligameParse.records.length
      stat.errors.push(...biligameParse.errors)
    } catch (err) {
      stat.errors.push(`biligame parse fatal: ${(err as Error).message}`)
    }
  }

  // ── Merge
  const fallbackUrl = FANDOM_SOURCES[grade][0]?.url ?? 'https://gundam.fandom.com'
  const merged = mergeKits(
    fandomRecords,
    biligameParse.records,
    grade,
    fallbackUrl,
  )
  stat.merged_kits = merged.kits.length

  // 统计 sub-grade
  for (const k of merged.kits) {
    stat.sub_grades[k.grade] = (stat.sub_grades[k.grade] ?? 0) + 1
  }

  // ── Images
  const originalUrls = getOriginalImageUrls(fandomRecords)
  const idToSeries = new Map<string, string>()
  fandomRecords.forEach((rec, i) => {
    const kit = merged.kits[i]
    if (kit) idToSeries.set(kit.id, rec.series_number_normalized)
  })
  const imageStats = await downloadImages(merged.kits, originalUrls, idToSeries)
  stat.images_downloaded = imageStats.downloaded
  stat.images_skipped_cached = imageStats.skipped_cached
  stat.images_failed = imageStats.failed
  if (imageStats.failed_list.length) {
    stat.errors.push(`image fail: ${imageStats.failed_list.join(', ')}`)
  }

  return {
    kits: merged.kits,
    fandomRecords,
    unmappedWorks: merged.unmapped_works,
    unmatchedBiligame: merged.unmatched_biligame.length,
    stat,
  }
}

async function main() {
  const t0 = Date.now()
  const { refresh, onlyGrade } = parseArgs()
  console.log(
    `[scrape] starting${refresh ? ' (refresh)' : ''}${onlyGrade ? ` grade=${onlyGrade}` : ''}…`,
  )

  await ensureDirs()
  await ensureOverridesFile()

  const targetGrades: Grade[] = onlyGrade ? [onlyGrade] : GRADES
  const allKits: Kit[] = []
  const perGrade: Record<string, GradeStat> = {}
  const allUnmappedWorks = new Set<string>()
  let totalUnmatchedBiligame = 0

  for (const grade of targetGrades) {
    const fandomCount = FANDOM_SOURCES[grade].length
    if (fandomCount === 0) {
      // sub-grade 不独立爬，跳过；统计也不记
      console.log(`[scrape] skip ${grade} (sub-grade — derived from parent)`)
      continue
    }
    console.log(`[scrape] === ${grade} === (${fandomCount} fandom page${fandomCount > 1 ? 's' : ''})`)
    try {
      const r = await processGrade(grade)
      perGrade[grade] = r.stat
      allKits.push(...r.kits)
      r.unmappedWorks.forEach((w) => allUnmappedWorks.add(w))
      totalUnmatchedBiligame += r.unmatchedBiligame
      console.log(
        `[scrape] ${grade} → ${r.stat.merged_kits} kits, ` +
          `images +${r.stat.images_downloaded}/cache ${r.stat.images_skipped_cached}/fail ${r.stat.images_failed}, ` +
          `errors ${r.stat.errors.length}`,
      )
    } catch (err) {
      const stat = emptyGradeStat()
      stat.errors.push(`grade fatal: ${(err as Error).message}`)
      perGrade[grade] = stat
      console.error(`[scrape] ${grade} FATAL: ${(err as Error).message}`)
    }
  }

  // ── apply overrides on the FULL list once
  const overrideStats = await applyOverrides(allKits)
  if (overrideStats.applied > 0) {
    console.log(`[scrape] applied ${overrideStats.applied} manual overrides`)
  }

  // ── persist works.json (always full set, dedup by id)
  const works: Work[] = Array.from(
    new Map(Object.values(WORKS_SEED).map((w) => [w.id, w] as const)).values(),
  )

  // ── persist kits.json: when running --grade=xxx, MERGE into existing file rather than overwriting
  let mergedAll: Kit[] = allKits
  if (onlyGrade) {
    try {
      const existing = JSON.parse(await fs.readFile(KITS_PATH, 'utf-8')) as Kit[]
      const newIds = new Set(allKits.map((k) => k.id))
      const survivingOldGrades = existing.filter((k) => k.grade !== onlyGrade && !newIds.has(k.id))
      mergedAll = [...survivingOldGrades, ...allKits]
    } catch {
      mergedAll = allKits
    }
  }

  await fs.writeFile(KITS_PATH, JSON.stringify(mergedAll, null, 2), 'utf-8')
  await fs.writeFile(WORKS_PATH, JSON.stringify(works, null, 2), 'utf-8')

  // ── sanity check
  const sanity = sanityCheck(mergedAll, works)

  const totals = {
    kits: mergedAll.length,
    with_name_zh: mergedAll.filter((k) => !k._meta?.name_zh_missing).length,
    with_box_art: mergedAll.filter((k) => !!k.box_art_url).length,
    with_mapped_work: mergedAll.filter((k) => (k.source_works ?? []).length > 0).length,
  }

  const duration_ms = Date.now() - t0

  const report = {
    built_at: new Date().toISOString(),
    duration_ms,
    refresh_mode: refresh,
    only_grade: onlyGrade ?? null,
    grades: perGrade,
    totals,
    works: {
      mapped: totals.with_mapped_work,
      unmapped_count: allUnmappedWorks.size,
      unmapped_list: Array.from(allUnmappedWorks).sort(),
    },
    overrides: {
      applied: overrideStats.applied,
      missing_ids: overrideStats.missing_ids,
    },
    sanity_check: sanity,
    fetch_errors: Object.entries(perGrade)
      .flatMap(([g, s]) => s.errors.map((e) => ({ grade: g, error: e })))
      .filter((e) => /fetch|HTTP|network|timeout|ECONN/i.test(e.error)),
    biligame_unmatched_total: totalUnmatchedBiligame,
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`[scrape] done in ${duration_ms}ms — kits=${totals.kits} — report: ${REPORT_PATH}`)

  if (!sanity.passed) {
    console.error(`[scrape] sanity check FAILED with ${sanity.errors.length} error(s):`)
    for (const e of sanity.errors.slice(0, 20)) console.error(`  ${e}`)
    process.exitCode = 1
  } else if (sanity.warnings.length) {
    console.warn(`[scrape] sanity check warnings: ${sanity.warnings.length}`)
  }
}

main().catch(async (err) => {
  console.error('[scrape] FATAL', err)
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

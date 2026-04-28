import type { Work } from '@/lib/types/work'
import {
  COLOR_SEPARATION_DEFAULTS,
  DECALS_DEFAULTS,
  DIFFICULTY_DEFAULTS,
} from './defaults'
import { FANDOM_SOURCE_URL } from './fetch-fandom'
import type {
  BiligameKitRecord,
  FandomKitRecord,
  KitWithMeta,
  MergeResult,
} from './types'
import { lookupWork } from './works-mapping'

const MS_CODE_REGEX_NAME = /\b([A-Z]{1,5}[A-Z0-9-]*-?[A-Z0-9]+)\b/
const VARIANT_HINTS: Array<{ test: RegExp; suffix: string }> = [
  { test: /ver\.?\s*ka/i, suffix: '-ver-ka' },
  { test: /ver\.?\s*2\.0/i, suffix: '-ver-2-0' },
  { test: /ver\.?\s*1\.5/i, suffix: '-ver-1-5' },
  { test: /clear\s*color|cl\.?\s*color/i, suffix: '-clear-color' },
  { test: /titanium\s*finish/i, suffix: '-titanium-finish' },
  { test: /real\s*type/i, suffix: '-real-type' },
  { test: /metallic/i, suffix: '-metallic' },
]

function extractMsCodeFromName(name: string): string | undefined {
  if (!name) return undefined
  // Trim parenthetical suffixes like "(Ver. 2.0)"
  const stripped = name.replace(/\([^)]*\)/g, '').trim()
  // Look for first uppercase token that contains a digit or hyphen
  const tokens = stripped.split(/\s+/)
  for (const t of tokens) {
    if (/^[A-Z][A-Z0-9\-/]*$/.test(t) && /\d/.test(t)) {
      return t.replace(/[/]+/g, '-')
    }
  }
  const m = stripped.match(MS_CODE_REGEX_NAME)
  return m ? m[1] : undefined
}

function variantSuffix(name: string): string {
  for (const { test, suffix } of VARIANT_HINTS) {
    if (test.test(name)) return suffix
  }
  return ''
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateKitId(
  grade: string,
  msCode: string | undefined,
  name: string,
  variantHint: string,
): string {
  const codePart = msCode
    ? slugify(msCode)
    : slugify(name).slice(0, 40) || 'unknown'
  const base = `${grade.toLowerCase()}-${codePart}${variantHint}`
  return base
}

export function mergeKits(
  fandomRecords: FandomKitRecord[],
  biligameRecords: BiligameKitRecord[],
): MergeResult {
  const biligameMap = new Map<string, BiligameKitRecord>()
  for (const b of biligameRecords) {
    biligameMap.set(b.series_number_normalized, b)
  }

  const usedIds = new Set<string>()
  const kits: KitWithMeta[] = []
  const unmappedWorks = new Set<string>()
  let nameZhMatched = 0
  let nameZhMissing = 0

  for (const fandom of fandomRecords) {
    const bili = biligameMap.get(fandom.series_number_normalized)
    const name_zh = bili?.name_zh || fandom.name_en
    const name_zh_missing = !bili?.name_zh
    if (name_zh_missing) nameZhMissing++
    else nameZhMatched++

    const ms_code = bili?.ms_code ?? extractMsCodeFromName(fandom.name_en)

    const work: Work | undefined = lookupWork(fandom.source_work_raw)
    if (!work && fandom.source_work_raw) {
      unmappedWorks.add(fandom.source_work_raw)
    }

    const variant = variantSuffix(fandom.name_en)
    let id = generateKitId('rg', ms_code, fandom.name_en, variant)
    let n = 2
    while (usedIds.has(id)) {
      id = `${generateKitId('rg', ms_code, fandom.name_en, variant)}-${n}`
      n++
    }
    usedIds.add(id)

    const kit: KitWithMeta = {
      id,
      grade: 'RG',
      series_number: fandom.series_number,
      name_zh,
      name_jp: fandom.name_jp ?? '',
      name_en: fandom.name_en,
      ms_code,
      scale: fandom.scale || '1/144',
      price_jpy: fandom.price_jpy || 0,
      release_date: fandom.release_date || '',
      source_works: work ? [work] : [],
      difficulty_build: DIFFICULTY_DEFAULTS.RG.build,
      difficulty_paint: DIFFICULTY_DEFAULTS.RG.paint,
      color_separation: COLOR_SEPARATION_DEFAULTS.RG,
      decals: DECALS_DEFAULTS.RG,
      is_p_bandai: fandom.is_p_bandai,
      box_art_url: undefined,
      source_url: fandom.detail_page_url ?? FANDOM_SOURCE_URL,
      _meta: {
        name_zh_missing,
        work_unmapped: !work,
        manual_review: true,
        source_work_raw: fandom.source_work_raw,
      },
    }

    kits.push(kit)
  }

  // unmatched biligame
  const fandomKeys = new Set(
    fandomRecords.map((r) => r.series_number_normalized),
  )
  const unmatched_biligame = biligameRecords.filter(
    (b) => !fandomKeys.has(b.series_number_normalized),
  )

  return {
    kits,
    unmatched_biligame,
    unmapped_works: Array.from(unmappedWorks),
    name_zh_matched: nameZhMatched,
    name_zh_missing: nameZhMissing,
  }
}

// expose a helper so build.ts can re-attach the original Fandom URL for image fetch
export function getOriginalImageUrls(
  fandomRecords: FandomKitRecord[],
): Map<string, string | undefined> {
  const m = new Map<string, string | undefined>()
  for (const r of fandomRecords) {
    m.set(r.series_number_normalized, r.box_art_url)
  }
  return m
}

import type { Grade, Kit } from '@/lib/types/kit'
import type { Work } from '@/lib/types/work'
import {
  COLOR_SEPARATION_DEFAULTS,
  DECALS_DEFAULTS,
  DIFFICULTY_DEFAULTS,
} from './defaults'
import type {
  BiligameKitRecord,
  FandomKitRecord,
  KitWithMeta,
  MergeResult,
} from './types'
import { lookupWork } from './works-mapping'

const MS_CODE_REGEX_NAME = /\b([A-Z]{1,5}[A-Z0-9-]*-?[A-Z0-9]+)\b/

const VARIANT_HINTS: Array<{ test: RegExp; suffix: string; tag: string }> = [
  { test: /ver\.?\s*ka/i,                 suffix: '-ver-ka',          tag: 'ver-ka' },
  { test: /ver\.?\s*2\.0/i,               suffix: '-ver-2-0',         tag: 'ver-2-0' },
  { test: /ver\.?\s*1\.5/i,               suffix: '-ver-1-5',         tag: 'ver-1-5' },
  { test: /ver\.?\s*3\.0/i,               suffix: '-ver-3-0',         tag: 'ver-3-0' },
  { test: /clear\s*color|cl\.?\s*color/i, suffix: '-clear-color',     tag: 'clear-color' },
  { test: /titanium\s*finish/i,           suffix: '-titanium-finish', tag: 'titanium-finish' },
  { test: /real\s*type/i,                 suffix: '-real-type',       tag: 'real-type' },
  { test: /metallic/i,                    suffix: '-metallic',        tag: 'metallic' },
  { test: /unleashed/i,                   suffix: '-unleashed',       tag: 'unleashed' },
  { test: /\bmgex\b/i,                    suffix: '-mgex',            tag: 'mgex' },
]

function extractMsCodeFromName(name: string): string | undefined {
  if (!name) return undefined
  const stripped = name.replace(/\([^)]*\)/g, '').trim()
  const tokens = stripped.split(/\s+/)
  for (const t of tokens) {
    if (/^[A-Z][A-Z0-9\-/]*$/.test(t) && /\d/.test(t)) {
      return t.replace(/[/]+/g, '-')
    }
  }
  const m = stripped.match(MS_CODE_REGEX_NAME)
  return m ? m[1] : undefined
}

function detectVariants(name: string): { suffix: string; tags: string[] } {
  const tags: string[] = []
  let suffix = ''
  for (const { test, suffix: s, tag } of VARIANT_HINTS) {
    if (test.test(name)) {
      tags.push(tag)
      if (!suffix) suffix = s
    }
  }
  return { suffix, tags }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 决定一条 fandom 记录在 (parent grade) 上下文里的"实际 grade"
// 规则：
//   parent=MG + name 含 "Ver. Ka" → 'MG-VerKa'（不论是否同时含 MGEX）
//   parent=PG + name 含 "Unleashed" → 'PG-Unleashed'
//   parent=SDCS / 其他 → 不变
// 注意：fandom 表里的 <a title> 会剥掉 "Ver.Ka" 等变体后缀，所以用
// name_full_text（可见单元格文本）做检测，比 name_en 可靠。
function resolveEffectiveGrade(parentGrade: Grade, ...names: (string | undefined)[]): Grade {
  const blob = names.filter(Boolean).join(' ')
  if (parentGrade === 'MG' && /ver\.?\s*ka/i.test(blob)) return 'MG-VerKa'
  if (parentGrade === 'PG' && /unleashed/i.test(blob)) return 'PG-Unleashed'
  return parentGrade
}

function generateKitId(
  grade: Grade,
  msCode: string | undefined,
  name: string,
  variantHint: string,
): string {
  const codePart = msCode
    ? slugify(msCode)
    : slugify(name).slice(0, 40) || 'unknown'
  return `${grade.toLowerCase()}-${codePart}${variantHint}`
}

export function mergeKits(
  fandomRecords: FandomKitRecord[],
  biligameRecords: BiligameKitRecord[],
  parentGrade: Grade,
  fandomSourceUrlFallback: string,
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

    const effectiveGrade = resolveEffectiveGrade(
      parentGrade,
      fandom.name_en,
      fandom.name_full_text,
      fandom.section_heading,
    )
    const { suffix: variantSuffix, tags: variantTags } = detectVariants(
      [fandom.name_en, fandom.name_full_text, fandom.section_heading].filter(Boolean).join(' '),
    )

    let id = generateKitId(effectiveGrade, ms_code, fandom.name_en, variantSuffix)
    let n = 2
    while (usedIds.has(id)) {
      id = `${generateKitId(effectiveGrade, ms_code, fandom.name_en, variantSuffix)}-${n}`
      n++
    }
    usedIds.add(id)

    const kit: Kit = {
      id,
      grade: effectiveGrade,
      series_number: fandom.series_number,
      name_zh,
      name_jp: fandom.name_jp ?? '',
      name_en: fandom.name_en,
      ms_code,
      scale: fandom.scale || '1/144',
      price_jpy: fandom.price_jpy || 0,
      release_date: fandom.release_date || '',
      source_works: work ? [work] : [],
      difficulty_build: DIFFICULTY_DEFAULTS[effectiveGrade].build,
      difficulty_paint: DIFFICULTY_DEFAULTS[effectiveGrade].paint,
      color_separation: COLOR_SEPARATION_DEFAULTS[effectiveGrade],
      decals: DECALS_DEFAULTS[effectiveGrade],
      is_p_bandai: fandom.is_p_bandai,
      box_art_url: undefined,
      source_url: fandom.detail_page_url ?? fandomSourceUrlFallback,
      _meta: {
        name_zh_missing,
        work_unmapped: !work,
        manual_review: true,
        source_work_raw: fandom.source_work_raw,
        source_grade_page: fandom.source_grade_page,
        variants: variantTags.length ? variantTags : undefined,
      },
    }

    kits.push(kit)
  }

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

export function getOriginalImageUrls(
  fandomRecords: FandomKitRecord[],
): Map<string, string | undefined> {
  const m = new Map<string, string | undefined>()
  for (const r of fandomRecords) {
    m.set(r.series_number_normalized, r.box_art_url)
  }
  return m
}

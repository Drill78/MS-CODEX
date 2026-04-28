import type { Grade } from '@/lib/types/kit'

// ─────────────────────────────────────────────────────────────────
// Fandom — 多个 URL 表示该 grade 在 fandom 上分散在多个子页面
// ─────────────────────────────────────────────────────────────────

export type FandomSource = {
  url: string                // 最终落到 ?action=parse 的页面 URL
  pageTitle: string          // MediaWiki page title (用于 API)
  cacheSlug: string          // 缓存文件名 slug（无 .html 后缀）
}

function fandom(pageTitle: string, cacheSlug: string): FandomSource {
  return {
    url: `https://gundam.fandom.com/wiki/${pageTitle}`,
    pageTitle,
    cacheSlug,
  }
}

const HG_FANDOM_SUBS: FandomSource[] = [
  fandom('High_Grade_Universal_Century', 'hg-uc'),
  fandom('High_Grade_Cosmic_Era', 'hg-ce'),
  fandom('High_Grade_After_Colony', 'hg-ac'),
  fandom('High_Grade_After_War', 'hg-aw'),
  fandom('High_Grade_Future_Century', 'hg-fc'),
  fandom('High_Grade_Anno_Domini', 'hg-ad'),
  fandom('High_Grade_Advanced_Generation', 'hg-ag'),
  fandom('High_Grade_Reconguista_in_G', 'hg-rg'),
  fandom('High_Grade_Iron-Blooded_Orphans', 'hg-ibo'),
  fandom('High_Grade_The_Witch_from_Mercury', 'hg-twfm'),
  fandom('High_Grade_Gundam_Build_Fighters', 'hg-bf'),
  fandom('High_Grade_Gundam_Build_Divers', 'hg-bd'),
  fandom('High_Grade_Gundam_Build_Metaverse', 'hg-bm'),
  fandom('High_Grade_GunPla_Evolution', 'hg-ge'),
]

export const FANDOM_SOURCES: Record<Grade, FandomSource[]> = {
  HG: HG_FANDOM_SUBS,
  RG: [fandom('Real_Grade', 'rg')],
  MG: [fandom('Master_Grade', 'mg')],
  'MG-VerKa': [],   // 通过 MG 解析时识别 'Ver. Ka' 标记，不单独爬
  PG: [fandom('Perfect_Grade', 'pg')],
  'PG-Unleashed': [], // 通过 PG 识别
  EG: [fandom('Entry_Grade', 'eg')],
  SD: [fandom('SD_Gundam', 'sd')],
  SDCS: [fandom('SD_Gundam_Cross_Silhouette', 'sdcs')],
  RE100: [fandom('Reborn-One_Hundred', 're100')],
  FM: [fandom('Full_Mechanics', 'fm')],
}

// ─────────────────────────────────────────────────────────────────
// 哔哩哔哩 wiki — 一条规格线一个汇总页（部分 grade 无独立页 → null）
// ─────────────────────────────────────────────────────────────────

export type BiligameSource = {
  url: string
  cacheSlug: string
}

function bili(pageName: string, cacheSlug: string): BiligameSource {
  return {
    url: encodeURI(`https://wiki.biligame.com/gundam/${pageName}`),
    cacheSlug,
  }
}

export const BILIGAME_SOURCES: Partial<Record<Grade, BiligameSource>> = {
  HG: bili('HG模型', 'hg'),
  RG: bili('RG模型', 'rg'),
  MG: bili('MG模型', 'mg'),
  PG: bili('PG模型', 'pg'),
  EG: bili('EG模型', 'eg'),
  SD: bili('SD模型', 'sd'),
  RE100: bili('RE模型', 're100'),
  FM: bili('FM模型', 'fm'),
}

// ─────────────────────────────────────────────────────────────────
// 序号前缀 — 给 parse-biligame 过滤用
// 对于一条 grade，B站列表里有效的"NN"前缀正则，例如：
//   RG  → /^\s*RG\s*0*(\d{1,3})\s*$/
//   HG  → /^\s*(?:HG|HGUC|HGCE|HGAC|HGAW|HGFC|HGOO|HGAG|HGIBO|HGTWFM|HGBF|HGBD|HGBM|HGGE|HGRG)\s*0*(\d{1,3})\s*$/
// ─────────────────────────────────────────────────────────────────

const HG_BILIGAME_PREFIXES = [
  'HGUC', 'HGCE', 'HGAC', 'HGAW', 'HGFC', 'HGOO', 'HGAG', 'HGIBO',
  'HGTWFM', 'HGWFM', 'HGBF', 'HGBD', 'HGBM', 'HGGE', 'HGRG', 'HG',
]
const SD_BILIGAME_PREFIXES = ['SDCS', 'SDBB', 'SDEX', 'SDGCG', 'SD', 'BB']

function buildPrefixRegex(prefixes: string[]): RegExp {
  // 按长度倒序避免短前缀（"HG"）抢占长前缀（"HGUC"）
  const sorted = [...prefixes].sort((a, b) => b.length - a.length)
  const alt = sorted.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  return new RegExp(`^\\s*(?:${alt})\\s*0*(\\d{1,3})\\s*$`, 'i')
}

export const BILIGAME_NUMBER_REGEX: Record<Grade, RegExp> = {
  HG: buildPrefixRegex(HG_BILIGAME_PREFIXES),
  RG: buildPrefixRegex(['RG']),
  MG: buildPrefixRegex(['MG']),
  'MG-VerKa': buildPrefixRegex(['MG']),
  PG: buildPrefixRegex(['PG']),
  'PG-Unleashed': buildPrefixRegex(['PG']),
  EG: buildPrefixRegex(['EG']),
  SD: buildPrefixRegex(SD_BILIGAME_PREFIXES),
  SDCS: buildPrefixRegex(['SDCS']),
  RE100: buildPrefixRegex(['RE']),
  FM: buildPrefixRegex(['FM']),
}

// 用于 parse-fandom 校验 / 归一化序号，例：HG → "HG"，SDCS → "SDCS"
export const GRADE_SERIES_PREFIX: Record<Grade, string> = {
  HG: 'HG',
  RG: 'RG',
  MG: 'MG',
  'MG-VerKa': 'MG',
  PG: 'PG',
  'PG-Unleashed': 'PG',
  EG: 'EG',
  SD: 'SD',
  SDCS: 'SDCS',
  RE100: 'RE',
  FM: 'FM',
}

// 从 grade 反推 fandom / biligame 缓存路径
export function fandomCachePath(slug: string): string {
  // path.resolve 在调用方做，这里只给文件名
  return `${slug}.html`
}
export function fandomApiCachePath(slug: string): string {
  return `${slug}.api.json`
}
export function biligameCachePath(slug: string): string {
  return `${slug}.html`
}

import type { Grade } from '@/lib/types/kit'

// ─────────────────────────────────────────────────────────────────
// Fandom — 多个 URL 表示该 grade 在 fandom 上分散在多个子页面
// 同一 sub-line 也允许多个 URL 候选，按顺序 try，第一个非空的就用
// ─────────────────────────────────────────────────────────────────

export type FandomSource = {
  pageTitleCandidates: string[]   // MediaWiki page title 的候选列表
  cacheSlug: string               // 缓存文件名 slug
  // 给报告用：第一个候选的 wiki URL（fetch 时实际用的可能是后续候选）
  defaultUrl: string
}

function fandom(cacheSlug: string, ...pageTitles: string[]): FandomSource {
  return {
    pageTitleCandidates: pageTitles,
    cacheSlug,
    defaultUrl: `https://gundam.fandom.com/wiki/${pageTitles[0]}`,
  }
}

// HG: Fandom 命名混乱不一致，每条 sub-line 给所有可能候选
// 注：HGUC 用全名 — "HGUC" 短名是个 redirect stub (1.1KB)。
//     BF / BD 用无 "Gundam_" 版（核实可访问，~85-200KB）；BM 用带 "Gundam_" 版。
const HG_FANDOM_SUBS: FandomSource[] = [
  fandom('hg-uc',   'High_Grade_Universal_Century'),
  fandom('hg-ce',   'High_Grade_Cosmic_Era',        'HGCE',  '1/144_HG_Gundam_SEED'),
  fandom('hg-ac',   'High_Grade_After_Colony',      'HGAC',  '1/144_HG_Gundam_Wing'),
  fandom('hg-aw',   'High_Grade_After_War',         'HGAW'),
  fandom('hg-fc',   'High_Grade_Future_Century',    'HGFC',  '1/144_HG_G_Gundam'),
  fandom('hg-00',   'High_Grade_00',                'HG00',  '1/144_HG_Gundam_00'),
  fandom('hg-age',  'High_Grade_AGE',               'HGAGE'),
  fandom('hg-rc',   'High_Grade_Reconguista_in_G',  'HGRC'),
  fandom('hg-ibo',  'High_Grade_Iron-Blooded_Orphans', 'HGIBO'),
  fandom('hg-twfm', 'High_Grade_The_Witch_from_Mercury', 'HGTWFM', 'HG_The_Witch_from_Mercury'),
  fandom('hg-bf',   'High_Grade_Build_Fighters', 'High_Grade_Gundam_Build_Fighters', 'HGBF'),
  fandom('hg-bd',   'High_Grade_Build_Divers',   'High_Grade_Gundam_Build_Divers',   'HGBD'),
  fandom('hg-bm',   'High_Grade_Gundam_Build_Metaverse', 'High_Grade_Build_Metaverse', 'HGBM'),
  fandom('hg-ge',   'High_Grade_Gunpla_Evolution', 'High_Grade_GunPla_Evolution', 'HGGE'),
]

export const FANDOM_SOURCES: Record<Grade, FandomSource[]> = {
  HG: HG_FANDOM_SUBS,
  RG: [fandom('rg', 'Real_Grade')],
  MG: [fandom('mg', 'Master_Grade')],
  'MG-VerKa': [],   // 通过 MG 解析时识别 'Ver. Ka' 标记，不单独爬
  PG: [fandom('pg', 'Perfect_Grade')],
  'PG-Unleashed': [], // 通过 PG 识别
  EG: [fandom('eg', 'Entry_Grade')],
  SD: [fandom('sd', 'SD_Gundam_BB_Senshi', 'Super_Deformed_Gundam', 'SDBB', 'SD_Gundam')],
  SDCS: [fandom('sdcs', 'SD_Gundam_Cross_Silhouette')],
  RE100: [fandom('re100', 'Reborn-One_Hundred')],
  FM: [fandom('fm', 'Full_Mechanics')],
}

// ─────────────────────────────────────────────────────────────────
// 哔哩哔哩 wiki — 改用 MediaWiki API 抓 wikitext。
// 每个 grade 给多个候选页面名，按顺序 try。
// ─────────────────────────────────────────────────────────────────

export type BiligameSource = {
  pageNameCandidates: string[]
  cacheSlug: string
  // biligame 模板里使用的 series 前缀（"RG"/"MG"/"PG"/"H"/"EG"）。
  // 这个前缀短/长不同决定 series-number 解析正则
  seriesPrefix: string
  // 该 grade 的 biligame series → 我们自己的 GRADE_SERIES_PREFIX 的转换
  // 例如 biligame "H01" → 我们存为 "HG001"。null 表示直接用 biligame prefix。
  outputPrefix: string
}

export const BILIGAME_SOURCES: Partial<Record<Grade, BiligameSource>> = {
  HG: {
    pageNameCandidates: ['HGUC模型', 'HG模型'],
    cacheSlug: 'hg',
    seriesPrefix: 'H',
    outputPrefix: 'HG',
  },
  RG: { pageNameCandidates: ['RG模型'], cacheSlug: 'rg', seriesPrefix: 'RG', outputPrefix: 'RG' },
  MG: { pageNameCandidates: ['MG模型'], cacheSlug: 'mg', seriesPrefix: 'MG', outputPrefix: 'MG' },
  PG: { pageNameCandidates: ['PG模型'], cacheSlug: 'pg', seriesPrefix: 'PG', outputPrefix: 'PG' },
  EG: { pageNameCandidates: ['EG模型', 'EG'], cacheSlug: 'eg', seriesPrefix: 'EG', outputPrefix: 'EG' },
  // SD / SDCS / RE / FM 都试过，biligame 没汇总页（缺数据，靠 wikipedia fallback）
  SD: { pageNameCandidates: ['SD模型', 'BB战士', 'SDBB模型', 'SD高达'], cacheSlug: 'sd', seriesPrefix: 'SD', outputPrefix: 'SD' },
  SDCS: { pageNameCandidates: ['SDCS模型', 'SDCS'], cacheSlug: 'sdcs', seriesPrefix: 'SDCS', outputPrefix: 'SDCS' },
  RE100: { pageNameCandidates: ['RE模型', 'RE/100模型', 'RE/100'], cacheSlug: 're100', seriesPrefix: 'RE', outputPrefix: 'RE' },
  FM: { pageNameCandidates: ['FM模型', 'FM'], cacheSlug: 'fm', seriesPrefix: 'FM', outputPrefix: 'FM' },
}

// ─────────────────────────────────────────────────────────────────
// 序号前缀 — 给 parse-biligame（旧 HTML 路径）和 fandom 校验用
// ─────────────────────────────────────────────────────────────────

// 用于 parse-fandom 校验 / 归一化序号
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
  return `${slug}.html`
}
export function fandomApiCachePath(slug: string): string {
  return `${slug}.api.json`
}
export function biligameCachePath(slug: string): string {
  // 改用 .json（MediaWiki API 返回 JSON，含 wikitext）
  return `${slug}.json`
}

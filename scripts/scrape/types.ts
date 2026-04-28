import type { Kit } from '@/lib/types/kit'

export type FandomKitRecord = {
  series_number: string
  series_number_normalized: string
  name_en: string
  name_jp?: string
  scale: string
  price_jpy: number
  release_date: string
  box_art_url?: string
  source_work_raw?: string
  detail_page_url?: string
  is_p_bandai?: boolean
  source_grade_page?: string
  // 完整可见文本（含 "Ver.Ka" / "Unleashed" 等变体后缀）。name_en 取的是
  // <a title> 属性，会丢这些后缀；name_full_text 用于变体检测。
  name_full_text?: string
  // 表所在的 H2 section 标题（如 "Perfect Grade Unleashed"），决定 sub-grade
  section_heading?: string
  variants?: string[]
  raw_html: string
}

export type BiligameKitRecord = {
  series_number_normalized: string
  ms_code?: string
  name_zh: string
  raw_text: string
}

// _meta is now part of Kit itself; this alias kept for readability in pipeline code.
export type KitWithMeta = Kit

export type MergeResult = {
  kits: KitWithMeta[]
  unmatched_biligame: BiligameKitRecord[]
  unmapped_works: string[]
  name_zh_matched: number
  name_zh_missing: number
}

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
  raw_html: string
}

export type BiligameKitRecord = {
  series_number_normalized: string
  ms_code?: string
  name_zh: string
  raw_text: string
}

export type KitWithMeta = Kit & {
  _meta?: {
    name_zh_missing?: boolean
    work_unmapped?: boolean
    manual_review?: boolean
    source_work_raw?: string
  }
}

export type MergeResult = {
  kits: KitWithMeta[]
  unmatched_biligame: BiligameKitRecord[]
  unmapped_works: string[]
  name_zh_matched: number
  name_zh_missing: number
}

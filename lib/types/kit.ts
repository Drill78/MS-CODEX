import type { Work } from './work'

export type Grade =
  | 'HG' | 'RG' | 'MG' | 'MG-VerKa'
  | 'PG' | 'PG-Unleashed'
  | 'EG' | 'SD' | 'SDCS'
  | 'RE100' | 'FM'

export type ColorSeparation = 'excellent' | 'good' | 'fair' | 'requires-paint'
export type DecalType = 'water-slide' | 'sticker' | 'both' | 'none'

export type Kit = {
  id: string
  grade: Grade
  series_number?: string
  name_zh: string
  name_jp: string
  name_en?: string
  ms_code?: string
  scale: string

  price_jpy: number
  price_cny_estimate?: number

  release_date: string
  height_mm?: number

  source_works: Work[]
  related_works?: Work[]

  difficulty_build: 1 | 2 | 3 | 4 | 5
  difficulty_paint: 1 | 2 | 3 | 4 | 5
  color_separation: ColorSeparation
  decals: DecalType

  build_time_estimate_hours?: [number, number]
  weapons?: string[]
  accessories?: string[]
  features?: string[]

  is_p_bandai?: boolean
  box_art_url?: string
  source_url: string

  tags?: string[]

  // 内部 meta，仅爬虫产生，UI 层可忽略
  _meta?: {
    name_zh_missing?: boolean
    name_zh_source?: 'biligame' | 'wikipedia-zh' | 'fallback-en'
    work_unmapped?: boolean
    manual_review?: boolean
    source_work_raw?: string
    source_grade_page?: string
    variants?: string[]
    price_uncertain?: boolean
  }
}

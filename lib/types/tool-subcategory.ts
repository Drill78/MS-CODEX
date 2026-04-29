import type { Grade } from './kit'

export type SubcategoryCategory =
  | 'cutting'
  | 'sanding'
  | 'painting'
  | 'finishing'
  | 'assist'
  | 'workspace'

export type Urgency = 'essential' | 'recommended' | 'advanced'

export type WorkshopZone =
  | 'pegboard'
  | 'workbench'
  | 'cabinet-left'
  | 'cabinet-right'

export type WorkshopPosition = { x: number; y: number }

export type ToolProduct = {
  // 留空：05B 阶段实装具体型号
  product_name: string
  brand: string
  price_cny: number
}

export type ToolSubcategory = {
  id: string
  category: SubcategoryCategory

  name_zh: string
  name_en: string

  what_it_is: string
  why_you_need_it: string
  when_to_use: string
  vs_alternatives?: string

  urgency: Urgency
  pitfalls: string[]

  recommended_for_grades: Grade[]

  workshop_zone: WorkshopZone
  workshop_position: WorkshopPosition
  icon: string

  popular_products?: ToolProduct[]
}

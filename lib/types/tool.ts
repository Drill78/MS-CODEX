import type { Grade } from './kit'

export type ToolCategory =
  | 'cutting' | 'sanding' | 'painting'
  | 'finishing' | 'storage' | 'consumable' | 'measuring'

export type Scenario = 'basic' | 'brush-paint' | 'spray-paint' | 'modify' | 'weathering'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Tier = 'budget' | 'value' | 'premium'

export type ChannelPlatform =
  | 'taobao' | 'tmall' | 'jd' | '1688'
  | 'amiami' | 'official' | 'other'

export type Channel = {
  platform: ChannelPlatform
  store_name?: string
  url?: string
}

export type ToolTier = {
  tier: Tier
  product_name: string
  brand: string
  price_cny: number
  channels: Channel[]
  notes?: string
  image_url?: string
}

export type Tool = {
  id: string
  category: ToolCategory
  subcategory?: string
  name_zh: string
  name_en?: string
  description: string
  scenarios: Scenario[]
  level_tags: Level[]
  recommended_for_grades: Grade[]
  required_for_painting?: boolean
  tiers: ToolTier[]
}

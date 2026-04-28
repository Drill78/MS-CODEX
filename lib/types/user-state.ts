import type { Tier } from './tool'

export type ToolOwnership = {
  owned: boolean
  tier_owned?: Tier
  purchased_at?: string
  notes?: string
}

export type KitStatus = 'wishlist' | 'owned' | 'building' | 'completed' | 'painted'

export type KitOwnership = {
  status: KitStatus
  acquired_at?: string
  completed_at?: string
  notes?: string
}

export type UserState = {
  version: 1
  tools: Record<string, ToolOwnership>
  kits: Record<string, KitOwnership>
  preferences: {
    last_filter_toolbox?: unknown
    last_filter_hangar?: unknown
  }
}

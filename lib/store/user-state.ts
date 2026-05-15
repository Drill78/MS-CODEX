'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  UserState,
  KitOwnership,
  KitStatus,
  ToolOwnership,
} from '@/lib/types/user-state'
import type { Tier } from '@/lib/types/tool'

const INITIAL_STATE: UserState = {
  version: 1,
  tools: {},
  kits: {},
  preferences: {},
}

const APP_VERSION = 'ms-codex-0.x'

export type ImportResult =
  | { ok: true; imported: { kits: number; tools: number } }
  | { ok: false; error: string }

interface UserStore extends UserState {
  setKitStatus: (kitId: string, status: KitStatus | 'untracked') => void
  setKitNotes: (kitId: string, notes: string) => void
  setToolOwned: (toolId: string, owned: boolean, tier?: Tier) => void
  exportData: () => string
  importData: (json: string) => ImportResult
  resetData: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      setKitStatus: (kitId, status) =>
        set((state) => {
          if (status === 'untracked') {
            const { [kitId]: _omit, ...rest } = state.kits
            void _omit
            return { kits: rest }
          }
          return {
            kits: {
              ...state.kits,
              [kitId]: {
                ...state.kits[kitId],
                status,
                acquired_at:
                  state.kits[kitId]?.acquired_at ?? new Date().toISOString(),
              },
            },
          }
        }),
      setKitNotes: (kitId, notes) =>
        set((state) => ({
          kits: {
            ...state.kits,
            [kitId]: {
              ...state.kits[kitId],
              notes,
              status: state.kits[kitId]?.status ?? 'wishlist',
            },
          },
        })),
      setToolOwned: (toolId, owned, tier) =>
        set((state) => ({
          tools: {
            ...state.tools,
            [toolId]: {
              owned,
              tier_owned: tier,
              purchased_at: owned ? new Date().toISOString() : undefined,
            },
          },
        })),
      exportData: () => {
        const state = get()
        const payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          appVersion: APP_VERSION,
          data: {
            tools: state.tools,
            kits: state.kits,
            preferences: state.preferences,
          },
        }
        return JSON.stringify(payload, null, 2)
      },
      importData: (json) => {
        try {
          const parsed: unknown = JSON.parse(json)
          if (!parsed || typeof parsed !== 'object') {
            return { ok: false, error: '数据格式错误：根节点不是对象' }
          }
          const root = parsed as {
            version?: unknown
            data?: unknown
          }
          if (root.version !== 1) {
            return {
              ok: false,
              error: `不兼容的数据版本：${String(root.version)}`,
            }
          }
          if (!root.data || typeof root.data !== 'object') {
            return { ok: false, error: '数据格式错误：缺少 data 字段' }
          }
          const incoming = root.data as {
            kits?: Record<string, KitOwnership>
            tools?: Record<string, ToolOwnership>
            preferences?: UserState['preferences']
          }
          const incomingKits = incoming.kits ?? {}
          const incomingTools = incoming.tools ?? {}

          const current = get()
          const mergedKits = mergeKits(current.kits, incomingKits)
          const mergedTools = mergeTools(current.tools, incomingTools)
          const mergedPreferences = {
            ...current.preferences,
            ...(incoming.preferences ?? {}),
          }

          set({
            kits: mergedKits,
            tools: mergedTools,
            preferences: mergedPreferences,
          })

          return {
            ok: true,
            imported: {
              kits: Object.keys(incomingKits).length,
              tools: Object.keys(incomingTools).length,
            },
          }
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : '解析失败',
          }
        }
      },
      resetData: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: 'ms-codex-user-state',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

function kitTimestamp(k: KitOwnership): number {
  const a = k.completed_at ? Date.parse(k.completed_at) : NaN
  const b = k.acquired_at ? Date.parse(k.acquired_at) : NaN
  const aValid = Number.isFinite(a)
  const bValid = Number.isFinite(b)
  if (aValid && bValid) return Math.max(a, b)
  if (aValid) return a
  if (bValid) return b
  return 0
}

function toolTimestamp(t: ToolOwnership): number {
  if (!t.purchased_at) return 0
  const ts = Date.parse(t.purchased_at)
  return Number.isFinite(ts) ? ts : 0
}

function mergeKits(
  current: Record<string, KitOwnership>,
  incoming: Record<string, KitOwnership>,
): Record<string, KitOwnership> {
  const merged: Record<string, KitOwnership> = { ...current }
  for (const [id, value] of Object.entries(incoming)) {
    const existing = merged[id]
    if (!existing) {
      merged[id] = value
      continue
    }
    if (kitTimestamp(value) >= kitTimestamp(existing)) {
      merged[id] = value
    }
  }
  return merged
}

function mergeTools(
  current: Record<string, ToolOwnership>,
  incoming: Record<string, ToolOwnership>,
): Record<string, ToolOwnership> {
  const merged: Record<string, ToolOwnership> = { ...current }
  for (const [id, value] of Object.entries(incoming)) {
    const existing = merged[id]
    if (!existing) {
      merged[id] = value
      continue
    }
    if (toolTimestamp(value) >= toolTimestamp(existing)) {
      merged[id] = value
    }
  }
  return merged
}

export function useKitOwnership(kitId: string): KitOwnership | undefined {
  return useUserStore((state) => state.kits[kitId])
}

// Hydration guard: returns true only after the first client effect tick. Use
// in components that render data from `localStorage` to avoid SSR/CSR mismatch.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}

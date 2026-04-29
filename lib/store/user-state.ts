'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  UserState,
  KitOwnership,
  KitStatus,
} from '@/lib/types/user-state'
import type { Tier } from '@/lib/types/tool'

const INITIAL_STATE: UserState = {
  version: 1,
  tools: {},
  kits: {},
  preferences: {},
}

interface UserStore extends UserState {
  setKitStatus: (kitId: string, status: KitStatus | 'untracked') => void
  setKitNotes: (kitId: string, notes: string) => void
  setToolOwned: (toolId: string, owned: boolean, tier?: Tier) => void
  importState: (incoming: UserState) => void
  exportState: () => UserState
  reset: () => void
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
      importState: (incoming) => set({ ...incoming, version: 1 }),
      exportState: () => {
        const {
          setKitStatus: _a,
          setKitNotes: _b,
          setToolOwned: _c,
          importState: _d,
          exportState: _e,
          reset: _f,
          ...state
        } = get()
        void _a
        void _b
        void _c
        void _d
        void _e
        void _f
        return state as UserState
      },
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'ms-codex-user-state',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

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

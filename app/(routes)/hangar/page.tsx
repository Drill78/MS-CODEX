import { Suspense } from 'react'
import { getAllKits, getFeaturedKits } from '@/lib/data'
import { HangarBrowser } from '@/components/hangar/HangarBrowser'

export const metadata = {
  title: 'HANGAR | MS-CODEX',
  description: '全机体档案库 — 1148 套 Gunpla 资料 + 多维筛选',
}

export default async function HangarPage() {
  const [kits, featured] = await Promise.all([
    getAllKits(),
    getFeaturedKits(),
  ])
  return (
    <Suspense fallback={<HangarLoading />}>
      <HangarBrowser allKits={kits} featuredItems={featured} />
    </Suspense>
  )
}

function HangarLoading() {
  return (
    <div className="container mx-auto px-6 py-10">
      <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {'// LOADING HANGAR...'}
      </p>
    </div>
  )
}

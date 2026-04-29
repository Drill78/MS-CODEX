import { Suspense } from 'react'
import { getAllToolSubcategories } from '@/lib/data'
import { ToolboxBrowser } from '@/components/toolbox/ToolboxBrowser'

export const metadata = {
  title: 'TOOLBOX | MS-CODEX',
  description: '工具知识图谱 — 35 个工具亚类，按场景和 urgency 筛选',
}

export default async function ToolboxPage() {
  const subcategories = await getAllToolSubcategories()
  return (
    <Suspense fallback={<ToolboxLoading />}>
      <ToolboxBrowser subcategories={subcategories} />
    </Suspense>
  )
}

function ToolboxLoading() {
  return (
    <div className="container mx-auto px-6 py-10">
      <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
        {'// LOADING TOOLBOX...'}
      </p>
    </div>
  )
}

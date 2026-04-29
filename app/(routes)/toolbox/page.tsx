import { getAllToolSubcategories } from '@/lib/data'
import { ToolboxBrowser } from '@/components/toolbox/ToolboxBrowser'

export const metadata = {
  title: 'TOOLBOX | MS-CODEX',
  description: '工具知识图谱 — 32 个工具亚类，按场景和 urgency 筛选',
}

export default async function ToolboxPage() {
  const subcategories = await getAllToolSubcategories()
  return <ToolboxBrowser subcategories={subcategories} />
}

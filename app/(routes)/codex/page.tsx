import { getAllKits, getAllToolSubcategories } from '@/lib/data'
import { CodexView } from '@/components/codex/CodexView'

export const metadata = {
  title: 'CODEX | MS-CODEX',
  description: '我的工坊 + 机库档案',
}

export default async function CodexPage() {
  const [kits, tools] = await Promise.all([
    getAllKits(),
    getAllToolSubcategories(),
  ])
  return <CodexView allKits={kits} toolSubcategories={tools} />
}

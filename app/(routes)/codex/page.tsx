import { getAllKits } from '@/lib/data'
import { CodexView } from '@/components/codex/CodexView'

export const metadata = {
  title: 'CODEX | MS-CODEX',
  description: '我的工具墙 + 机库档案',
}

export default async function CodexPage() {
  const kits = await getAllKits()
  return <CodexView allKits={kits} />
}

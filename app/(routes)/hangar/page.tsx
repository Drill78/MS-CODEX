import { getAllKits } from '@/lib/data'
import { HangarBrowser } from '@/components/hangar/HangarBrowser'

export const metadata = {
  title: 'HANGAR | MS-CODEX',
  description: '全机体档案库 — 1148 套 Gunpla 资料 + 多维筛选',
}

export default async function HangarPage() {
  const kits = await getAllKits()
  return <HangarBrowser kits={kits} />
}

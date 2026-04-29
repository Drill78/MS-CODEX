import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllKits, getKitById } from '@/lib/data'
import { HangarDetail } from '@/components/hangar/HangarDetail'

export async function generateStaticParams() {
  const kits = await getAllKits()
  return kits.map((k) => ({ slug: k.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const kit = await getKitById(slug)
  if (!kit) return {}
  const work = kit.source_works[0]?.title_zh ?? ''
  return {
    title: `${kit.name_zh} | ${kit.grade}${
      kit.series_number ? ` ${kit.series_number}` : ''
    } | MS-CODEX`,
    description: `${kit.grade} ${kit.scale} ${kit.name_en ?? ''}${
      work ? ` — ${work}` : ''
    }`.trim(),
  }
}

export default async function HangarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const kit = await getKitById(slug)
  if (!kit) notFound()
  return <HangarDetail kit={kit} />
}

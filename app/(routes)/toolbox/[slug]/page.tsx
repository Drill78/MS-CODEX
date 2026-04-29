import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getAllToolSubcategories,
  getToolSubcategoryById,
} from '@/lib/data'
import { ToolboxDetail } from '@/components/toolbox/ToolboxDetail'

export async function generateStaticParams() {
  const all = await getAllToolSubcategories()
  return all.map((t) => ({ slug: t.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sc = await getToolSubcategoryById(slug)
  if (!sc) return {}
  return {
    title: `${sc.name_zh} | TOOLBOX | MS-CODEX`,
    description: sc.what_it_is,
  }
}

export default async function ToolboxDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sc = await getToolSubcategoryById(slug)
  if (!sc) notFound()
  return <ToolboxDetail subcategory={sc} />
}

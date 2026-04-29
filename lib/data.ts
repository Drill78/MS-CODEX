// NOTE: This module is server-only (uses node:fs). The `server-only` guard
// package is not installed; node:fs imports already throw on the client, so
// the practical guarantee is the same.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Kit } from '@/lib/types/kit'
import type { Work } from '@/lib/types/work'

export type FeaturedItem = {
  kit_id: string
  reason: string
  category: string
}

let kitsCache: Kit[] | null = null
let worksCache: Work[] | null = null
let featuredCache: FeaturedItem[] | null = null

export async function getAllKits(): Promise<Kit[]> {
  if (kitsCache) return kitsCache
  const filePath = path.join(process.cwd(), 'data', 'kits.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  kitsCache = JSON.parse(raw) as Kit[]
  return kitsCache
}

export async function getKitById(id: string): Promise<Kit | undefined> {
  const all = await getAllKits()
  return all.find((k) => k.id === id)
}

export async function getAllWorks(): Promise<Work[]> {
  if (worksCache) return worksCache
  const filePath = path.join(process.cwd(), 'data', 'works.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  worksCache = JSON.parse(raw) as Work[]
  return worksCache
}

export async function getKitsByGrade(grade: string): Promise<Kit[]> {
  const all = await getAllKits()
  return all.filter((k) => k.grade === grade)
}

export async function getFeaturedKits(): Promise<FeaturedItem[]> {
  if (featuredCache) return featuredCache
  const filePath = path.join(process.cwd(), 'data', 'featured-kits.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  const parsed = JSON.parse(raw) as { version: number; items: FeaturedItem[] }
  featuredCache = parsed.items
  return featuredCache
}

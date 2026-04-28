import path from 'node:path'
import type { Grade } from '@/lib/types/kit'
import { cachedFetch } from './fetch'
import { BILIGAME_SOURCES, biligameCachePath, type BiligameSource } from './sources'

export type BiligameFetched = {
  source: BiligameSource
  html: string
  sourceUrl: string
}

const RAW_DIR = path.resolve('data', 'raw', 'biligame')

export async function fetchBiligameGrade(
  grade: Grade,
): Promise<{ result: BiligameFetched | null; error?: string }> {
  const source = BILIGAME_SOURCES[grade]
  if (!source) return { result: null }
  const cache = path.join(RAW_DIR, biligameCachePath(source.cacheSlug))
  try {
    const html = await cachedFetch(source.url, cache)
    return { result: { source, html, sourceUrl: source.url } }
  } catch (err) {
    return {
      result: null,
      error: `[biligame ${grade}/${source.cacheSlug}] ${(err as Error).message}`,
    }
  }
}

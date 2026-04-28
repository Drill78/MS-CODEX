import path from 'node:path'
import type { Grade } from '@/lib/types/kit'
import { cachedFetchJson } from './fetch'
import { BILIGAME_SOURCES, biligameCachePath, type BiligameSource } from './sources'

export type BiligameFetched = {
  source: BiligameSource
  pageNameUsed: string
  wikitext: string
  sourceUrl: string
}

const RAW_DIR = path.resolve('data', 'raw', 'biligame')

function apiUrl(pageName: string): string {
  return (
    `https://wiki.biligame.com/gundam/api.php` +
    `?action=parse&page=${encodeURIComponent(pageName)}&format=json&prop=wikitext`
  )
}

type ParseResp = {
  parse?: { wikitext?: { '*'?: string } | string }
  error?: { code?: string; info?: string }
}

export async function fetchBiligameGrade(
  grade: Grade,
): Promise<{ result: BiligameFetched | null; error?: string }> {
  const source = BILIGAME_SOURCES[grade]
  if (!source) return { result: null }
  const cache = path.join(RAW_DIR, biligameCachePath(source.cacheSlug))

  const errors: string[] = []
  for (const pageName of source.pageNameCandidates) {
    // each candidate gets its own api cache slot
    const slotCache = `${cache}.${encodeURIComponent(pageName).slice(0, 60)}`
    const json = await cachedFetchJson<ParseResp>(apiUrl(pageName), slotCache)
    if (!json) {
      errors.push(`fetch failed for ${pageName}`)
      continue
    }
    if (json.error) {
      errors.push(`API ${json.error.code ?? '?'} for ${pageName}`)
      continue
    }
    const wt = json.parse?.wikitext
    let wikitext = ''
    if (typeof wt === 'string') wikitext = wt
    else if (wt && typeof wt === 'object' && '*' in wt)
      wikitext = (wt as { '*': string })['*'] ?? ''
    if (!wikitext) {
      errors.push(`empty wikitext for ${pageName}`)
      continue
    }
    return {
      result: {
        source,
        pageNameUsed: pageName,
        wikitext,
        sourceUrl: `https://wiki.biligame.com/gundam/${pageName}`,
      },
    }
  }
  return {
    result: null,
    error: `[biligame ${grade}/${source.cacheSlug}] ${errors.join('; ')}`,
  }
}

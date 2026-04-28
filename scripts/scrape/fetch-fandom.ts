import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Grade } from '@/lib/types/kit'
import { cachedFetch, cachedFetchJson } from './fetch'
import {
  FANDOM_SOURCES,
  fandomApiCachePath,
  fandomCachePath,
  type FandomSource,
} from './sources'

export type FandomFetched = {
  source: FandomSource
  pageTitleUsed: string
  html: string
  sourceUrl: string
}

const RAW_DIR = path.resolve('data', 'raw', 'fandom')

function apiUrl(pageTitle: string): string {
  return (
    `https://gundam.fandom.com/api.php` +
    `?action=parse&page=${encodeURIComponent(pageTitle)}&format=json&prop=text`
  )
}

type ParseResp = {
  parse?: { text?: { '*'?: string } | string; title?: string }
  error?: { code?: string; info?: string }
}

async function fetchOne(source: FandomSource): Promise<FandomFetched | { error: string }> {
  const apiCache = path.join(RAW_DIR, fandomApiCachePath(source.cacheSlug))
  const htmlCache = path.join(RAW_DIR, fandomCachePath(source.cacheSlug))

  const errors: string[] = []
  for (const pageTitle of source.pageTitleCandidates) {
    // each candidate gets its own api cache slot (suffix the title), avoid
    // poisoning the slot with a 404 attempt
    const slotApiCache = `${apiCache}.${encodeURIComponent(pageTitle).slice(0, 60)}`
    const json = await cachedFetchJson<ParseResp>(apiUrl(pageTitle), slotApiCache)
    if (!json) {
      errors.push(`fetch failed for ${pageTitle}`)
      continue
    }
    if (json.error) {
      errors.push(`API error ${json.error.code ?? '?'} for ${pageTitle}`)
      continue
    }
    const text = json.parse?.text
    let html = ''
    if (typeof text === 'string') html = text
    else if (text && typeof text === 'object' && '*' in text)
      html = (text as { '*': string })['*'] ?? ''
    if (!html) {
      errors.push(`empty HTML for ${pageTitle}`)
      continue
    }
    await fs.mkdir(RAW_DIR, { recursive: true })
    await fs.writeFile(htmlCache, html, 'utf-8')
    return {
      source,
      pageTitleUsed: pageTitle,
      html,
      sourceUrl: `https://gundam.fandom.com/wiki/${pageTitle}`,
    }
  }
  return { error: `all candidates failed for ${source.cacheSlug}: ${errors.join('; ')}` }
}

export async function fetchFandomGrade(
  grade: Grade,
): Promise<{ results: FandomFetched[]; errors: string[] }> {
  const sources = FANDOM_SOURCES[grade]
  const results: FandomFetched[] = []
  const errors: string[] = []
  for (const source of sources) {
    try {
      const r = await fetchOne(source)
      if ('error' in r) errors.push(`[fandom ${grade}/${source.cacheSlug}] ${r.error}`)
      else results.push(r)
    } catch (err) {
      errors.push(
        `[fandom ${grade}/${source.cacheSlug}] ${(err as Error).message}`,
      )
    }
  }
  return { results, errors }
}

// re-export so cachedFetch is preserved if any caller re-imports
export { cachedFetch }

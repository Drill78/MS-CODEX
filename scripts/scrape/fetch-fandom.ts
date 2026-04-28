import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Grade } from '@/lib/types/kit'
import { cachedFetch } from './fetch'
import {
  FANDOM_SOURCES,
  fandomApiCachePath,
  fandomCachePath,
  type FandomSource,
} from './sources'

export type FandomFetched = {
  source: FandomSource
  html: string
  sourceUrl: string
}

const RAW_DIR = path.resolve('data', 'raw', 'fandom')

function apiUrl(pageTitle: string): string {
  // gundam.fandom.com sits behind Cloudflare's bot challenge — direct page
  // fetches return a 403 "Just a moment…" interstitial. The MediaWiki API is
  // served from the same host but is not gated, and returns the parsed page
  // HTML wrapped in JSON.
  return (
    `https://gundam.fandom.com/api.php` +
    `?action=parse&page=${encodeURIComponent(pageTitle)}&format=json&prop=text`
  )
}

async function fetchOne(source: FandomSource): Promise<FandomFetched> {
  const apiCache = path.join(RAW_DIR, fandomApiCachePath(source.cacheSlug))
  const htmlCache = path.join(RAW_DIR, fandomCachePath(source.cacheSlug))

  const apiBody = await cachedFetch(apiUrl(source.pageTitle), apiCache)
  let html = ''
  try {
    const json = JSON.parse(apiBody) as {
      parse?: { text?: { '*'?: string } | string }
      error?: { code?: string; info?: string }
    }
    if (json.error) {
      throw new Error(
        `Fandom API error for ${source.pageTitle}: ${json.error.code ?? '?'} ${json.error.info ?? ''}`,
      )
    }
    const text = json.parse?.text
    if (typeof text === 'string') {
      html = text
    } else if (text && typeof text === 'object' && '*' in text) {
      html = (text as { '*': string })['*'] ?? ''
    }
  } catch (err) {
    throw new Error(
      `Failed to parse Fandom API JSON for ${source.pageTitle}: ${(err as Error).message}`,
    )
  }
  if (!html) {
    throw new Error(`Fandom API returned empty HTML for ${source.pageTitle}`)
  }
  await fs.mkdir(RAW_DIR, { recursive: true })
  await fs.writeFile(htmlCache, html, 'utf-8')
  return { source, html, sourceUrl: source.url }
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
      results.push(r)
    } catch (err) {
      errors.push(
        `[fandom ${grade}/${source.cacheSlug}] ${(err as Error).message}`,
      )
    }
  }
  return { results, errors }
}

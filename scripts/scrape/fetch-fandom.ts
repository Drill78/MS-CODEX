import path from 'node:path'
import { cachedFetch } from './fetch'

// gundam.fandom.com sits behind Cloudflare's bot challenge — direct page
// fetches return a 403 "Just a moment…" interstitial. The MediaWiki API is
// served from the same host but is not gated, and returns the parsed page
// HTML wrapped in JSON.
const FANDOM_API_URL =
  'https://gundam.fandom.com/api.php?action=parse&page=Real_Grade&format=json&prop=text'
const FANDOM_PAGE_URL = 'https://gundam.fandom.com/wiki/Real_Grade'
const CACHE_PATH = path.resolve('data', 'raw', 'fandom', 'real-grade.html')
const RAW_API_PATH = path.resolve('data', 'raw', 'fandom', 'real-grade.api.json')

export async function fetchFandom(): Promise<string> {
  const apiBody = await cachedFetch(FANDOM_API_URL, RAW_API_PATH)
  let html = ''
  try {
    const json = JSON.parse(apiBody) as {
      parse?: { text?: { '*'?: string } | string }
    }
    const text = json.parse?.text
    if (typeof text === 'string') {
      html = text
    } else if (text && typeof text === 'object' && '*' in text) {
      html = (text as { '*': string })['*'] ?? ''
    }
  } catch (err) {
    throw new Error(
      `Failed to parse Fandom API JSON: ${(err as Error).message}`,
    )
  }
  if (!html) {
    throw new Error('Fandom API returned empty HTML')
  }
  // Mirror the parsed HTML to /data/raw/fandom/real-grade.html for inspection.
  const fs = await import('node:fs/promises')
  await fs.writeFile(CACHE_PATH, html, 'utf-8')
  return html
}

export const FANDOM_SOURCE_URL = FANDOM_PAGE_URL

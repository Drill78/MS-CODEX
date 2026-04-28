import path from 'node:path'
import { cachedFetchJson } from './fetch'

const RAW_DIR = path.resolve('data', 'raw', 'wikipedia-zh')

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'unknown'
}

// opensearch returns: [searchTerm, [titles...], [descriptions...], [urls...]]
type OpenSearchResp = [string, string[], string[], string[]] | null | undefined

const GUNDAM_HINT_REGEX = /高达|扎古|高達|機動戦士|魔蟹|战蟹|强人|百式/

/**
 * Look up a kit's Chinese name on zh.wikipedia by ms_code.
 * Returns the best-matched article title, or null.
 *
 * Strategy: opensearch top-3 candidates, prefer first one that
 *   (a) literally contains ms_code, OR
 *   (b) contains a Gundam-themed Chinese keyword.
 * Strip "(消歧义)" / "(动画)" / parenthetical disambiguation suffixes.
 */
export async function lookupNameZhFromWikipediaZh(
  msCode: string | undefined,
): Promise<string | null> {
  if (!msCode) return null
  const trimmed = msCode.trim()
  if (trimmed.length < 2) return null

  const url =
    `https://zh.wikipedia.org/w/api.php` +
    `?action=opensearch&search=${encodeURIComponent(trimmed)}&limit=3&format=json`
  const cachePath = path.join(RAW_DIR, `${slugify(trimmed)}.json`)

  let data: OpenSearchResp
  try {
    data = await cachedFetchJson<OpenSearchResp>(url, cachePath)
  } catch {
    return null
  }
  if (!Array.isArray(data) || !Array.isArray(data[1]) || data[1].length === 0)
    return null

  const titles = data[1]
  for (const raw of titles) {
    if (typeof raw !== 'string') continue
    const title = raw.trim()
    if (!title) continue
    if (title.includes(trimmed) || GUNDAM_HINT_REGEX.test(title)) {
      // strip parenthetical disambiguation suffix
      return title.replace(/\s*\([^)]+\)\s*$/, '').trim()
    }
  }
  return null
}

import { promises as fs } from 'node:fs'
import path from 'node:path'

// Fandom and most CDNs reject obviously-bot UAs with 403. Use a realistic
// browser UA but identify ourselves clearly via the From header.
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 MS-CODEX-scraper/0.1 (educational use)'
const FROM_HEADER = 'ms-codex-scraper@example.com'
const REQUEST_TIMEOUT_MS = 30_000
// 03B：URL 数量从 2 升到 ~25，间隔从 500ms 提到 800ms 再稳一档
const MIN_INTERVAL_MS = 800
const MAX_RETRIES = 3

let lastRequestAt = 0

const isRefresh = process.argv.includes('--refresh')

async function ensureDir(p: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true })
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function politeWait(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestAt
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }
  lastRequestAt = Date.now()
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await politeWait()
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          From: FROM_HEADER,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ja;q=0.6',
          'Accept-Encoding': 'gzip, deflate, br',
          ...(init?.headers ?? {}),
        },
      })
      clearTimeout(t)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} on ${url}`)
      }
      return res
    } catch (err) {
      clearTimeout(t)
      lastErr = err
      if (attempt < MAX_RETRIES) {
        const backoff = 1000 * Math.pow(2, attempt - 1)
        console.warn(
          `[fetch] attempt ${attempt} failed for ${url}: ${(err as Error).message}. retrying in ${backoff}ms`,
        )
        await new Promise((r) => setTimeout(r, backoff))
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`fetch failed for ${url}`)
}

export async function cachedFetch(
  url: string,
  cachePath: string,
): Promise<string> {
  if (!isRefresh && (await fileExists(cachePath))) {
    return fs.readFile(cachePath, 'utf-8')
  }
  const res = await fetchWithRetry(url)
  const text = await res.text()
  await ensureDir(cachePath)
  await fs.writeFile(cachePath, text, 'utf-8')
  return text
}

export async function cachedFetchBinary(
  url: string,
  cachePath: string,
): Promise<Buffer> {
  if (!isRefresh && (await fileExists(cachePath))) {
    return fs.readFile(cachePath)
  }
  const res = await fetchWithRetry(url)
  const arr = await res.arrayBuffer()
  const buf = Buffer.from(arr)
  await ensureDir(cachePath)
  await fs.writeFile(cachePath, buf)
  return buf
}

export const REFRESH_MODE = isRefresh

import path from 'node:path'
import { cachedFetch } from './fetch'

const BILIGAME_URL_RAW = 'https://wiki.biligame.com/gundam/RG模型'
const BILIGAME_URL = encodeURI(BILIGAME_URL_RAW)
const CACHE_PATH = path.resolve('data', 'raw', 'biligame', 'rg-mokei.html')

export async function fetchBiligame(): Promise<string> {
  return cachedFetch(BILIGAME_URL, CACHE_PATH)
}

export const BILIGAME_SOURCE_URL = BILIGAME_URL

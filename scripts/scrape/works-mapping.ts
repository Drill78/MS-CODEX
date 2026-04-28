import type { Work } from '@/lib/types/work'

export const WORKS_SEED: Record<string, Work> = {
  'Mobile Suit Gundam': {
    id: 'msg-0079',
    title_zh: '机动战士高达',
    title_jp: '機動戦士ガンダム',
    era: 'UC',
    year_aired: 1979,
  },
  'Mobile Suit Gundam: The Origin': {
    id: 'msg-the-origin',
    title_zh: '机动战士高达 THE ORIGIN',
    title_jp: '機動戦士ガンダム THE ORIGIN',
    era: 'UC',
    year_aired: 2015,
  },
  'Mobile Suit Zeta Gundam': {
    id: 'msz',
    title_zh: '机动战士Z高达',
    title_jp: '機動戦士Ζガンダム',
    era: 'UC',
    year_aired: 1985,
  },
  'Mobile Suit Gundam ZZ': {
    id: 'msgzz',
    title_zh: '机动战士ZZ高达',
    title_jp: '機動戦士ガンダムΖΖ',
    era: 'UC',
    year_aired: 1986,
  },
  "Mobile Suit Gundam: Char's Counterattack": {
    id: 'cca',
    title_zh: '机动战士高达 逆袭的夏亚',
    title_jp: '機動戦士ガンダム 逆襲のシャア',
    era: 'UC',
    year_aired: 1988,
  },
  'Mobile Suit Gundam Unicorn': {
    id: 'gundam-uc',
    title_zh: '机动战士高达UC',
    title_jp: '機動戦士ガンダムUC',
    era: 'UC',
    year_aired: 2010,
  },
  "Mobile Suit Gundam: Hathaway's Flash": {
    id: 'hathaway',
    title_zh: '机动战士高达 闪光的哈萨维',
    title_jp: '機動戦士ガンダム 閃光のハサウェイ',
    era: 'UC',
    year_aired: 2021,
  },
  'Mobile Suit Gundam Narrative': {
    id: 'narrative',
    title_zh: '机动战士高达NT',
    title_jp: '機動戦士ガンダムNT',
    era: 'UC',
    year_aired: 2018,
  },
  'Mobile Suit Gundam SEED': {
    id: 'seed',
    title_zh: '机动战士高达SEED',
    title_jp: '機動戦士ガンダムSEED',
    era: 'CE',
    year_aired: 2002,
  },
  'Mobile Suit Gundam SEED Destiny': {
    id: 'seed-destiny',
    title_zh: '机动战士高达SEED DESTINY',
    title_jp: '機動戦士ガンダムSEED DESTINY',
    era: 'CE',
    year_aired: 2004,
  },
  'Mobile Suit Gundam SEED Freedom': {
    id: 'seed-freedom',
    title_zh: '机动战士高达SEED FREEDOM',
    title_jp: '機動戦士ガンダムSEED FREEDOM',
    era: 'CE',
    year_aired: 2024,
  },
  'Mobile Suit Gundam 00': {
    id: 'gundam-00',
    title_zh: '机动战士高达00',
    title_jp: '機動戦士ガンダム00',
    era: 'AD',
    year_aired: 2007,
  },
  'Mobile Suit Gundam Wing': {
    id: 'gundam-w',
    title_zh: '新机动战记高达W',
    title_jp: '新機動戦記ガンダムW',
    era: 'AC',
    year_aired: 1995,
  },
  'After War Gundam X': {
    id: 'gundam-x',
    title_zh: '机动新世纪高达X',
    title_jp: '機動新世紀ガンダムX',
    era: 'AW',
    year_aired: 1996,
  },
  'Mobile Fighter G Gundam': {
    id: 'g-gundam',
    title_zh: '机动武斗传G高达',
    title_jp: '機動武闘伝Gガンダム',
    era: 'FC',
    year_aired: 1994,
  },
  'Mobile Suit Gundam: Iron-Blooded Orphans': {
    id: 'ibo',
    title_zh: '机动战士高达 铁血的奥尔芬斯',
    title_jp: '機動戦士ガンダム 鉄血のオルフェンズ',
    era: 'PD',
    year_aired: 2015,
  },
  'Mobile Suit Gundam: The Witch from Mercury': {
    id: 'witch-from-mercury',
    title_zh: '机动战士高达 水星的魔女',
    title_jp: '機動戦士ガンダム 水星の魔女',
    era: 'AS',
    year_aired: 2022,
  },
  'Mobile Suit Gundam: Reconguista in G': {
    id: 'g-reco',
    title_zh: '高达 G之复国运动',
    title_jp: 'ガンダム Gのレコンギスタ',
    era: 'RC',
    year_aired: 2014,
  },
}

export function lookupWork(rawSeries: string | undefined): Work | undefined {
  if (!rawSeries) return undefined
  const normalized = rawSeries.trim()
  if (WORKS_SEED[normalized]) return WORKS_SEED[normalized]
  const withoutPrefix = normalized.replace(/^Mobile Suit\s+/i, '')
  for (const [key, work] of Object.entries(WORKS_SEED)) {
    if (key.replace(/^Mobile Suit\s+/i, '') === withoutPrefix) return work
  }
  return undefined
}

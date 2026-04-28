import type { Grade } from '@/lib/types/kit'
import { BILIGAME_SOURCES } from './sources'
import type { BiligameKitRecord } from './types'

// B站 wiki 用 MediaWiki 模板把 kit 信息折叠在 {{首页模型小图|<param>}} 里。
// <param> 形如 "RG01RX-78-2高达" / "MG02夏亚专用扎古Ⅱ" / "H01钢加农"。
// 解析步骤：抠 prefix → 抠 ms_code（可能没有）→ 剩下当 name_zh。

const ROMAN_RANGE = 'Ⅰ-ⅿ'
const MS_CODE_TOKEN_REGEX = new RegExp(
  `^([A-Z][A-Z0-9${ROMAN_RANGE}/-]*)`,
  'u',
)
const TEMPLATE_REGEX = /\{\{首页模型小图\|([^}|\n]+)\}\}/g
// 备用：很少数页面用 [[Page|Display]] 表示 kit 链接，扫一遍兜底
const LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function splitMsCodeAndName(rest: string): {
  ms_code?: string
  name_zh: string
} {
  if (!rest) return { name_zh: '' }
  const cjkIdx = rest.search(/[一-鿿]/)
  if (cjkIdx > 0) {
    const codePart = rest.slice(0, cjkIdx).trim().replace(/^[-\s·]+|[-\s·]+$/g, '')
    const namePart = rest.slice(cjkIdx).trim()
    if (/[A-Z]/.test(codePart) && /[0-9]/.test(codePart)) {
      return { ms_code: codePart, name_zh: namePart }
    }
    if (/^[A-Z][A-Z0-9/-]*$/.test(codePart)) {
      return { ms_code: codePart, name_zh: namePart }
    }
    return { name_zh: rest.trim() }
  }
  if (cjkIdx === -1) {
    const m = rest.match(MS_CODE_TOKEN_REGEX)
    if (m) {
      const code = m[1]
      const remainder = rest.slice(code.length).trim()
      return remainder
        ? { ms_code: code, name_zh: remainder }
        : { ms_code: code, name_zh: code }
    }
    return { name_zh: rest.trim() }
  }
  return { name_zh: rest.trim() }
}

export function parseBiligame(
  wikitext: string,
  grade: Grade,
): {
  records: BiligameKitRecord[]
  errors: string[]
} {
  const records: BiligameKitRecord[] = []
  const errors: string[] = []
  const seen = new Set<string>()
  const config = BILIGAME_SOURCES[grade]
  if (!config) return { records, errors }

  const seriesPrefix = config.seriesPrefix
  const outputPrefix = config.outputPrefix
  // ^<prefix>0*(\d{1,3})(.*)$ — 编号 + 后续 ms_code/name
  const paramRegex = new RegExp(
    `^${seriesPrefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*0*(\\d{1,3})\\s*(.*)$`,
    'i',
  )

  function consume(param: string, source: string) {
    try {
      const cleaned = param.trim()
      if (!cleaned) return
      const m = cleaned.match(paramRegex)
      if (!m) return
      const num = parseInt(m[1], 10)
      if (Number.isNaN(num)) return
      const rest = (m[2] ?? '').trim()
      const { ms_code, name_zh } = splitMsCodeAndName(rest)
      if (!name_zh && !ms_code) return

      const series_number_normalized = `${outputPrefix}${pad(num)}`
      if (seen.has(series_number_normalized)) return
      seen.add(series_number_normalized)

      records.push({
        series_number_normalized,
        ms_code,
        name_zh: name_zh || ms_code || '',
        raw_text: source,
      })
    } catch (err) {
      errors.push(
        `[biligame ${grade}] template parse error on "${param.slice(0, 60)}": ${(err as Error).message}`,
      )
    }
  }

  for (const m of wikitext.matchAll(TEMPLATE_REGEX)) {
    consume(m[1], m[0])
  }
  // Only fall back to plain links if no templates found — plain links may
  // include navigation cross-refs to other pages.
  if (records.length === 0) {
    for (const m of wikitext.matchAll(LINK_REGEX)) {
      const target = m[1]
      consume(target, m[0])
    }
  }

  return { records, errors }
}

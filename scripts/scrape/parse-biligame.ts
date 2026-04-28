import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import type { BiligameKitRecord } from './types'

// B 站 wiki 的 RG 模型页面布局：每个 <table class="wikitable"> 里以 6 列重复
// 形式排版（编号 / 模型 / 编号 / 模型 / 编号 / 模型）。每个"模型"格子里
// 是一个 <a title="RGRX-78-2高达">RGRX-78-2高达</a>，前缀的 "RG" 是规格线
// 标记，后面紧接 MS 型号（A-Z / 0-9 / 横线 / 罗马数字）和中文名。

const RG_NUMBER_REGEX = /^\s*RG\s*0*(\d{1,3})\s*$/
const ROMAN_RANGE = 'Ⅰ-ⅿ' // Ⅰ–Ⅿ
const MS_CODE_TOKEN_REGEX = new RegExp(
  `^([A-Z][A-Z0-9${ROMAN_RANGE}/-]*)`,
)

function normalizeSeries(num: number): string {
  return `RG${num.toString().padStart(2, '0')}`
}

function stripLineMarker(raw: string): string {
  // The link text begins with the literal "RG" line marker. Strip it.
  return raw.replace(/^RG\s*/, '').trim()
}

function splitMsCodeAndName(rest: string): {
  ms_code?: string
  name_zh: string
} {
  if (!rest) return { name_zh: '' }
  // Find the first CJK character — everything before it is the MS code.
  const cjkIdx = rest.search(/[一-鿿]/)
  if (cjkIdx > 0) {
    const codePart = rest.slice(0, cjkIdx).trim().replace(/^[-\s·]+|[-\s·]+$/g, '')
    const namePart = rest.slice(cjkIdx).trim()
    if (/[A-Z]/.test(codePart) && /[0-9]/.test(codePart)) {
      return { ms_code: codePart, name_zh: namePart }
    }
    if (/^[A-Z][A-Z0-9${ROMAN_RANGE}/-]*$/.test(codePart)) {
      return { ms_code: codePart, name_zh: namePart }
    }
    return { name_zh: rest.trim() }
  }
  if (cjkIdx === -1) {
    // No CJK at all — try to peel an MS code prefix anyway
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

function readLinkText($: CheerioAPI, $cell: cheerio.Cheerio<any>): string {
  // Prefer the anchor title (more stable than visible text).
  const $a = $cell.find('a').last() // last anchor: usually the caption link below the image
  if ($a.length) {
    const title = $a.attr('title')
    if (title) return title.trim()
    return $a.text().trim()
  }
  return $cell.text().trim()
}

export function parseBiligame(html: string): {
  records: BiligameKitRecord[]
  errors: string[]
} {
  const $ = cheerio.load(html)
  const errors: string[] = []
  const records: BiligameKitRecord[] = []
  const seen = new Set<string>()

  let $container = $('.mw-parser-output').first()
  if (!$container.length) $container = $('body')

  $container.find('table.wikitable').each((tableIdx, tableEl) => {
    const $table = $(tableEl)

    // Determine if this table is in a P-Bandai / 限定 section
    const $h2 = $table.prevAll('h2').first()
    const heading = $h2.text() || ''
    const isPBandai =
      heading.includes('限定') ||
      heading.toLowerCase().includes('p-bandai') ||
      heading.toLowerCase().includes('premium')

    $table.find('tr').each((rowIdx, rowEl) => {
      const $tr = $(rowEl)
      const cells = $tr.find('td, th')
      if (cells.length === 0) return

      // The table is laid out with repeating (编号, 模型) pairs across columns.
      cells.each((cellIdx, cellEl) => {
        try {
          const $cell = $(cellEl)
          const cellText = $cell.text().trim()
          const m = cellText.match(RG_NUMBER_REGEX)
          if (!m) return
          const num = parseInt(m[1], 10)
          if (Number.isNaN(num)) return

          // The next sibling cell holds the kit info.
          const $infoCell = $cell.next()
          if (!$infoCell.length) return

          const linkText = readLinkText($, $infoCell)
          if (!linkText) return

          const stripped = stripLineMarker(linkText)
          if (!stripped) return

          const { ms_code, name_zh } = splitMsCodeAndName(stripped)
          if (!name_zh && !ms_code) return

          let series_number_normalized = normalizeSeries(num)
          // If P-Bandai, kit numbers may collide with regular ones; namespace them.
          if (isPBandai) {
            const key = `${series_number_normalized}-pb`
            if (seen.has(key)) return
            seen.add(key)
            series_number_normalized = key
          } else {
            if (seen.has(series_number_normalized)) return
            seen.add(series_number_normalized)
          }

          records.push({
            series_number_normalized,
            ms_code,
            name_zh: name_zh || ms_code || '',
            raw_text: linkText,
          })
        } catch (err) {
          errors.push(
            `[biligame table ${tableIdx} row ${rowIdx} cell ${cellIdx}] ${(err as Error).message}`,
          )
        }
      })
    })
  })

  return { records, errors }
}

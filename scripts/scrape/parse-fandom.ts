import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import type { Grade } from '@/lib/types/kit'
import { GRADE_SERIES_PREFIX } from './sources'
import type { FandomKitRecord } from './types'

const FANDOM_BASE = 'https://gundam.fandom.com'

function normalizeSeriesNumber(raw: string, prefix: string): string {
  const m = raw.match(/(\d+)/)
  if (!m) return raw.replace(/\s+/g, '')
  return `${prefix}${parseInt(m[1], 10).toString().padStart(2, '0')}`
}

function parsePriceJpy(raw: string): number {
  if (!raw) return 0
  const cleaned = raw.replace(/[,\s]/g, '')
  const m = cleaned.match(/(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9,
  oct: 10, nov: 11, dec: 12,
}

// Returns ISO-ish "YYYY-MM-DD" string. Day = "00" means day-precision unknown
// (only month known). Month = "00" means only year known.
function parseReleaseDate(raw: string): string {
  if (!raw) return ''
  const text = raw.replace(/\s+/g, ' ').trim()

  let m = text.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`

  // "2010 July 23" — full date
  m = text.match(/(\d{4})\s+([A-Za-z]+)\s+(\d{1,2})/)
  if (m) {
    const month = MONTHS[m[2].toLowerCase()]
    if (month) {
      return `${m[1]}-${String(month).padStart(2, '0')}-${String(parseInt(m[3], 10)).padStart(2, '0')}`
    }
  }

  // "2010 July" — month only
  m = text.match(/(\d{4})\s+([A-Za-z]+)$/)
  if (m) {
    const month = MONTHS[m[2].toLowerCase()]
    if (month) {
      return `${m[1]}-${String(month).padStart(2, '0')}-00`
    }
  }

  // "December 24, 2010" — full date
  m = text.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/)
  if (m) {
    const month = MONTHS[m[1].toLowerCase()]
    if (month) {
      return `${m[3]}-${String(month).padStart(2, '0')}-${String(parseInt(m[2], 10)).padStart(2, '0')}`
    }
  }

  // "December 2010" — month only (no day, no comma)
  m = text.match(/([A-Za-z]+)\s+(\d{4})/)
  if (m) {
    const month = MONTHS[m[1].toLowerCase()]
    if (month) {
      return `${m[2]}-${String(month).padStart(2, '0')}-00`
    }
  }

  m = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (m) {
    return `${m[1]}-${String(parseInt(m[2], 10)).padStart(2, '0')}-${String(parseInt(m[3], 10)).padStart(2, '0')}`
  }

  // "2010/12" — year + month
  m = text.match(/(\d{4})\/(\d{1,2})$/)
  if (m) {
    return `${m[1]}-${String(parseInt(m[2], 10)).padStart(2, '0')}-00`
  }

  // bare year
  m = text.match(/^(\d{4})$/)
  if (m) return `${m[1]}-00-00`

  m = text.match(/(\d{4})/)
  if (m) return `${m[1]}-00-00`

  return ''
}

function cleanFandomImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  let clean = url
  clean = clean.replace(/\/revision\/latest\/scale-to-width-down\/\d+/i, '/revision/latest')
  clean = clean.replace(/\/scale-to-width-down\/\d+/i, '')
  clean = clean.split('?')[0]
  return clean
}

function getImgSrc($img: cheerio.Cheerio<any>): string | undefined {
  const dataSrc = $img.attr('data-src')
  if (dataSrc && !dataSrc.startsWith('data:')) return dataSrc
  const src = $img.attr('src')
  if (src && !src.startsWith('data:')) return src
  return undefined
}

function isHeaderRow($tr: cheerio.Cheerio<any>): boolean {
  return $tr.find('th').length > 0 && $tr.find('td').length === 0
}

type ColumnMap = {
  number?: number
  name?: number
  series?: number
  scale?: number
  price?: number
  date?: number
  image?: number
}

function detectColumnMap($: CheerioAPI, $headerRow: cheerio.Cheerio<any>): ColumnMap {
  const map: ColumnMap = {}
  const cells = $headerRow.find('th, td')
  cells.each((i, el) => {
    const text = $(el).text().trim().toLowerCase()
    if (!text) return
    if (
      map.number === undefined &&
      (text === 'no.' ||
        text === '#' ||
        text === 'no' ||
        text.startsWith('no.') ||
        text === 'kit #' ||
        // grade-agnostic patterns: "RG #", "PGU #", "MG no.", "HGUC No."
        /^[a-z]{1,5}\s*#$/.test(text) ||
        /^[a-z]{1,5}\s*no\.?$/.test(text))
    ) {
      map.number = i
      return
    }
    if (
      map.name === undefined &&
      (text === 'name' ||
        text === 'model' ||
        text === 'mobile suit' ||
        text.includes('mobile suit') ||
        text.includes('model'))
    ) {
      map.name = i
      return
    }
    if (map.series === undefined && (text === 'series' || text === 'source' || text === 'origin' || text.includes('series'))) {
      map.series = i
      return
    }
    if (map.scale === undefined && text.includes('scale')) {
      map.scale = i
      return
    }
    if (map.price === undefined && (text.includes('price') || text.includes('yen'))) {
      map.price = i
      return
    }
    if (map.date === undefined && (text.includes('release') || text.includes('date'))) {
      map.date = i
      return
    }
    if (map.image === undefined && (text.includes('image') || text.includes('box art'))) {
      map.image = i
      return
    }
  })
  return map
}

export function parseFandom(
  html: string,
  grade: Grade,
  opts: { sourceGradePage?: string } = {},
): {
  records: FandomKitRecord[]
  errors: string[]
} {
  const $ = cheerio.load(html)
  const records: FandomKitRecord[] = []
  const errors: string[] = []
  const seriesPrefix = GRADE_SERIES_PREFIX[grade]
  const validSeriesRegex = new RegExp(`^${seriesPrefix}\\d+$`)

  const tables = $('table.wikitable')

  tables.each((tableIdx, table) => {
    const $table = $(table)

    let pBandai = false
    const $prevHeading = $table.prevAll('h2, h3, h4').first()
    const headingText = $prevHeading.text().toLowerCase()
    if (
      headingText.includes('p-bandai') ||
      headingText.includes('premium bandai') ||
      headingText.includes('exclusive')
    ) {
      pBandai = true
    }

    // section context = closest preceding h2 (e.g., "Regulars and Special Editions",
    // or for PG: "Perfect Grade Unleashed").
    // Fandom often wraps wikitables inside <div class="wds-tab__content"> (year tabs),
    // so prevAll('h2') on $table itself is empty. Walk the ancestor chain until
    // we find an element with a preceding h2 sibling.
    let sectionContext = ''
    {
      let $el: typeof $table = $table
      for (let depth = 0; depth < 8 && $el.length && !$el.is('body'); depth++) {
        const $h2 = $el.prevAll('h2').first()
        if ($h2.length) {
          sectionContext = $h2
            .text()
            .replace(/\[\s*edit\s*\]/i, '')
            .replace(/\s+/g, ' ')
            .trim()
          break
        }
        $el = $el.parent()
      }
    }

    const rows = $table.find('tr')
    if (rows.length < 2) return

    // First row = header
    let headerRow = rows.eq(0)
    let map = detectColumnMap($, headerRow)
    if (map.name === undefined && rows.length > 1) {
      headerRow = rows.eq(1)
      map = detectColumnMap($, headerRow)
    }
    if (map.name === undefined) {
      return
    }

    rows.each((rowIdx, rowEl) => {
      const $tr = $(rowEl)
      if (isHeaderRow($tr)) return
      const cells = $tr.find('td')
      if (cells.length === 0) return

      try {
        // number — strip embedded images / figures / wrapping anchors before reading
        // text, otherwise URLs like .../4d/RGGundam-SG.jpg leak in and the digit
        // regex picks up cache-buster timestamps as fake series numbers.
        const numberCell =
          map.number !== undefined ? cells.eq(map.number) : null
        const numberText = numberCell
          ? numberCell.clone().find('img, figure, a, span.mw-editsection').remove().end().text().trim()
          : ''

        // name
        const nameCell = cells.eq(map.name!)
        const nameLink = nameCell.find('a').first()
        const linkTitle = nameLink.attr('title')
        const linkText = nameLink.text().trim()
        const name_en =
          (linkTitle && !linkTitle.startsWith('File:') ? linkTitle : linkText) ||
          nameCell.text().trim()
        if (!name_en) return
        // 捕获完整可见文本（含变体后缀如 "Ver.Ka"/"Unleashed"）
        const cellPlainText = nameCell
          .clone()
          .find('img, figure, .mw-editsection')
          .remove()
          .end()
          .text()
          .replace(/\s+/g, ' ')
          .trim()
        const name_full_text = cellPlainText || linkText || name_en

        // scale
        const scale =
          map.scale !== undefined ? cells.eq(map.scale).text().trim() : '1/144'

        // price
        const priceText =
          map.price !== undefined ? cells.eq(map.price).text() : ''
        const price_jpy = parsePriceJpy(priceText)

        // release date
        const dateText =
          map.date !== undefined ? cells.eq(map.date).text() : ''
        const release_date = parseReleaseDate(dateText)

        // series / source work — read from the per-row "Series" cell
        let source_work_raw: string | undefined
        if (map.series !== undefined) {
          const $sCell = cells.eq(map.series)
          const $sLink = $sCell.find('a').first()
          source_work_raw =
            ($sLink.attr('title') || $sLink.text() || $sCell.text()).trim() ||
            undefined
        }
        if (!source_work_raw && sectionContext) {
          source_work_raw = sectionContext
        }

        // image — Fandom puts the box art in the same cell as the RG number.
        let box_art_url: string | undefined
        const $imgInNumber =
          numberCell && numberCell.length ? numberCell.find('img').first() : null
        if ($imgInNumber && $imgInNumber.length) {
          box_art_url = cleanFandomImageUrl(getImgSrc($imgInNumber))
        }
        if (!box_art_url) {
          const imgCell =
            map.image !== undefined ? cells.eq(map.image) : null
          if (imgCell && imgCell.length) {
            const $img = imgCell.find('img').first()
            if ($img.length) {
              box_art_url = cleanFandomImageUrl(getImgSrc($img))
            }
          }
        }
        if (!box_art_url) {
          // Sometimes Fandom uses <figure><a href="https://static.../full.jpg">; pull href.
          const $figLink =
            (numberCell ? numberCell.find('figure a') : $tr.find('figure a')).first()
          const href = $figLink.attr('href')
          if (href && href.startsWith('http') && /\.(jpg|jpeg|png|webp|gif)/i.test(href)) {
            box_art_url = cleanFandomImageUrl(href)
          }
        }

        // detail page URL
        const href = nameLink.attr('href')
        const detail_page_url = href
          ? href.startsWith('http')
            ? href
            : FANDOM_BASE + href
          : undefined

        // series number
        let series_number = numberText || ''
        if (!series_number) {
          // 兜底：从全行文本里抓 grade-prefixed number ("RG-12" / "MG 100" / "HGUC 234")
          const fallbackRe = new RegExp(`\\b${seriesPrefix}[A-Z]{0,4}[\\s-]?(\\d{1,3})\\b`, 'i')
          const m = $tr.text().match(fallbackRe)
          if (m) series_number = `${seriesPrefix}${m[1]}`
        }
        if (!series_number) return
        const series_number_normalized = normalizeSeriesNumber(series_number, seriesPrefix)
        if (!validSeriesRegex.test(series_number_normalized)) return

        records.push({
          series_number,
          series_number_normalized,
          name_en,
          name_full_text,
          scale: scale || (grade === 'PG' || grade === 'PG-Unleashed' ? '1/60' : grade === 'MG' || grade === 'MG-VerKa' || grade === 'RE100' ? '1/100' : '1/144'),
          price_jpy,
          release_date,
          box_art_url,
          source_work_raw,
          detail_page_url,
          is_p_bandai: pBandai || undefined,
          source_grade_page: opts.sourceGradePage,
          section_heading: sectionContext || undefined,
          raw_html: $.html($tr) ?? '',
        })
      } catch (err) {
        errors.push(
          `[fandom table ${tableIdx} row ${rowIdx}] ${(err as Error).message}`,
        )
      }
    })
  })

  // Deduplicate by (section, series_number_normalized) — prefer the entry with
  // the richest data. Including section_heading prevents PG vs PG-Unleashed
  // (both numbered from 01) from collapsing.
  const byKey = new Map<string, FandomKitRecord>()
  for (const r of records) {
    const key = `${r.section_heading ?? ''}::${r.series_number_normalized}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, r)
      continue
    }
    const score = (rec: FandomKitRecord) =>
      (rec.price_jpy ? 2 : 0) +
      (rec.release_date ? 1 : 0) +
      (rec.box_art_url ? 1 : 0) +
      (rec.detail_page_url ? 1 : 0)
    if (score(r) > score(existing)) {
      byKey.set(key, r)
    }
  }

  // Return sorted by series number for deterministic output.
  const deduped = Array.from(byKey.values()).sort((a, b) => {
    const an = parseInt(a.series_number_normalized.replace(/\D/g, ''), 10)
    const bn = parseInt(b.series_number_normalized.replace(/\D/g, ''), 10)
    return an - bn
  })

  return { records: deduped, errors }
}

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Kit } from '@/lib/types/kit'
import { kitSortKey } from '@/lib/utils/kit'

type Hint = {
  grade: Kit['grade']
  hint_ms_code: string
  hint_name_zh: string
  reason: string
  category: 'beginner' | 'classic' | 'masterpiece' | 'newcomer' | 'endgame'
}

const FEATURED_KIT_HINTS: Hint[] = [
  { grade: 'EG', hint_ms_code: 'RX-78-2', hint_name_zh: '元祖', reason: '新手首选', category: 'beginner' },
  { grade: 'HG', hint_ms_code: 'RX-78-2', hint_name_zh: '元祖 GTO|GTO|元祖', reason: 'HG 入门标杆', category: 'beginner' },
  { grade: 'HG', hint_ms_code: 'ASW-G-08', hint_name_zh: '巴巴托斯', reason: '铁血主角', category: 'beginner' },
  { grade: 'HG', hint_ms_code: 'XVX-016', hint_name_zh: '风灵|Aerial', reason: '水星魔女主角', category: 'beginner' },
  { grade: 'RG', hint_ms_code: 'RX-78-2', hint_name_zh: '高达|元祖', reason: 'RG 入坑', category: 'classic' },
  { grade: 'RG', hint_ms_code: 'MSN-04', hint_name_zh: '沙扎比', reason: '18 年最佳', category: 'masterpiece' },
  { grade: 'RG', hint_ms_code: 'RX-93', hint_name_zh: 'ν 高达|牛高达|牛|Nu', reason: '19 年最佳', category: 'masterpiece' },
  { grade: 'RG', hint_ms_code: 'MSN-06S', hint_name_zh: '新安洲', reason: 'UC 经典', category: 'classic' },
  { grade: 'RG', hint_ms_code: 'RX-0', hint_name_zh: '独角兽|Unicorn', reason: '可爆甲变形', category: 'classic' },
  { grade: 'RG', hint_ms_code: 'MSZ-006', hint_name_zh: 'Z 高达|Zeta', reason: '可变形经典', category: 'classic' },
  { grade: 'RG', hint_ms_code: 'ZGMF-X10A', hint_name_zh: '自由', reason: 'SEED 主角', category: 'classic' },
  { grade: 'RG', hint_ms_code: 'ZGMF-X20A', hint_name_zh: '强袭自由|Strike Freedom', reason: 'SEED 升级版', category: 'classic' },
  { grade: 'MG', hint_ms_code: 'RX-78-2', hint_name_zh: 'Ver.3.0|Ver. 3.0|3.0', reason: 'MG 标杆', category: 'masterpiece' },
  { grade: 'MG', hint_ms_code: 'RX-78-2', hint_name_zh: 'Ver.2.0|Ver. 2.0|2.0', reason: '平价 MG 元祖', category: 'classic' },
  { grade: 'MG-VerKa', hint_ms_code: 'MSN-04', hint_name_zh: '沙扎比', reason: 'MG 巅峰', category: 'masterpiece' },
  { grade: 'MG-VerKa', hint_ms_code: 'RX-93', hint_name_zh: 'ν 高达|牛|Nu', reason: '与卡沙 CP', category: 'masterpiece' },
  { grade: 'MG-VerKa', hint_ms_code: 'XXXG-00W0', hint_name_zh: '飞翼零式|Wing Zero', reason: 'Wing 经典', category: 'masterpiece' },
  { grade: 'MG', hint_ms_code: 'MS-06S', hint_name_zh: '夏亚|扎古|Zaku', reason: '经典扎古', category: 'classic' },
  { grade: 'MG', hint_ms_code: 'ASW-G-08', hint_name_zh: '巴巴托斯', reason: '铁血 MG', category: 'classic' },
  { grade: 'MG', hint_ms_code: 'GN-001', hint_name_zh: '能天使|Exia', reason: '00 主角', category: 'classic' },
  { grade: 'MG', hint_ms_code: 'F91', hint_name_zh: 'F91', reason: '2024 新作良品', category: 'newcomer' },
  { grade: 'MG-VerKa', hint_ms_code: 'RX-0', hint_name_zh: '独角兽|Unicorn', reason: '卡版独角兽', category: 'masterpiece' },
  { grade: 'PG-Unleashed', hint_ms_code: 'RX-0', hint_name_zh: '独角兽|Unicorn', reason: 'PG-U 代表', category: 'endgame' },
  { grade: 'PG-Unleashed', hint_ms_code: 'RX-78-2', hint_name_zh: '元祖', reason: 'PG-U 元祖', category: 'endgame' },
  { grade: 'RE100', hint_ms_code: 'MSN-04II', hint_name_zh: '夜莺|Nightingale', reason: 'RE/100 代表', category: 'masterpiece' },
]

function findMatch(hint: Hint, allKits: Kit[]): Kit | null {
  const candidates = allKits.filter((k) => k.grade === hint.grade)

  // Bidirectional substring on ms_code. Require min length 3 on both sides to
  // avoid spurious matches where a single-letter ms_code (e.g. "V", "S") gets
  // hit by being a literal substring of the hint ("XVX-016" contains "v",
  // "ASW-G-08" contains "s").
  const minLen = 3
  const hintLower = hint.hint_ms_code.toLowerCase()
  const msCodeMatches = candidates.filter((k) => {
    if (!k.ms_code) return false
    const kLower = k.ms_code.toLowerCase()
    if (kLower.length < minLen || hintLower.length < minLen) return false
    return kLower.includes(hintLower) || hintLower.includes(kLower)
  })

  if (msCodeMatches.length === 1) return msCodeMatches[0]

  const keywords = hint.hint_name_zh.split('|').map((s) => s.trim())

  if (msCodeMatches.length > 1) {
    for (const kw of keywords) {
      const refined = msCodeMatches.filter(
        (k) =>
          (k.name_zh ?? '').includes(kw) ||
          (k.name_en ?? '').toLowerCase().includes(kw.toLowerCase()),
      )
      if (refined.length === 1) return refined[0]
      if (refined.length > 0) {
        refined.sort((a, b) => kitSortKey(a) - kitSortKey(b))
        return refined[0]
      }
    }
    msCodeMatches.sort((a, b) => kitSortKey(a) - kitSortKey(b))
    return msCodeMatches[0]
  }

  for (const kw of keywords) {
    const matches = candidates.filter(
      (k) =>
        (k.name_zh ?? '').includes(kw) ||
        (k.name_en ?? '').toLowerCase().includes(kw.toLowerCase()),
    )
    if (matches.length > 0) {
      matches.sort((a, b) => kitSortKey(a) - kitSortKey(b))
      return matches[0]
    }
  }

  return null
}

async function main() {
  const kitsPath = path.join(process.cwd(), 'data', 'kits.json')
  const allKits = JSON.parse(await fs.readFile(kitsPath, 'utf-8')) as Kit[]

  const items: Array<{
    kit_id: string
    reason: string
    category: string
  }> = []
  const unmatched: Hint[] = []
  const matchLog: Array<{
    hint: string
    kit_id: string | null
    name_zh?: string
  }> = []

  for (const hint of FEATURED_KIT_HINTS) {
    const match = findMatch(hint, allKits)
    const hintLabel = `${hint.grade} ${hint.hint_ms_code} ${hint.hint_name_zh}`
    if (match) {
      items.push({
        kit_id: match.id,
        reason: hint.reason,
        category: hint.category,
      })
      matchLog.push({
        hint: hintLabel,
        kit_id: match.id,
        name_zh: match.name_zh,
      })
    } else {
      unmatched.push(hint)
      matchLog.push({ hint: hintLabel, kit_id: null })
    }
  }

  // Duplicate detection
  const dupCheck = new Map<string, number>()
  for (const it of items) {
    dupCheck.set(it.kit_id, (dupCheck.get(it.kit_id) ?? 0) + 1)
  }
  const duplicates = Array.from(dupCheck.entries()).filter(([, n]) => n > 1)

  const outPath = path.join(process.cwd(), 'data', 'featured-kits.json')
  await fs.writeFile(
    outPath,
    JSON.stringify({ version: 1, items }, null, 2) + '\n',
    'utf-8',
  )

  console.log(`\n=== featured-kits.json built (${items.length}/${FEATURED_KIT_HINTS.length}) ===\n`)
  for (const row of matchLog) {
    if (row.kit_id) {
      console.log(`  OK   ${row.hint.padEnd(50)} -> ${row.kit_id}  (${row.name_zh})`)
    } else {
      console.log(`  MISS ${row.hint}`)
    }
  }
  if (unmatched.length) {
    console.log(`\n!! ${unmatched.length} hint(s) unmatched — please specify manually:`)
    for (const h of unmatched) {
      console.log(`   - ${h.grade} ${h.hint_ms_code} (${h.hint_name_zh})`)
    }
  }
  if (duplicates.length) {
    console.log(`\n!! ${duplicates.length} kit_id(s) matched by >1 hint:`)
    for (const [id, n] of duplicates) {
      console.log(`   - ${id} x${n}`)
    }
  }
  console.log(`\nWrote ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import type { Grade } from '@/lib/types/kit'

export const GRADES: Grade[] = [
  'HG', 'RG', 'MG', 'MG-VerKa',
  'PG', 'PG-Unleashed',
  'EG', 'SD', 'SDCS',
  'RE100', 'FM',
]

export const GRADE_LABELS: Record<Grade, string> = {
  'HG': 'HG',
  'RG': 'RG',
  'MG': 'MG',
  'MG-VerKa': 'MG Ver.Ka',
  'PG': 'PG',
  'PG-Unleashed': 'PG Unleashed',
  'EG': 'EG',
  'SD': 'SD',
  'SDCS': 'SDCS',
  'RE100': 'RE/100',
  'FM': 'FM',
}

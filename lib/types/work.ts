export type Era = 'UC' | 'FC' | 'AC' | 'AW' | 'CE' | 'AD' | 'PD' | 'AS' | 'RC' | 'Other'

export type Work = {
  id: string
  title_zh: string
  title_jp: string
  era: Era
  year_aired?: number
}

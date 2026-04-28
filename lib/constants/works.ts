import type { Era } from '@/lib/types/work'

export const ERAS: Era[] = [
  'UC', 'FC', 'AC', 'AW', 'CE', 'AD', 'PD', 'AS', 'RC',
  'AG', 'BF', 'CC',
  'Other',
]

export const ERA_LABELS: Record<Era, string> = {
  UC: 'Universal Century',
  FC: 'Future Century',
  AC: 'After Colony',
  AW: 'After War',
  CE: 'Cosmic Era',
  AD: 'Anno Domini',
  PD: 'Post Disaster',
  AS: 'Advanced Generation',
  RC: 'Regild Century',
  AG: 'Advanced Generation (AGE)',
  BF: 'Build Fighters',
  CC: 'Correct Century',
  Other: 'Other',
}

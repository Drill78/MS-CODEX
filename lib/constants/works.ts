import type { Era } from '@/lib/types/work'

export const ERAS: Era[] = [
  'UC', 'FC', 'AC', 'AW', 'CE', 'AD', 'PD', 'AS', 'RC', 'Other',
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
  Other: 'Other',
}

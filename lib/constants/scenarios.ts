import type { Scenario, Level, Tier } from '@/lib/types/tool'

export const SCENARIOS: Scenario[] = [
  'basic', 'brush-paint', 'spray-paint', 'modify', 'weathering',
]

export const SCENARIO_LABELS: Record<Scenario, string> = {
  'basic': '入门基础',
  'brush-paint': '笔涂上色',
  'spray-paint': '喷涂上色',
  'modify': '改造',
  'weathering': '旧化',
}

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: '新手',
  intermediate: '进阶',
  advanced: '高阶',
}

export const TIERS: Tier[] = ['budget', 'value', 'premium']

export const TIER_LABELS: Record<Tier, string> = {
  budget: '入门档',
  value: '性价比档',
  premium: '高端档',
}

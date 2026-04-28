import type { ColorSeparation, DecalType, Grade } from '@/lib/types/kit'

export const DIFFICULTY_DEFAULTS: Record<
  Grade,
  { build: 1 | 2 | 3 | 4 | 5; paint: 1 | 2 | 3 | 4 | 5 }
> = {
  HG: { build: 2, paint: 3 },
  RG: { build: 4, paint: 2 },
  MG: { build: 3, paint: 4 },
  'MG-VerKa': { build: 4, paint: 4 },
  PG: { build: 5, paint: 5 },
  'PG-Unleashed': { build: 5, paint: 5 },
  EG: { build: 1, paint: 2 },
  SD: { build: 1, paint: 3 },
  SDCS: { build: 1, paint: 2 },
  RE100: { build: 3, paint: 3 },
  FM: { build: 4, paint: 4 },
}

export const COLOR_SEPARATION_DEFAULTS: Record<Grade, ColorSeparation> = {
  HG: 'fair',
  RG: 'good',
  MG: 'good',
  'MG-VerKa': 'excellent',
  PG: 'excellent',
  'PG-Unleashed': 'excellent',
  EG: 'fair',
  SD: 'fair',
  SDCS: 'fair',
  RE100: 'good',
  FM: 'excellent',
}

export const DECALS_DEFAULTS: Record<Grade, DecalType> = {
  HG: 'sticker',
  RG: 'water-slide',
  MG: 'water-slide',
  'MG-VerKa': 'water-slide',
  PG: 'both',
  'PG-Unleashed': 'both',
  EG: 'sticker',
  SD: 'sticker',
  SDCS: 'sticker',
  RE100: 'water-slide',
  FM: 'water-slide',
}

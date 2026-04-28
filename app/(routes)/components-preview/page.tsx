'use client'

import { useState } from 'react'
import type { Work } from '@/lib/types/work'
import type { Kit } from '@/lib/types/kit'
import type { Tool } from '@/lib/types/tool'
import { GRADES } from '@/lib/constants/grades'
import {
  BlueprintFrame,
  ScanlineOverlay,
  DataField,
  GradeBadge,
  WorkBadge,
  DifficultyMeter,
  TierCard,
  KitCard,
  HangarSlot,
  ToolPegboardSlot,
  StatusToggle,
  FilterPanel,
  type FilterGroup,
  type StatusToggleValue,
} from '@/components/atoms'

// =====================================================================
// MOCKS — preview only, deleted with this page
// =====================================================================

const MOCK_WORK_UC: Work = {
  id: 'msg-0079',
  title_zh: '机动战士高达',
  title_jp: '機動戦士ガンダム',
  era: 'UC',
  year_aired: 1979,
}
const MOCK_WORK_CE: Work = {
  id: 'seed',
  title_zh: '高达 SEED',
  title_jp: '機動戦士ガンダムSEED',
  era: 'CE',
  year_aired: 2002,
}
const MOCK_WORK_AD: Work = {
  id: '00',
  title_zh: '高达 00',
  title_jp: '機動戦士ガンダム00',
  era: 'AD',
  year_aired: 2007,
}
const MOCK_WORK_AC: Work = {
  id: 'wing',
  title_zh: '高达 W',
  title_jp: '新機動戦記ガンダムW',
  era: 'AC',
  year_aired: 1995,
}
const MOCK_WORK_FC: Work = {
  id: 'g-gundam',
  title_zh: 'G 高达',
  title_jp: '機動武闘伝Gガンダム',
  era: 'FC',
  year_aired: 1994,
}

const MOCK_KIT_RX78: Kit = {
  id: 'rg-rx-78-2',
  grade: 'RG',
  series_number: '01',
  name_zh: 'RX-78-2 高达',
  name_jp: 'RX-78-2 ガンダム',
  ms_code: 'RX-78-2',
  scale: '1/144',
  price_jpy: 2750,
  release_date: '2010-07-24',
  height_mm: 125,
  source_works: [MOCK_WORK_UC],
  difficulty_build: 3,
  difficulty_paint: 4,
  color_separation: 'good',
  decals: 'water-slide',
  source_url: '#',
}

const MOCK_KIT_NU: Kit = {
  id: 'mg-nu-verka',
  grade: 'MG-VerKa',
  series_number: '193',
  name_zh: 'ν 高达 Ver.Ka',
  name_jp: 'νガンダム Ver.Ka',
  ms_code: 'RX-93',
  scale: '1/100',
  price_jpy: 7150,
  release_date: '2014-06-21',
  height_mm: 220,
  source_works: [MOCK_WORK_UC],
  difficulty_build: 5,
  difficulty_paint: 5,
  color_separation: 'excellent',
  decals: 'water-slide',
  source_url: '#',
}

const MOCK_KIT_FREEDOM: Kit = {
  id: 'hg-freedom',
  grade: 'HG',
  series_number: '192',
  name_zh: '自由高达',
  name_jp: 'フリーダムガンダム',
  ms_code: 'ZGMF-X10A',
  scale: '1/144',
  price_jpy: 1650,
  release_date: '2014-09-14',
  height_mm: 125,
  source_works: [MOCK_WORK_CE],
  difficulty_build: 2,
  difficulty_paint: 3,
  color_separation: 'good',
  decals: 'sticker',
  source_url: '#',
}

const MOCK_TOOL_NIPPER: Tool = {
  id: 'nipper-01',
  category: 'cutting',
  name_zh: '模型剪',
  name_en: 'Side Cutter',
  description: '入门必备，剪流道用',
  scenarios: ['basic'],
  level_tags: ['beginner'],
  recommended_for_grades: ['HG', 'RG', 'MG'],
  tiers: [
    {
      tier: 'budget',
      product_name: '国产斜口钳（无品牌）',
      brand: '杂牌',
      price_cny: 15,
      channels: [{ platform: 'taobao' }, { platform: '1688' }],
      notes: '能用就行，预期 1-2 个月换',
    },
    {
      tier: 'value',
      product_name: 'Tamiya 74035',
      brand: 'Tamiya',
      price_cny: 90,
      channels: [
        { platform: 'taobao' },
        { platform: 'jd' },
        { platform: 'amiami' },
      ],
    },
    {
      tier: 'premium',
      product_name: 'God Hand SPN-120 单刃精密钳',
      brand: 'God Hand',
      price_cny: 380,
      channels: [{ platform: 'amiami' }, { platform: 'official' }],
      notes: '顶级单刃，水口几乎不发白',
    },
  ],
}

// =====================================================================
// Section helper
// =====================================================================

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="mt-10 border-t pt-8"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
      }}
    >
      <div className="font-mono text-sm tracking-widest text-[var(--color-accent-cyan)]">
        {`// ${title}`}
      </div>
      {hint && (
        <div className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
          {hint}
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-start gap-4">{children}</div>
    </section>
  )
}

// =====================================================================
// Page
// =====================================================================

export default function ComponentsPreviewPage() {
  const [status, setStatus] = useState<StatusToggleValue>('untracked')
  const [filters, setFilters] = useState<Record<string, string[]>>({
    grade: ['HG', 'RG'],
    work: [],
    difficulty: [],
  })

  const filterGroups: FilterGroup[] = [
    {
      id: 'grade',
      label: '规格',
      selected: filters.grade ?? [],
      options: GRADES.map((g) => ({
        value: g,
        label: g,
        count: 50 + (g.length * 17) % 200,
      })),
    },
    {
      id: 'work',
      label: '作品',
      selected: filters.work ?? [],
      options: [
        { value: 'uc', label: 'UC 系列', count: 351 },
        { value: 'ce', label: 'CE / SEED', count: 82 },
        { value: 'ad', label: 'AD / 00', count: 64 },
        { value: 'ac', label: 'AC / W', count: 38 },
      ],
    },
    {
      id: 'difficulty',
      label: '组装难度',
      selected: filters.difficulty ?? [],
      multi: false,
      options: [
        { value: '1', label: '★1' },
        { value: '2', label: '★2' },
        { value: '3', label: '★3' },
        { value: '4', label: '★4' },
        { value: '5', label: '★5' },
      ],
    },
  ]

  return (
    <div className="container mx-auto px-6 py-12">
      <h1
        className="font-display text-5xl leading-none tracking-wider"
        style={{ color: 'var(--color-text-primary)' }}
      >
        COMPONENTS PREVIEW
      </h1>
      <p className="mt-2 font-mono text-sm tracking-widest text-[var(--color-text-secondary)]">
        {'// 组件画廊 // v0.0.2 — TEMPORARY (will be removed before launch)'}
      </p>

      <Section title="BlueprintFrame" hint="UC 说明书风四角块边框 / 三种 variant">
        <div className="h-32 w-64">
          <BlueprintFrame variant="default" className="h-full">
            <div className="flex h-full items-center justify-center font-mono text-sm text-[var(--color-text-primary)]">
              variant=default
            </div>
          </BlueprintFrame>
        </div>
        <div className="h-32 w-64">
          <BlueprintFrame variant="magenta" className="h-full">
            <div className="flex h-full items-center justify-center font-mono text-sm text-[var(--color-accent-magenta)]">
              variant=magenta
            </div>
          </BlueprintFrame>
        </div>
        <div className="h-32 w-64">
          <BlueprintFrame variant="cyan" className="h-full">
            <div className="flex h-full items-center justify-center font-mono text-sm text-[var(--color-accent-cyan)]">
              variant=cyan
            </div>
          </BlueprintFrame>
        </div>
      </Section>

      <Section
        title="ScanlineOverlay"
        hint="CRT 扫线装饰层（套在 BlueprintFrame 内做演示）"
      >
        <div className="h-48 w-96">
          <BlueprintFrame variant="cyan" className="h-full">
            <div
              className="relative h-full p-6 font-mono text-sm"
              style={{
                background:
                  'color-mix(in srgb, var(--color-bg-paper) 50%, transparent)',
              }}
            >
              <div className="text-[var(--color-accent-cyan)]">
                {'// MS-CODEX TERMINAL'}
              </div>
              <div className="mt-2 text-[var(--color-text-primary)]">
                SIGNAL ▸ STABLE
              </div>
              <div className="mt-1 text-[var(--color-text-secondary)]">
                BAUD ▸ 9600
              </div>
              <ScanlineOverlay />
            </div>
          </BlueprintFrame>
        </div>
      </Section>

      <Section title="DataField" hint="蓝图技术字段 horizontal × 3 + vertical × 2">
        <div className="flex flex-col gap-2">
          <DataField label="比例" value="1/144" />
          <DataField label="价格" value="2,750" unit="JPY" />
          <DataField label="发售" value="2010-07-24" />
        </div>
        <DataField label="高度" value="125" unit="mm" orientation="vertical" />
        <DataField label="代号" value="RX-78-2" orientation="vertical" />
      </Section>

      <Section title="GradeBadge" hint="11 种 grade × 3 种 size">
        <div className="flex w-full flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            sm
          </span>
          {GRADES.map((g) => (
            <GradeBadge key={`sm-${g}`} grade={g} size="sm" />
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            md
          </span>
          {GRADES.map((g) => (
            <GradeBadge key={`md-${g}`} grade={g} />
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            lg
          </span>
          {GRADES.map((g) => (
            <GradeBadge key={`lg-${g}`} grade={g} size="lg" />
          ))}
        </div>
      </Section>

      <Section title="WorkBadge" hint="按 era 着色">
        <WorkBadge work={MOCK_WORK_UC} showYear />
        <WorkBadge work={MOCK_WORK_CE} showYear />
        <WorkBadge work={MOCK_WORK_AD} showYear />
        <WorkBadge work={MOCK_WORK_AC} showYear />
        <WorkBadge work={MOCK_WORK_FC} showYear />
      </Section>

      <Section title="DifficultyMeter" hint="信号灯式难度，1-2 绿 / 3 琥珀 / 4-5 红">
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <DifficultyMeter key={v} value={v as 1 | 2 | 3 | 4 | 5} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <DifficultyMeter value={2} label="BUILD" />
          <DifficultyMeter value={4} label="PAINT" />
          <DifficultyMeter value={5} label="MOD" />
        </div>
      </Section>

      <Section title="TierCard" hint="工具三档卡片，value 档示例 isOwned">
        <div className="w-72">
          <TierCard tier={MOCK_TOOL_NIPPER.tiers[0]!} />
        </div>
        <div className="w-72">
          <TierCard
            tier={MOCK_TOOL_NIPPER.tiers[1]!}
            isOwned
            onToggleOwned={() => {}}
          />
        </div>
        <div className="w-72">
          <TierCard tier={MOCK_TOOL_NIPPER.tiers[2]!} />
        </div>
      </Section>

      <Section title="KitCard" hint="3 种状态 × 3 种 grade">
        <div className="w-72">
          <KitCard kit={MOCK_KIT_RX78} status="untracked" />
        </div>
        <div className="w-72">
          <KitCard kit={MOCK_KIT_NU} status="wishlist" />
        </div>
        <div className="w-72">
          <KitCard kit={MOCK_KIT_FREEDOM} status="completed" />
        </div>
        <div className="w-72">
          <KitCard kit={MOCK_KIT_RX78} status="building" />
        </div>
        <div className="w-72">
          <KitCard kit={MOCK_KIT_NU} status="painted" />
        </div>
        <div className="w-72">
          <KitCard kit={MOCK_KIT_FREEDOM} status="owned" />
        </div>
      </Section>

      <Section title="HangarSlot" hint="已拥有 vs 未拥有，正方形">
        <div className="w-48">
          <HangarSlot kit={MOCK_KIT_RX78} owned={false} />
        </div>
        <div className="w-48">
          <HangarSlot kit={MOCK_KIT_RX78} owned={true} />
        </div>
        <div className="w-48">
          <HangarSlot kit={MOCK_KIT_NU} owned={true} />
        </div>
        <div className="w-48">
          <HangarSlot kit={MOCK_KIT_FREEDOM} owned={false} />
        </div>
      </Section>

      <Section title="ToolPegboardSlot" hint="挂钩位 / 未拥有 + 三档颜色">
        <div className="w-32">
          <ToolPegboardSlot tool={MOCK_TOOL_NIPPER} owned={false} />
        </div>
        <div className="w-32">
          <ToolPegboardSlot tool={MOCK_TOOL_NIPPER} owned tierOwned="budget" />
        </div>
        <div className="w-32">
          <ToolPegboardSlot tool={MOCK_TOOL_NIPPER} owned tierOwned="value" />
        </div>
        <div className="w-32">
          <ToolPegboardSlot tool={MOCK_TOOL_NIPPER} owned tierOwned="premium" />
        </div>
      </Section>

      <Section title="StatusToggle" hint="点击切换；当前值显示在右侧">
        <StatusToggle value={status} onChange={setStatus} />
        <span className="self-center font-mono text-xs text-[var(--color-text-muted)]">
          current ▸{' '}
          <span className="text-[var(--color-text-primary)]">{status}</span>
        </span>
      </Section>

      <Section title="FilterPanel" hint="3 个 group：规格（多选）/ 作品（多选）/ 难度（单选）">
        <div className="w-80">
          <FilterPanel
            groups={filterGroups}
            onChange={(id, selected) =>
              setFilters((prev) => ({ ...prev, [id]: selected }))
            }
          />
        </div>
        <div className="font-mono text-xs text-[var(--color-text-muted)]">
          state ▸{' '}
          <span className="text-[var(--color-text-primary)]">
            {JSON.stringify(filters)}
          </span>
        </div>
      </Section>
    </div>
  )
}

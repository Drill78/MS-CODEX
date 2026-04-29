'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BlueprintFrame,
  DataField,
  DifficultyMeter,
  GradeBadge,
  StatusToggle,
  WorkBadge,
  type StatusToggleValue,
} from '@/components/atoms'
import {
  COLOR_SEPARATION_LABEL,
  DECAL_LABEL,
  formatPriceJpy,
  formatReleaseDate,
} from '@/lib/utils/kit'
import { useUserStore, useHydrated } from '@/lib/store/user-state'
import type { Kit } from '@/lib/types/kit'

export function HangarDetail({ kit }: { kit: Kit }) {
  const hydrated = useHydrated()
  const ownership = useUserStore((s) => s.kits[kit.id])
  const setKitStatus = useUserStore((s) => s.setKitStatus)
  const setKitNotes = useUserStore((s) => s.setKitNotes)

  const status: StatusToggleValue = ownership?.status ?? 'untracked'

  return (
    <div className="container mx-auto px-6 py-8">
      <Link
        href="/hangar"
        className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-cyan)]"
      >
        ← 返回机库
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BoxArtPanel kit={kit} />
        </div>

        <div className="space-y-6">
          <TitleSection kit={kit} />
          <DataSection kit={kit} />
          <WorksSection kit={kit} />
          <StatusSection
            kit={kit}
            hydrated={hydrated}
            status={status}
            initialNotes={hydrated ? (ownership?.notes ?? '') : ''}
            onStatusChange={(next) => setKitStatus(kit.id, next)}
            onNotesSave={(notes) => setKitNotes(kit.id, notes)}
          />
          <ToolboxPlaceholder />
        </div>
      </div>
    </div>
  )
}

function TitleSection({ kit }: { kit: Kit }) {
  return (
    <header>
      <div className="flex items-center gap-3">
        <GradeBadge grade={kit.grade} size="md" />
        {kit.series_number && (
          <span className="font-mono text-xs tabular-nums tracking-widest text-[var(--color-text-muted)]">
            #{kit.series_number}
          </span>
        )}
        {kit.is_p_bandai && (
          <span
            className="border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
            style={{
              color: 'var(--color-accent-magenta)',
              borderColor: 'var(--color-accent-magenta)',
            }}
          >
            P-Bandai
          </span>
        )}
      </div>

      {kit.ms_code && (
        <div
          className="mt-4 font-display text-6xl leading-none tracking-wider"
          style={{ color: 'var(--color-accent-magenta)' }}
        >
          {kit.ms_code}
        </div>
      )}

      <h1 className="mt-3 text-2xl text-[var(--color-text-primary)] sm:text-3xl">
        {kit.name_zh}
      </h1>
      <div className="mt-1 space-y-0.5 text-sm text-[var(--color-text-secondary)]">
        {kit.name_jp && <div>{kit.name_jp}</div>}
        {kit.name_en && <div className="font-mono text-xs">{kit.name_en}</div>}
      </div>
    </header>
  )
}

function DataSection({ kit }: { kit: Kit }) {
  return (
    <BlueprintFrame className="p-6">
      <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
        ── DATA ──
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <DataField label="比例" value={kit.scale} orientation="vertical" />
        <DataField
          label="价格"
          value={formatPriceJpy(kit.price_jpy, kit._meta?.price_uncertain)}
          orientation="vertical"
        />
        <DataField
          label="发售"
          value={formatReleaseDate(kit.release_date)}
          orientation="vertical"
        />
        <DataField
          label="高度"
          value={kit.height_mm ?? '—'}
          unit={kit.height_mm ? 'mm' : undefined}
          orientation="vertical"
        />

        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm tracking-wider text-[var(--color-text-secondary)]">
            组装难度
          </span>
          <DifficultyMeter value={kit.difficulty_build} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm tracking-wider text-[var(--color-text-secondary)]">
            涂装难度
          </span>
          <DifficultyMeter value={kit.difficulty_paint} />
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-sm tracking-wider text-[var(--color-text-secondary)]">
            分色
          </span>
          <span
            className="font-mono text-base tabular-nums"
            style={{
              color:
                kit.color_separation === 'requires-paint'
                  ? 'var(--color-uc-amber)'
                  : kit.color_separation === 'excellent'
                    ? 'var(--color-uc-green)'
                    : 'var(--color-text-primary)',
            }}
          >
            {COLOR_SEPARATION_LABEL[kit.color_separation]}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-sm tracking-wider text-[var(--color-text-secondary)]">
            贴纸
          </span>
          <span className="font-mono text-base tabular-nums text-[var(--color-text-primary)]">
            {DECAL_LABEL[kit.decals]}
          </span>
        </div>
      </div>
    </BlueprintFrame>
  )
}

function WorksSection({ kit }: { kit: Kit }) {
  return (
    <BlueprintFrame className="p-6">
      <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
        ── 出自作品 ──
      </h3>
      <div className="flex flex-wrap items-center gap-3">
        {kit.source_works.map((w) => (
          <WorkBadge key={w.id} work={w} showYear />
        ))}
        {kit.related_works?.length ? (
          <>
            <span className="text-[var(--color-text-muted)]">·</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
              related
            </span>
            {kit.related_works.map((w) => (
              <WorkBadge key={w.id} work={w} />
            ))}
          </>
        ) : null}
      </div>
    </BlueprintFrame>
  )
}

function StatusSection({
  kit,
  hydrated,
  status,
  initialNotes,
  onStatusChange,
  onNotesSave,
}: {
  kit: Kit
  hydrated: boolean
  status: StatusToggleValue
  initialNotes: string
  onStatusChange: (next: StatusToggleValue) => void
  onNotesSave: (notes: string) => void
}) {
  return (
    <BlueprintFrame variant="magenta" className="p-6">
      <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
        ── 状态 ──
      </h3>
      <StatusToggle
        value={hydrated ? status : 'untracked'}
        onChange={onStatusChange}
      />
      <NotesField kitId={kit.id} initial={initialNotes} onSave={onNotesSave} />
    </BlueprintFrame>
  )
}

function ToolboxPlaceholder() {
  return (
    <BlueprintFrame variant="cyan" className="p-6">
      <h3 className="mb-3 font-mono text-sm uppercase tracking-widest text-[var(--color-text-secondary)]">
        ── 拼这台你需要 ──
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        工具数据库即将上线 —— 这里会自动列出拼装本机体推荐的工具组合。
      </p>
    </BlueprintFrame>
  )
}

function BoxArtPanel({ kit }: { kit: Kit }) {
  if (!kit.box_art_url) {
    return (
      <BlueprintFrame className="aspect-square">
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-muted)]">
            BOX ART // PENDING
          </span>
          <span
            className="font-display text-5xl tracking-wider"
            style={{ color: 'var(--color-accent-magenta)' }}
          >
            {kit.ms_code ?? '???'}
          </span>
        </div>
      </BlueprintFrame>
    )
  }

  return (
    <BlueprintFrame className="overflow-hidden">
      <div className="relative aspect-square w-full bg-[var(--color-bg-elevated)]">
        <Image
          src={kit.box_art_url}
          alt={`${kit.name_zh} box art`}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-contain"
          {...(kit.box_art_lqip
            ? { placeholder: 'blur' as const, blurDataURL: kit.box_art_lqip }
            : {})}
          unoptimized
          priority
        />
      </div>
    </BlueprintFrame>
  )
}

function NotesField({
  kitId,
  initial,
  onSave,
}: {
  kitId: string
  initial: string
  onSave: (notes: string) => void
}) {
  const [value, setValue] = useState(initial)

  useEffect(() => {
    setValue(initial)
  }, [initial, kitId])

  return (
    <div className="mt-5">
      <label
        htmlFor={`notes-${kitId}`}
        className="font-mono text-sm tracking-wider text-[var(--color-text-secondary)]"
      >
        备注
      </label>
      <textarea
        id={`notes-${kitId}`}
        value={value}
        maxLength={200}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value !== initial) onSave(value)
        }}
        rows={3}
        placeholder="拼装计划、改造点、链接 …（≤200 字）"
        className="mt-1 w-full resize-none border bg-transparent px-3 py-2 font-mono text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none"
        style={{
          borderColor:
            'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
          color: 'var(--color-text-primary)',
        }}
      />
      <div className="mt-1 text-right font-mono text-[10px] tabular-nums text-[var(--color-text-muted)]">
        {value.length} / 200
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { BlueprintFrame } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { useHydrated, useUserStore } from '@/lib/store/user-state'

export function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const hydrated = useHydrated()
  const kits = useUserStore((s) => s.kits)
  const tools = useUserStore((s) => s.tools)
  const exportData = useUserStore((s) => s.exportData)
  const importData = useUserStore((s) => s.importData)
  const resetData = useUserStore((s) => s.resetData)

  const [status, setStatus] = useState<
    { kind: 'ok' | 'err'; text: string } | null
  >(null)

  const kitsCount = useMemo(() => Object.keys(kits).length, [kits])
  const ownedToolsCount = useMemo(
    () => Object.values(tools).filter((t) => t.owned).length,
    [tools],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ms-codex-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setStatus({ kind: 'ok', text: '✓ 已下载备份文件' })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const result = importData(text)
      if (result.ok) {
        setStatus({
          kind: 'ok',
          text: `✓ 已合并 ${result.imported.kits} 台机体 / ${result.imported.tools} 件工具`,
        })
      } else {
        setStatus({ kind: 'err', text: `✗ 导入失败：${result.error}` })
      }
    } catch (err) {
      setStatus({
        kind: 'err',
        text: `✗ 读取文件失败：${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      e.target.value = ''
    }
  }

  const handleReset = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        '确认清空所有机体标注和工具记录？此操作不可撤销。建议先导出备份。',
      )
    ) {
      resetData()
      setStatus({ kind: 'ok', text: '✓ 已清空所有数据' })
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm"
        style={{
          background:
            'color-mix(in srgb, var(--color-bg-deep) 70%, transparent)',
        }}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <aside
        className="fixed bottom-0 right-0 top-0 z-50 w-full overflow-y-auto border-l shadow-2xl sm:w-[90vw] sm:max-w-md"
        style={{
          background: 'var(--color-bg-paper)',
          borderColor:
            'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="设置"
      >
        <header
          className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
          style={{
            background: 'var(--color-bg-paper)',
            borderColor:
              'color-mix(in srgb, var(--color-text-muted) 30%, transparent)',
          }}
        >
          <div>
            <h2 className="font-display text-3xl tracking-wider">SETTINGS</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              {'// 设置'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="font-mono text-xl text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-magenta)]"
          >
            ✕
          </button>
        </header>

        <div className="space-y-6 px-6 py-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            {'// 数据管理'}
          </p>

          {/* EXPORT */}
          <BlueprintFrame variant="default" className="p-4">
            <div className="space-y-3">
              <h3 className="font-mono text-sm uppercase tracking-wider text-[var(--color-accent-cyan)]">
                {'// EXPORT 导出'}
              </h3>
              <div className="font-mono text-xs tabular-nums text-[var(--color-text-secondary)]">
                <p>
                  当前数据：机体标注{' '}
                  <span className="text-[var(--color-text-primary)]">
                    {hydrated ? kitsCount : 0}
                  </span>{' '}
                  台，工具拥有{' '}
                  <span className="text-[var(--color-text-primary)]">
                    {hydrated ? ownedToolsCount : 0}
                  </span>{' '}
                  件
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={!hydrated}
                className="w-full border py-2 font-mono text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-accent-cyan)',
                  color: 'var(--color-accent-cyan)',
                }}
              >
                ↓ 下载 BACKUP.JSON
              </button>
            </div>
          </BlueprintFrame>

          {/* IMPORT */}
          <BlueprintFrame variant="default" className="p-4">
            <div className="space-y-3">
              <h3 className="font-mono text-sm uppercase tracking-wider text-[var(--color-accent-cyan)]">
                {'// IMPORT 导入'}
              </h3>
              <p className="font-mono text-xs text-[var(--color-text-secondary)]">
                选择之前导出的 JSON 文件。导入数据会与当前数据合并，同 ID
                以更新时间较新的为准。
              </p>
              <label
                className="block w-full cursor-pointer border py-2 text-center font-mono text-sm uppercase tracking-wider transition-colors"
                style={{
                  borderColor: 'var(--color-accent-cyan)',
                  color: 'var(--color-accent-cyan)',
                }}
              >
                ↑ 选择文件
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </div>
          </BlueprintFrame>

          {/* STATUS */}
          {status && (
            <p
              className={cn(
                'font-mono text-xs',
                status.kind === 'ok'
                  ? 'text-[var(--color-uc-green)]'
                  : 'text-[var(--color-uc-red)]',
              )}
            >
              {status.text}
            </p>
          )}

          {/* RESET */}
          <BlueprintFrame variant="default" className="p-4">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h3 className="font-mono text-sm uppercase tracking-wider text-[var(--color-uc-red)]">
                  {'// RESET 重置'}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-uc-red)]">
                  ⚠ 不可撤销
                </span>
              </div>
              <p className="font-mono text-xs text-[var(--color-text-secondary)]">
                清空所有机体标注和工具记录。建议先导出备份。
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="w-full border py-2 font-mono text-sm uppercase tracking-wider transition-colors"
                style={{
                  borderColor: 'var(--color-uc-red)',
                  color: 'var(--color-uc-red)',
                }}
              >
                清空所有数据
              </button>
            </div>
          </BlueprintFrame>

          {/* ABOUT */}
          <div className="space-y-2 border-t pt-4 font-mono text-xs leading-relaxed text-[var(--color-text-muted)]"
            style={{
              borderColor:
                'color-mix(in srgb, var(--color-text-muted) 20%, transparent)',
            }}
          >
            <p className="uppercase tracking-widest">{'// 关于'}</p>
            <p>所有数据存储在浏览器的 localStorage 中，不会上传到任何服务器。</p>
            <p>换设备 / 换浏览器请使用导入导出功能。</p>
          </div>
        </div>
      </aside>
    </>
  )
}

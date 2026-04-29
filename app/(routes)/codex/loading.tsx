import { BlueprintFrame } from '@/components/atoms'

export default function CodexLoading() {
  return (
    <div className="container mx-auto px-6 py-10">
      <BlueprintFrame className="p-12">
        <div className="flex items-center justify-center gap-3 py-12 font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">
          <span className="animate-pulse text-[var(--color-accent-cyan)]">
            LOADING //
          </span>
          <span>PERSONAL CODEX</span>
        </div>
      </BlueprintFrame>
    </div>
  )
}

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-7rem)] items-center justify-center px-6 py-16">
      <div
        className="relative w-full max-w-3xl border p-12"
        style={{
          borderColor: 'var(--color-text-secondary)',
          background:
            'color-mix(in srgb, var(--color-bg-paper) 60%, transparent)',
        }}
      >
        <div
          className="absolute -top-3 left-6 px-2 font-mono text-xs tracking-widest"
          style={{
            background: 'var(--color-bg-deep)',
            color: 'var(--color-text-secondary)',
          }}
        >
          BLUEPRINT // FRAME-001
        </div>

        <h1
          className="text-center text-7xl leading-none tracking-wider md:text-8xl"
          style={{
            fontFamily: 'var(--font-vt323), var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          MS-CODEX
        </h1>

        <p
          className="mt-6 text-center font-mono text-sm tracking-[0.3em]"
          style={{ color: 'var(--color-accent-cyan)' }}
        >
          GUNPLA BEGINNER CODEX // v0.0.1
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 font-mono text-sm tracking-widest">
          <Link
            href="/toolbox"
            className="border px-6 py-3 transition-colors"
            style={{
              borderColor: 'var(--color-accent-magenta)',
              color: 'var(--color-accent-magenta)',
            }}
          >
            ▸ TOOLBOX
          </Link>
          <Link
            href="/hangar"
            className="border px-6 py-3 transition-colors"
            style={{
              borderColor: 'var(--color-accent-cyan)',
              color: 'var(--color-accent-cyan)',
            }}
          >
            ▸ HANGAR
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHydrated, useUserStore } from '@/lib/store/user-state'

type NavLink = {
  href: string
  label: string
  badge?: 'kit-total' | 'my-count'
}

const NAV_LINKS: NavLink[] = [
  { href: '/toolbox', label: 'TOOLBOX' },
  { href: '/hangar', label: 'HANGAR', badge: 'kit-total' },
  { href: '/codex', label: 'CODEX', badge: 'my-count' },
  { href: '/loadouts', label: 'LOADOUTS' },
  { href: '/about', label: 'ABOUT' },
]

export function TopNav({ kitTotal }: { kitTotal?: number }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const userKits = useUserStore((s) => s.kits)
  const myCount = hydrated
    ? Object.values(userKits).filter((v) => v.status !== 'wishlist').length
    : 0

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        background: 'color-mix(in srgb, var(--color-bg-deep) 80%, transparent)',
        borderColor: 'var(--color-grid-line)',
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-lg font-semibold tracking-widest"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span
            className="border px-2 py-1"
            style={{ borderColor: 'var(--color-text-secondary)' }}
          >
            MS-CODEX
          </span>
        </Link>

        <nav className="flex items-center gap-6 font-mono text-sm tracking-wider">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            const badgeValue =
              link.badge === 'kit-total'
                ? kitTotal
                : link.badge === 'my-count'
                  ? hydrated
                    ? myCount
                    : null
                  : null

            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative inline-flex items-baseline gap-1.5 transition-colors hover:[--hover-on:1]"
                style={{
                  color: isActive
                    ? 'var(--color-accent-magenta)'
                    : 'var(--color-text-primary)',
                }}
              >
                <span className="navlink-label">{link.label}</span>
                {badgeValue != null && (
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {link.badge === 'my-count' ? `我:${badgeValue}` : badgeValue}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* TODO: 实现导出/导入功能 */}
        <button
          type="button"
          aria-label="导出/导入"
          title="导出/导入（待实现）"
          className="font-mono text-lg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ⚙
        </button>
      </div>

      <style>{`
        .navlink-label::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 1px;
          background: var(--color-accent-cyan);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 150ms ease-out;
        }
        a:hover .navlink-label::after { transform: scaleX(1); }
      `}</style>
    </header>
  )
}

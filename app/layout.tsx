import type { Metadata } from 'next'
import { Geist, Geist_Mono, VT323 } from 'next/font/google'
import { TopNav } from '@/components/layout/TopNav'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const vt323 = VT323({
  variable: '--font-vt323',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MS-CODEX',
  description: '高达模型拼装入门导航 / Gunpla Beginner Codex',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} antialiased`}
        style={
          {
            // Re-bind the Tailwind @theme font tokens to the next/font CSS vars
            // so `font-mono` / `font-sans` / `font-display` actually resolve to
            // the Geist / VT323 webfonts loaded above (not just system fallbacks).
            '--font-sans':
              'var(--font-geist-sans), Inter, system-ui, sans-serif',
            '--font-mono':
              'var(--font-geist-mono), "JetBrains Mono", ui-monospace, monospace',
            '--font-display':
              'var(--font-vt323), "Major Mono Display", monospace',
          } as React.CSSProperties
        }
      >
        <TopNav />
        <main className="min-h-[calc(100dvh-7rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

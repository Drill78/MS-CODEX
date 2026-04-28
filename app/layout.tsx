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
      >
        <TopNav />
        <main className="min-h-[calc(100dvh-7rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--color-grid-line)' }}
    >
      <div
        className="container mx-auto px-6 py-6 text-center font-mono text-xs tracking-wider"
        style={{ color: 'var(--color-text-muted)' }}
      >
        MS-CODEX · 数据来源：万代官方 · 本站为非商业爱好者项目
      </div>
    </footer>
  )
}

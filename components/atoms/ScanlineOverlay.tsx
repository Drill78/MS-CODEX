import { cn } from '@/lib/utils'

export type ScanlineOverlayProps = {
  opacity?: number
  className?: string
}

export function ScanlineOverlay({ opacity = 0.04, className }: ScanlineOverlayProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          rgba(232, 240, 255, ${opacity}) 0px,
          rgba(232, 240, 255, ${opacity}) 1px,
          transparent 1px,
          transparent 3px
        )`,
      }}
    />
  )
}

export default ScanlineOverlay

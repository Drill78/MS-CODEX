import * as React from 'react'
import {
  Disc,
  Droplet,
  FlaskConical,
  Lamp,
  Package,
  Paintbrush,
  Palette,
  PenLine,
  SprayCan,
  Square,
  Sticker,
  Wind,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AirbrushIcon,
  ClipStickIcon,
  CompressorIcon,
  FileIcon,
  KnifeIcon,
  NipperDoubleIcon,
  NipperSingleIcon,
  NipperSprueIcon,
  PanelScriberIcon,
  PartSeparatorIcon,
  PolishingIcon,
  RespiratorIcon,
  SandstickIcon,
  SprayBoothIcon,
  TweezersIcon,
  type ToolSvgProps,
} from './svgs'

type IconComponent = React.ComponentType<{
  size?: number
  className?: string
  strokeWidth?: number
}>

const ICON_MAP: Record<string, IconComponent> = {
  // custom
  'nipper-single': NipperSingleIcon,
  'nipper-double': NipperDoubleIcon,
  'nipper-sprue': NipperSprueIcon,
  knife: KnifeIcon,
  sandstick: SandstickIcon,
  file: FileIcon,
  polishing: PolishingIcon,
  airbrush: AirbrushIcon,
  compressor: CompressorIcon,
  'spray-booth': SprayBoothIcon,
  tweezers: TweezersIcon,
  'clip-stick': ClipStickIcon,
  'part-separator': PartSeparatorIcon,
  'panel-scriber': PanelScriberIcon,
  respirator: RespiratorIcon,
  // lucide aliases (lowercase in our schema → PascalCase component)
  paintbrush: Paintbrush,
  palette: Palette,
  'spray-can': SprayCan,
  'pen-line': PenLine,
  sticker: Sticker,
  droplet: Droplet,
  disc: Disc,
  flask: FlaskConical,
  square: Square,
  package: Package,
  lamp: Lamp,
  wind: Wind,
}

export type ToolIconProps = ToolSvgProps & {
  id: string
  lit?: boolean
}

export function ToolIcon({
  id,
  lit = false,
  size = 24,
  strokeWidth,
  className,
}: ToolIconProps) {
  const Cmp = ICON_MAP[id]
  if (!Cmp) return null
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center transition-[opacity,filter] duration-200',
        lit ? 'opacity-100' : 'opacity-30',
        className,
      )}
      style={{
        color: lit
          ? 'var(--color-accent-magenta)'
          : 'var(--color-text-muted)',
        filter: lit
          ? 'drop-shadow(0 0 4px color-mix(in srgb, var(--color-accent-magenta) 60%, transparent))'
          : undefined,
      }}
    >
      <Cmp size={size} strokeWidth={strokeWidth ?? 1.5} />
    </span>
  )
}

export default ToolIcon

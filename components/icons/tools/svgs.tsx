import * as React from 'react'

export type ToolSvgProps = {
  size?: number
  className?: string
  strokeWidth?: number
}

const baseProps = (size: number, className?: string, strokeWidth = 1.5) =>
  ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }) as const

// 单刃水口钳：两柄 + 短刃 + 一刃为平砧（粗一点）
export function NipperSingleIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M3 21 L9 14" />
      <path d="M3 17 L7 13" />
      <path d="M9 14 L13 10" />
      <path d="M7 13 L11 9 L13 10" />
      <path d="M13 10 L18 5" />
      <path d="M11 9 L16 4" strokeWidth={2.5} />
      <circle cx="9.5" cy="13.5" r="1" />
    </svg>
  )
}

// 双刃普通钳：两边对称
export function NipperDoubleIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M3 21 L11 13" />
      <path d="M3 17 L9 11" />
      <path d="M11 13 L18 6" />
      <path d="M9 11 L16 4" />
      <circle cx="10" cy="12" r="1" />
    </svg>
  )
}

// 流道钳：粗壮版双刃
export function NipperSprueIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M3 22 L10 14" strokeWidth={2.5} />
      <path d="M3 17 L8 12" strokeWidth={2.5} />
      <path d="M10 14 L17 7" strokeWidth={2} />
      <path d="M8 12 L15 5" strokeWidth={2} />
      <circle cx="9" cy="13" r="1.5" />
    </svg>
  )
}

// 笔刀：手术刀样式
export function KnifeIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M3 21 L13 11 L17 7 L21 3 L20 8 L16 12 L13 11" />
      <path d="M3 21 L7 17" />
      <path d="M11 13 L8 16" />
    </svg>
  )
}

// 打磨棒：一条扁长方形 + 表面网格
export function SandstickIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <line x1="6" y1="9" x2="6" y2="15" strokeWidth={0.6} />
      <line x1="9" y1="9" x2="9" y2="15" strokeWidth={0.6} />
      <line x1="12" y1="9" x2="12" y2="15" strokeWidth={0.6} />
      <line x1="15" y1="9" x2="15" y2="15" strokeWidth={0.6} />
      <line x1="18" y1="9" x2="18" y2="15" strokeWidth={0.6} />
    </svg>
  )
}

// 锉刀：与打磨棒相似但更窄、有把手
export function FileIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <rect x="2" y="11" width="4" height="3" rx="0.5" />
      <rect x="6" y="10.5" width="16" height="4" rx="0.5" />
      <line x1="9" y1="10.5" x2="9" y2="14.5" strokeWidth={0.6} />
      <line x1="12" y1="10.5" x2="12" y2="14.5" strokeWidth={0.6} />
      <line x1="15" y1="10.5" x2="15" y2="14.5" strokeWidth={0.6} />
      <line x1="18" y1="10.5" x2="18" y2="14.5" strokeWidth={0.6} />
    </svg>
  )
}

// 抛光膏：圆罐
export function PolishingIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <ellipse cx="12" cy="8" rx="7" ry="2" />
      <path d="M5 8 V18 C5 19.5 8 20.5 12 20.5 S19 19.5 19 18 V8" />
      <path d="M9 12 Q12 10 15 12" />
    </svg>
  )
}

// 喷笔：机身 + 喷头 + 漆杯
export function AirbrushIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M3 12 L17 12" strokeWidth={2} />
      <path d="M17 12 L21 10 L21 14 Z" />
      <path d="M3 11 L3 13" strokeWidth={2} />
      <path d="M9 12 L9 7 L13 7 L13 12" />
      <path d="M9 7 L9 5 L13 5 L13 7" />
      <circle cx="6" cy="12" r="1" />
    </svg>
  )
}

// 气泵：方箱 + 圆储气罐
export function CompressorIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <rect x="3" y="10" width="11" height="10" rx="1" />
      <ellipse cx="18.5" cy="15" rx="2.5" ry="5" />
      <line x1="14" y1="13" x2="16" y2="13" />
      <line x1="14" y1="17" x2="16" y2="17" />
      <circle cx="6" cy="13" r="0.8" />
      <line x1="9" y1="17" x2="11" y2="17" />
    </svg>
  )
}

// 喷漆台：箱子 + 排风口
export function SprayBoothIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <rect x="3" y="6" width="14" height="14" rx="1" />
      <path d="M17 9 L21 7 L21 19 L17 17" />
      <line x1="6" y1="9" x2="14" y2="9" />
      <line x1="6" y1="12" x2="14" y2="12" />
      <line x1="6" y1="15" x2="14" y2="15" />
    </svg>
  )
}

// 镊子
export function TweezersIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M5 3 L11 14 L11 20" />
      <path d="M19 3 L13 14 L13 20" />
      <path d="M11 20 Q12 21 13 20" />
    </svg>
  )
}

// 持件夹：竹签 + 鳄鱼夹
export function ClipStickIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <line x1="12" y1="22" x2="12" y2="9" strokeWidth={1.2} />
      <path d="M9 9 L12 5 L15 9" />
      <path d="M9 7 L12 3 L15 7" />
      <line x1="12" y1="14" x2="14" y2="14" strokeWidth={0.8} />
    </svg>
  )
}

// 开模器：薄片 + 楔形
export function PartSeparatorIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M3 14 L13 14 L20 11 L20 13 L13 16 L3 16 Z" />
      <line x1="6" y1="14" x2="6" y2="16" strokeWidth={0.6} />
    </svg>
  )
}

// 防毒面具：椭圆面罩 + 两个滤芯
export function RespiratorIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <path d="M6 8 Q12 6 18 8 Q19 12 18 16 Q12 20 6 16 Q5 12 6 8 Z" />
      <circle cx="9" cy="13" r="1.8" />
      <circle cx="15" cy="13" r="1.8" />
      <path d="M2 9 L6 10" />
      <path d="M2 15 L6 14" />
      <path d="M22 9 L18 10" />
      <path d="M22 15 L18 14" />
    </svg>
  )
}

// 刻线推刀：扁平笔身 + 右端钩状刃
export function PanelScriberIcon({
  size = 24,
  className,
  strokeWidth,
}: ToolSvgProps) {
  return (
    <svg {...baseProps(size, className, strokeWidth)}>
      <rect x="3" y="10" width="14" height="4" rx="0.5" />
      <line x1="6" y1="10" x2="6" y2="14" strokeWidth={0.6} />
      <path d="M17 11 L20 12 L20 13 L17 13" />
      <path d="M20 12 L22 14 L21 16 L19 14.5" />
    </svg>
  )
}

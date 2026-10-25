/** Tiny original pixel-art icons drawn from character maps; no game sprites are used. */

type Palette = Record<string, string>

interface PixelSpriteProps {
  rows: string[]
  palette: Palette
  size?: number
  className?: string
  title?: string
}

function PixelSprite({ rows, palette, size = 16, className, title }: PixelSpriteProps) {
  const width = Math.max(...rows.map((row) => row.length))
  const height = rows.length
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size * height) / width}
      shapeRendering="crispEdges"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {rows.flatMap((row, y) => [...row].map((cell, x) => palette[cell]
        ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[cell]} />
        : null))}
    </svg>
  )
}

const HEART_FULL = [
  '.OO.OO.',
  'OXHOXXO',
  'OXXXXXO',
  'OXXXXSO',
  '.OXXSO.',
  '..OSO..',
  '...O...',
]

const HEART_HALF = [
  '.OO.OO.',
  'OXHOEEO',
  'OXXXEEO',
  'OXXEEEO',
  '.OXEEO.',
  '..OEO..',
  '...O...',
]

const HEART_EMPTY = [
  '.OO.OO.',
  'OEEOEEO',
  'OEEEEEO',
  'OEEEEEO',
  '.OEEEO.',
  '..OEO..',
  '...O...',
]

export type HeartKind = 'red' | 'soul' | 'black'

const heartPalettes: Record<HeartKind, Palette> = {
  red: { O: '#1a0b09', X: '#d8352a', H: '#ff9a86', S: '#8e1d16', E: '#3a2420' },
  soul: { O: '#0d1520', X: '#7fa7d6', H: '#e3f0ff', S: '#4c6f9c', E: '#2a3440' },
  black: { O: '#000000', X: '#3b3540', H: '#8d8496', S: '#211d25', E: '#2a2528' },
}

export function PixelHeart({ kind = 'red', fill = 'full', size = 16, className }: { kind?: HeartKind; fill?: 'full' | 'half' | 'empty'; size?: number; className?: string }) {
  const rows = fill === 'full' ? HEART_FULL : fill === 'half' ? HEART_HALF : HEART_EMPTY
  return <PixelSprite rows={rows} palette={heartPalettes[kind]} size={size} className={className} />
}

export function PixelCoin({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <PixelSprite
      size={size}
      className={className}
      rows={[
        '..OOO..',
        '.OXXXO.',
        'OXHXXSO',
        'OXHXXSO',
        'OXXXXSO',
        '.OXSSO.',
        '..OOO..',
      ]}
      palette={{ O: '#2b1a05', X: '#e4ad3b', H: '#fff0a8', S: '#a8701c' }}
    />
  )
}

export function PixelBomb({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <PixelSprite
      size={size}
      className={className}
      rows={[
        '.....F.',
        '....FY.',
        '...O...',
        '.OOXOO.',
        'OXHXXXO',
        'OHXXXXO',
        'OXXXXSO',
        '.OXSSO.',
        '..OOO..',
      ]}
      palette={{ O: '#0b0a0c', X: '#3e3a45', H: '#8a8494', S: '#25222a', F: '#ff8b3d', Y: '#ffe680' }}
    />
  )
}

export function PixelKey({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <PixelSprite
      size={size}
      className={className}
      rows={[
        '.OOO.....',
        'OXHXO....',
        'OX.XOOOOO',
        'OXXXXXXXO',
        'OSXSOXOXO',
        '.OOO.O.O.',
      ]}
      palette={{ O: '#2a2208', X: '#c9c3b0', H: '#ffffff', S: '#8a8270' }}
    />
  )
}

export function HeartRow({ amount, kind, max = 12 }: { amount: number; kind: HeartKind; max?: number }) {
  const full = Math.floor(amount)
  const half = amount - full >= 0.5
  const count = Math.min(max, full + (half ? 1 : 0))
  if (!count) return <PixelHeart kind={kind} fill="empty" size={18} className="opacity-50" />
  return (
    <span className="flex flex-wrap gap-[3px]">
      {Array.from({ length: count }, (_, index) => (
        <PixelHeart key={index} kind={kind} fill={index < full ? 'full' : 'half'} size={18} />
      ))}
    </span>
  )
}

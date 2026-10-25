/**
 * Generates the app icon (an original pixel-art crying head, no game sprites) as PNG and ICO.
 * Run with `pnpm build:icon`; outputs resources/icon.png, resources/icon.ico and public/favicon.png.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { deflateSync } from 'node:zlib'

type Rgba = [number, number, number, number]

const HEAD = [
  '.......OOOOOO.......',
  '.....OOhhSSSSOO.....',
  '...OOhhSSSSSSSSOO...',
  '..OhhSSSSSSSSSSSsO..',
  '.OhSSSSSSSSSSSSSSsO.',
  '.OSSSSSSSSSSSSSSSsO.',
  'OSSSEEEESSSSEEEESSsO',
  'OSSEEWWEESSEEWWEESsO',
  'OSSEEWEEESSEEWEEESsO',
  'OSSEEEEEESSEEEEEESsO',
  'OSSTEEEETSSTEEEETSsO',
  'OSSTtSSSTSSTSSStTSsO',
  '.OSTtSSSSOOSSSStTsO.',
  '.OSTtSSSOMMOSSStTsO.',
  '..OTtSSSSOOSSSStTO..',
  '...OTtsssssssstTO...',
  '....OOOOOOOOOOOO....',
  '...T............T...',
  '..TtT..........TtT..',
  '..tTt..........tTt..',
]

const palette: Record<string, Rgba> = {
  O: [42, 20, 16, 255],
  S: [242, 199, 181, 255],
  s: [212, 152, 136, 255],
  h: [255, 232, 221, 255],
  E: [18, 10, 10, 255],
  W: [255, 255, 255, 255],
  T: [127, 182, 230, 255],
  t: [75, 134, 196, 255],
  M: [107, 34, 34, 255],
}

const BACKGROUND: Rgba = [168, 54, 44, 255]
const BACKGROUND_DARK: Rgba = [96, 26, 20, 255]
const SIZE = 256
const SCALE = 10
const RADIUS = 56

function renderMaster(): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  const set = (x: number, y: number, [r, g, b, a]: Rgba) => {
    const i = (y * SIZE + x) * 4
    pixels[i] = r
    pixels[i + 1] = g
    pixels[i + 2] = b
    pixels[i + 3] = a
  }

  // Rounded square with a soft vertical gradient and a darker inner edge.
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = Math.max(RADIUS - x, x - (SIZE - 1 - RADIUS), 0)
      const dy = Math.max(RADIUS - y, y - (SIZE - 1 - RADIUS), 0)
      const distance = Math.hypot(dx, dy)
      if (distance > RADIUS) continue
      const t = y / SIZE
      const edge = distance > RADIUS - 10 || x < 10 || y < 10 || x > SIZE - 11 || y > SIZE - 11
      const base = BACKGROUND.map((channel, i) => Math.round(channel * (1 - t * 0.35) + BACKGROUND_DARK[i] * t * 0.35)) as Rgba
      const color = edge ? base.map((channel, i) => (i === 3 ? 255 : Math.round(channel * 0.72))) as Rgba : base
      const alpha = Math.max(0, Math.min(1, RADIUS - distance + 0.5))
      set(x, y, [color[0], color[1], color[2], Math.round(255 * alpha)])
    }
  }

  const width = HEAD[0].length * SCALE
  const height = HEAD.length * SCALE
  const offsetX = Math.round((SIZE - width) / 2)
  const offsetY = Math.round((SIZE - height) / 2) + 6

  // Drop shadow under the head, then the head itself.
  for (const [layer, shift] of [['shadow', 6], ['head', 0]] as const) {
    HEAD.forEach((row, py) => [...row].forEach((cell, px) => {
      const color = palette[cell]
      if (!color) return
      for (let y = 0; y < SCALE; y++) {
        for (let x = 0; x < SCALE; x++) {
          set(offsetX + px * SCALE + x + shift, offsetY + py * SCALE + y + shift, layer === 'shadow' ? [40, 8, 6, 255] : color)
        }
      }
    }))
  }

  return pixels
}

function downsample(source: Uint8Array, from: number, to: number): Uint8Array {
  const out = new Uint8Array(to * to * 4)
  const ratio = from / to
  for (let y = 0; y < to; y++) {
    for (let x = 0; x < to; x++) {
      const sum = [0, 0, 0, 0]
      let weight = 0
      for (let sy = Math.floor(y * ratio); sy < Math.floor((y + 1) * ratio); sy++) {
        for (let sx = Math.floor(x * ratio); sx < Math.floor((x + 1) * ratio); sx++) {
          const i = (sy * from + sx) * 4
          const alpha = source[i + 3] / 255
          sum[0] += source[i] * alpha
          sum[1] += source[i + 1] * alpha
          sum[2] += source[i + 2] * alpha
          sum[3] += source[i + 3]
          weight += alpha
        }
      }
      const samples = Math.floor(ratio) ** 2
      const i = (y * to + x) * 4
      out[i] = weight ? Math.round(sum[0] / weight) : 0
      out[i + 1] = weight ? Math.round(sum[1] / weight) : 0
      out[i + 2] = weight ? Math.round(sum[2] / weight) : 0
      out[i + 3] = Math.round(sum[3] / samples)
    }
  }
  return out
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(pixels: Uint8Array, size: number): Buffer {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    Buffer.from(pixels.buffer, pixels.byteOffset + y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function encodeIco(images: Array<{ size: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + images.length * 16
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16)
    entry[0] = size >= 256 ? 0 : size
    entry[1] = size >= 256 ? 0 : size
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)])
}

const master = renderMaster()
const sizes = [256, 128, 64, 48, 32, 24, 16]
const images = sizes.map((size) => ({ size, png: encodePng(size === SIZE ? master : downsample(master, SIZE, size), size) }))

await mkdir(new URL('../resources/', import.meta.url), { recursive: true })
await writeFile(new URL('../resources/icon.png', import.meta.url), images[0].png)
await writeFile(new URL('../resources/icon.ico', import.meta.url), encodeIco(images))
await writeFile(new URL('../public/favicon.png', import.meta.url), images.find((image) => image.size === 64)!.png)
console.log(`Ícone gerado: ${sizes.join(', ')} px`)

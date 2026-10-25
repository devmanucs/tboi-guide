import { create } from 'zustand'

/**
 * Original chiptune-style effects synthesized with Web Audio — no game audio is bundled.
 */

export type SoundName =
  | 'pickup' | 'remove' | 'heartUp' | 'heartDown' | 'coin' | 'bomb' | 'key'
  | 'tick' | 'open' | 'floor' | 'start' | 'end' | 'error' | 'select'

const STORAGE_KEY = 'oracle-sound'

interface SoundSettings {
  muted: boolean
  volume: number
}

function readSettings(): SoundSettings {
  try {
    return { muted: false, volume: 0.6, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<SoundSettings> }
  } catch {
    return { muted: false, volume: 0.6 }
  }
}

interface SoundStore extends SoundSettings {
  toggleMuted: () => void
  setVolume: (volume: number) => void
}

export const useSoundSettings = create<SoundStore>((set, get) => {
  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted: get().muted, volume: get().volume }))
    } catch {
      // Settings simply won't persist when storage is unavailable.
    }
  }
  return {
    ...readSettings(),
    toggleMuted: () => {
      set({ muted: !get().muted })
      persist()
      if (!get().muted) play('select')
    },
    setVolume: (volume) => {
      set({ volume, muted: volume === 0 })
      persist()
    },
  }
})

let context: AudioContext | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null

function audio(): { ctx: AudioContext; out: GainNode } | null {
  try {
    if (!context) {
      context = new AudioContext()
      master = context.createGain()
      const compressor = context.createDynamicsCompressor()
      master.connect(compressor).connect(context.destination)
    }
    if (context.state === 'suspended') void context.resume()
    return { ctx: context, out: master! }
  } catch {
    return null
  }
}

function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

interface ToneOptions {
  type?: OscillatorType
  at?: number
  duration?: number
  gain?: number
  slideTo?: number
}

function tone(ctx: AudioContext, out: AudioNode, frequency: number, { type = 'square', at = 0, duration = 0.08, gain = 0.18, slideTo }: ToneOptions = {}) {
  const start = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  env.gain.setValueAtTime(0.0001, start)
  env.gain.exponentialRampToValueAtTime(gain, start + 0.006)
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(env).connect(out)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function noise(ctx: AudioContext, out: AudioNode, { at = 0, duration = 0.25, gain = 0.3, from = 1800, to = 120 }: { at?: number; duration?: number; gain?: number; from?: number; to?: number } = {}) {
  const start = ctx.currentTime + at
  const source = ctx.createBufferSource()
  source.buffer = getNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(from, start)
  filter.frequency.exponentialRampToValueAtTime(to, start + duration)
  const env = ctx.createGain()
  env.gain.setValueAtTime(gain, start)
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  source.connect(filter).connect(env).connect(out)
  source.start(start)
  source.stop(start + duration + 0.02)
}

const notes = { C4: 261.6, E4: 329.6, G4: 392, A4: 440, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, B5: 987.8, C6: 1046.5, E6: 1318.5 }

const recipes: Record<SoundName, (ctx: AudioContext, out: AudioNode) => void> = {
  pickup: (ctx, out) => {
    ;[notes.C5, notes.E5, notes.G5, notes.C6].forEach((frequency, index) => tone(ctx, out, frequency, { at: index * 0.055, duration: 0.11, gain: 0.14 }))
    tone(ctx, out, notes.E6, { at: 0.22, duration: 0.28, gain: 0.08, type: 'triangle' })
  },
  remove: (ctx, out) => tone(ctx, out, notes.G4, { duration: 0.14, slideTo: 140, gain: 0.14 }),
  heartUp: (ctx, out) => {
    tone(ctx, out, notes.A4, { type: 'triangle', duration: 0.07, gain: 0.25 })
    tone(ctx, out, notes.E5, { type: 'triangle', at: 0.06, duration: 0.12, gain: 0.25 })
  },
  heartDown: (ctx, out) => {
    tone(ctx, out, 300, { type: 'sawtooth', duration: 0.16, slideTo: 90, gain: 0.12 })
    noise(ctx, out, { duration: 0.1, gain: 0.12, from: 2400, to: 400 })
  },
  coin: (ctx, out) => {
    tone(ctx, out, notes.B5, { duration: 0.06, gain: 0.12 })
    tone(ctx, out, notes.E6, { at: 0.06, duration: 0.22, gain: 0.12 })
  },
  bomb: (ctx, out) => {
    noise(ctx, out, { duration: 0.35, gain: 0.45, from: 1400, to: 60 })
    tone(ctx, out, 110, { type: 'sine', duration: 0.3, slideTo: 40, gain: 0.35 })
  },
  key: (ctx, out) => {
    tone(ctx, out, 1760, { type: 'triangle', duration: 0.05, gain: 0.12 })
    tone(ctx, out, 2349, { type: 'triangle', at: 0.05, duration: 0.05, gain: 0.1 })
    tone(ctx, out, 1976, { type: 'triangle', at: 0.1, duration: 0.12, gain: 0.08 })
  },
  tick: (ctx, out) => tone(ctx, out, 1400, { type: 'square', duration: 0.025, gain: 0.05 }),
  select: (ctx, out) => tone(ctx, out, notes.E5, { type: 'square', duration: 0.05, gain: 0.08, slideTo: notes.A5 }),
  open: (ctx, out) => {
    noise(ctx, out, { duration: 0.16, gain: 0.08, from: 400, to: 3000 })
    tone(ctx, out, notes.C5, { type: 'triangle', at: 0.02, duration: 0.08, gain: 0.1, slideTo: notes.G5 })
  },
  floor: (ctx, out) => {
    tone(ctx, out, 520, { type: 'square', duration: 0.45, slideTo: 70, gain: 0.12 })
    noise(ctx, out, { at: 0.35, duration: 0.25, gain: 0.25, from: 900, to: 80 })
  },
  start: (ctx, out) => {
    ;[notes.C4, notes.G4, notes.C5].forEach((frequency, index) => tone(ctx, out, frequency, { at: index * 0.09, duration: 0.14, gain: 0.14 }))
    tone(ctx, out, notes.E5, { at: 0.27, duration: 0.4, gain: 0.12, type: 'triangle' })
  },
  end: (ctx, out) => {
    ;[notes.E4, 311.1, 293.7, 277.2].forEach((frequency, index) => tone(ctx, out, frequency, { at: index * 0.16, duration: index === 3 ? 0.6 : 0.16, gain: 0.13, type: 'triangle' }))
  },
  error: (ctx, out) => {
    tone(ctx, out, 140, { type: 'square', duration: 0.09, gain: 0.1 })
    tone(ctx, out, 110, { type: 'square', at: 0.1, duration: 0.14, gain: 0.1 })
  },
}

export function play(name: SoundName) {
  const { muted, volume } = useSoundSettings.getState()
  if (muted || volume <= 0) return
  const engine = audio()
  if (!engine) return
  engine.out.gain.setValueAtTime(volume, engine.ctx.currentTime)
  recipes[name](engine.ctx, engine.out)
}

export type GameVersion = 'rebirth' | 'afterbirth' | 'afterbirth-plus'
export type ItemKind = 'passive' | 'active' | 'familiar'

export interface IsaacItem {
  id: number
  name: string
  localizedName?: string
  version: GameVersion
  type: ItemKind
  spritePath?: string
  shortDescription: string
  localizedShortDescription?: string
  description: string
  localizedDescription?: string
  effects: string[]
  pools: string[]
  quality?: number
  transformations: string[]
  tags: string[]
  localizedTags?: string[]
  aliases: string[]
  sourceUrl?: string
}

export interface RunState {
  id: string
  character?: string
  floor?: string
  collectibles: number[]
  activeItem?: number
  trinkets: number[]
  coins?: number
  bombs?: number
  keys?: number
  health?: HealthState
  startedAt: number
}

export interface HealthState {
  redHearts: number
  soulHearts: number
  blackHearts: number
}

export type RunUpdate = Partial<Pick<RunState, 'character' | 'floor' | 'coins' | 'bombs' | 'keys' | 'health'>>

export interface ItemCandidate {
  itemId: number
  confidence: number
}

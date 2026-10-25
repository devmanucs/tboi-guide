export type GameVersion = 'rebirth' | 'afterbirth' | 'afterbirth-plus'
export type ItemKind = 'passive' | 'active' | 'familiar' | 'trinket' | 'card' | 'rune'

export interface IsaacItem {
  /** Unique catalog ID; trinkets are offset by TRINKET_ID_OFFSET. */
  id: number
  /** The ID the game itself uses (collectible or trinket number). */
  gameId: number
  name: string
  localizedName?: string
  version: GameVersion
  type: ItemKind
  /** For cards: 'tarot', 'playing' or 'dice'; special cards have none. */
  subType?: string
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

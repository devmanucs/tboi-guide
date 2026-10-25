import type { IsaacItem, ItemKind } from './types'

/** Trinket IDs overlap collectible IDs in the game, so the catalog shifts them into their own range. */
export const TRINKET_ID_OFFSET = 10000
/** Cards and runes (pocket items) have their own numbering too. */
export const POCKET_ID_OFFSET = 20000

export interface CatalogEntry {
  id?: number
  gameId?: number
  name: string
  type: string
  subType?: string
  description: string
  tags: string[]
  imageUrl?: string
  sourceUrl?: string
}

export interface LocalizedEntry {
  id: number
  localizedName?: string
  localizedDescription?: string
  localizedTags?: string[]
}

function firstSentence(text: string): string {
  return text.split(/(?<=[.!?])\s|\n/)[0] ?? text
}

export function buildCatalog(catalog: CatalogEntry[], localizedCatalog: LocalizedEntry[]): IsaacItem[] {
  const localizedItems = new Map(localizedCatalog.map((item) => [item.id, item]))

  return catalog
    .filter((entry): entry is CatalogEntry & { id: number } => Number.isInteger(entry.id))
    .map((entry) => {
      const localized = localizedItems.get(entry.id)
      const localizedDescription = localized?.localizedDescription ?? entry.description
      return {
        id: entry.id,
        gameId: entry.gameId ?? entry.id,
        name: entry.name,
        localizedName: localized?.localizedName,
        version: 'afterbirth-plus',
        type: toItemKind(entry.type),
        subType: entry.subType,
        shortDescription: firstSentence(entry.description),
        localizedShortDescription: firstSentence(localizedDescription),
        description: entry.description,
        localizedDescription,
        effects: [],
        pools: [],
        transformations: [],
        tags: entry.tags,
        localizedTags: localized?.localizedTags,
        aliases: [],
        spritePath: entry.imageUrl,
        sourceUrl: entry.sourceUrl,
      } satisfies IsaacItem
    })
    .sort((a, b) => displayName(a).localeCompare(displayName(b), 'pt-BR'))
}

function toItemKind(type: string): ItemKind {
  return type === 'active' || type === 'familiar' || type === 'trinket' || type === 'card' || type === 'rune' ? type : 'passive'
}

export function isPocketItem(item: IsaacItem): boolean {
  return item.type === 'card' || item.type === 'rune'
}

export function displayName(item: IsaacItem): string {
  return item.localizedName || item.name
}

export function hasDistinctEnglishName(item: IsaacItem): boolean {
  return Boolean(item.localizedName) && normalizeLoose(item.localizedName!) !== normalizeLoose(item.name)
}

function normalizeLoose(value: string): string {
  return value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

import type { IsaacItem } from './types'

/**
 * Accent-, case- and punctuation-insensitive search over English and Portuguese
 * names. The player reads item names in English on screen, so typing "mom's knife",
 * "moms knife" or even "moms knif" must find "Faca da mamãe".
 */

const ARTICLES = new Set(['the', 'a', 'o', 'os', 'as', 'um', 'uma'])

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9?]+/g, ' ')
    .trim()
}

interface IndexedName {
  full: string
  compact: string
  words: string[]
}

interface IndexedItem {
  item: IsaacItem
  names: IndexedName[]
  text: string
}

function indexName(value: string): IndexedName {
  const full = normalizeSearchText(value)
  const words = full.split(' ').filter(Boolean)
  const withoutArticle = ARTICLES.has(words[0] ?? '') && words.length > 1 ? words.slice(1) : words
  return { full: withoutArticle.join(' '), compact: withoutArticle.join(''), words }
}

const indexCache = new WeakMap<IsaacItem[], IndexedItem[]>()

function getIndex(items: IsaacItem[]): IndexedItem[] {
  let index = indexCache.get(items)
  if (!index) {
    index = items.map((item) => ({
      item,
      names: [item.name, item.localizedName, ...item.aliases]
        .filter((name): name is string => Boolean(name))
        .map(indexName),
      text: normalizeSearchText([
        item.description,
        item.localizedDescription,
        ...item.tags,
        ...item.localizedTags ?? [],
      ].filter(Boolean).join(' ')),
    }))
    indexCache.set(items, index)
  }
  return index
}

function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else if (a[i + 1] === b[j] && a[i] === b[j + 1]) {
      i += 2
      j += 2
    } else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

function scoreName(name: IndexedName, query: IndexedName, tokens: string[]): number {
  if (!name.full) return 0
  if (name.full === query.full || name.compact === query.compact) return 100
  if (name.full.startsWith(query.full) || name.compact.startsWith(query.compact)) return 85
  if (tokens.every((token) => name.words.some((word) => word.startsWith(token)))) return 70
  if (query.compact.length >= 3 && name.compact.includes(query.compact)) return 55
  const fuzzyTokens = tokens.every((token) => name.words.some((word) =>
    word.startsWith(token) || (token.length >= 4 && (withinOneEdit(token, word) || withinOneEdit(token, word.slice(0, token.length))))))
  if (fuzzyTokens) return 40
  return 0
}

export interface SearchResult {
  item: IsaacItem
  score: number
}

export function rankItems(items: IsaacItem[], rawQuery: string): SearchResult[] {
  const trimmed = rawQuery.trim().replace(/^#/, '')
  if (!trimmed) return items.map((item) => ({ item, score: 0 }))

  const query = indexName(trimmed)
  const tokens = query.full.split(' ').filter(Boolean)
  const numericId = /^\d+$/.test(trimmed) ? Number(trimmed) : null
  const results: SearchResult[] = []

  for (const entry of getIndex(items)) {
    let score = Math.max(0, ...entry.names.map((name) => scoreName(name, query, tokens)))
    if (numericId !== null && entry.item.gameId === numericId) score = Math.max(score, 120)
    if (!score && tokens.length && tokens.every((token) => entry.text.includes(token))) score = 15
    if (score) results.push({ item: entry.item, score })
  }

  return results.sort((a, b) => b.score - a.score
    || (a.item.localizedName || a.item.name).localeCompare(b.item.localizedName || b.item.name, 'pt-BR'))
}

export function searchItems(items: IsaacItem[], query: string): IsaacItem[] {
  return rankItems(items, query).map((result) => result.item)
}

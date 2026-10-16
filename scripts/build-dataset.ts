import { readFile, writeFile } from 'node:fs/promises'

interface SourceItem {
  id: string
  name: string
  type: string
  desc?: string
  dlc: string
  tags?: string
  thumb?: string
  wiki?: string
}

const sourcePath = new URL('../data/source-items.js', import.meta.url)
const xmlPath = new URL('../data/source-items.xml', import.meta.url)
const targetPath = new URL('../data/afterbirth-plus/items.json', import.meta.url)
const source = await readFile(sourcePath, 'utf8')
const xml = await readFile(xmlPath, 'utf8')
const arrayStart = source.indexOf('[', source.indexOf('const g_items'))
const arrayEnd = source.lastIndexOf('];') + 1

if (arrayStart < 0 || arrayEnd <= arrayStart) {
  throw new Error('Não foi possível localizar o catálogo de origem.')
}

const rows = JSON.parse(source.slice(arrayStart, arrayEnd)) as SourceItem[]
const normalize = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '')
const gameItems = [...xml.matchAll(/<(active|passive)\s+([^>]+)>/g)].map((match) => {
  const attributes = Object.fromEntries(
    [...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], attribute[2]]),
  )
  return { ...attributes, type: match[1] }
})
const gameItemsByName = new Map(gameItems.map((item) => [normalize(item.name ?? ''), item]))
const supportedDlc = new Set(['base', 'afterbirth', 'afterbirthplus'])
const collectibles = rows.filter((row) =>
  supportedDlc.has(row.dlc) && (row.type === 'passive' || row.type === 'active'),
)

const items = collectibles.map((row) => {
  const description = String(row.desc ?? '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()

  const gameItem = gameItemsByName.get(normalize(row.name))
  return {
    ...(gameItem?.id ? { id: Number(gameItem.id) } : {}),
    sourceId: row.id,
    name: row.name,
    type: row.type,
    description,
    tags: String(row.tags ?? '').split(/\s+/).filter(Boolean),
    imageUrl: row.thumb,
    sourceUrl: row.wiki,
    sourceDlc: row.dlc,
  }
})

const matched = items.filter((item) => Number.isInteger(item.id))
await writeFile(targetPath, `${JSON.stringify(matched, null, 2)}\n`, 'utf8')
console.log(`Gerados ${matched.length}/${items.length} collectibles com ID do jogo.`)

import { readFile, writeFile } from 'node:fs/promises'
import { POCKET_ID_OFFSET, TRINKET_ID_OFFSET } from '../packages/isaac-data/src/catalog'

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
const decodeXml = (value: string) => value.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
const gameItems = [...xml.matchAll(/<(active|passive|familiar|trinket)\s+([^>]+)>/g)].map((match) => {
  const attributes: Record<string, string> = Object.fromEntries(
    [...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((attribute) => [attribute[1], decodeXml(attribute[2])]),
  )
  return { ...attributes, type: match[1] }
})
const lookupKey = (kind: string, name: string) => `${kind === 'trinket' ? 'trinket' : 'collectible'}:${normalize(name)}`
const gameItemsByName = new Map(gameItems.map((item) => [lookupKey(item.type, item.name ?? ''), item]))

// The source XML predates the Booster Packs and names a few items differently;
// these IDs were checked against the item infoboxes on the community wiki.
const knownIds: Record<string, number> = {
  'collectible:adrenaline': 493, // Adrenaline ("Adderline" in items.xml)
  'collectible:3': 15, // <3
  'collectible:oddmushroomthin': 120, // Odd Mushroom (Thin)
  'collectible:oddmushroomlarge': 121, // Odd Mushroom (Large)
  'collectible:humblingbundle': 203, // Humbling Bundle
  'collectible:midnightsnack': 456, // Midnight Snack
  'collectible:angryfly': 511, // Angry Fly
  'collectible:blackhole': 512, // Black Hole
  'collectible:bozo': 513, // Bozo
  'collectible:brokenmodem': 514, // Broken Modem
  'collectible:mysterygift': 515, // Mystery Gift
  'collectible:sprinkler': 516, // Sprinkler
  'collectible:fastbombs': 517, // Fast Bombs
  'collectible:buddyinabox': 518, // Buddy in a Box
  'collectible:lildelirium': 519, // Lil Delirium
  'collectible:jumpercables': 520, // Jumper Cables
  'collectible:coupon': 521, // Coupon
  'collectible:telekinesis': 522, // Telekinesis
  'collectible:movingbox': 523, // Moving Box
  'collectible:technologyzero': 524, // Technology Zero
  'collectible:leprosy': 525, // Leprosy
  'collectible:7seals': 526, // 7 Seals
  'collectible:mrme': 527, // Mr. ME!
  'collectible:angelicprism': 528, // Angelic Prism
  'collectible:pop': 529, // Pop!
  'collectible:deathslist': 530, // Death's List
  'collectible:haemolacria': 531, // Haemolacria
  'collectible:lachryphagy': 532, // Lachryphagy
  'collectible:trisagion': 533, // Trisagion
  'collectible:schoolbag': 534, // Schoolbag
  'collectible:blanket': 535, // Blanket
  'collectible:sacrificialaltar': 536, // Sacrificial Altar
  'collectible:lilspewer': 537, // Lil Spewer
  'collectible:marbles': 538, // Marbles
  'collectible:mysteryegg': 539, // Mystery Egg
  'collectible:flatstone': 540, // Flat Stone
  'collectible:marrow': 541, // Marrow
  'collectible:slippedrib': 542, // Slipped Rib
  'collectible:hallowedground': 543, // Hallowed Ground
  'collectible:pointyrib': 544, // Pointy Rib
  'collectible:bookofthedead': 545, // Book of the Dead
  'collectible:dadsring': 546, // Dad's Ring
  'collectible:divorcepapers': 547, // Divorce Papers
  'collectible:jawbone': 548, // Jaw Bone
  'collectible:brittlebones': 549, // Brittle Bones
  'collectible:brokenshovelhandle': 550, // Broken Shovel (Handle)
  'collectible:brokenshovelblade': 551, // Broken Shovel (Blade)
  'collectible:momsshovel': 552, // Mom's Shovel
  'trinket:cancertrinket': 39, // Cancer (Trinket)
  'trinket:aceofspadestrinket': 45, // Ace of Spades (Trinket)
  'trinket:tonsiltrinket': 97, // Tonsil (Trinket)
  'trinket:locustofwar': 113, // Locust of War
  'trinket:hairpin': 120, // Hairpin
  'trinket:woodencross': 121, // Wooden Cross
  'trinket:butter': 122, // Butter!
  'trinket:filigreefeather': 123, // Filigree Feather
  'trinket:doorstop': 124, // Door Stop
  'trinket:extensioncord': 125, // Extension Cord
  'trinket:rottenpenny': 126, // Rotten Penny
  'trinket:babybender': 127, // Baby-Bender
  'trinket:fingerbone': 128, // Finger Bone
}

// Cards and runes are not in items.xml; these follow the game's Card enum (pocketitems.xml).
const pocketIds: Record<string, number> = Object.fromEntries([
  '0 - The Fool', 'I - The Magician', 'II - The High Priestess', 'III - The Empress', 'IV - The Emperor',
  'V - The Hierophant', 'VI - The Lovers', 'VII - The Chariot', 'VIII - Justice', 'IX - The Hermit',
  'X - Wheel of Fortune', 'XI - Strength', 'XII - The Hanged Man', 'XIII - Death', 'XIV - Temperance',
  'XV - The Devil', 'XVI - The Tower', 'XVII - The Stars', 'XVIII - The Moon', 'XIX - The Sun',
  'XX - Judgement', 'XXI - The World', '2 of Clubs', '2 of Diamonds', '2 of Spades', '2 of Hearts',
  'Ace of Clubs', 'Ace of Diamonds', 'Ace of Spades', 'Ace of Hearts', 'Joker', 'Rune of Hagalaz',
  'Rune of Jera', 'Rune of Ehwaz', 'Rune of Dagaz', 'Rune of Ansuz', 'Rune of Perthro', 'Rune of Berkano',
  'Rune of Algiz', 'Blank Rune', 'Black Rune', 'Chaos Card', 'Credit Card', 'Rules Card',
  'A Card Against Humanity', 'Suicide King', 'Get out of Jail Free Card', '? Card', 'Dice Shard',
  'Emergency Contact', 'Holy Card', 'Huge Growth', 'Ancient Recall', 'Era Walk',
].map((name, index) => [normalize(name), index + 1]))

// Afterbirth+ on Switch ships with every Booster Pack.
const supportedDlc = new Set(['base', 'afterbirth', 'afterbirthplus', 'boosterpack1', 'boosterpack2', 'boosterpack3', 'boosterpack4', 'boosterpack5'])
const collectibles = rows.filter((row) =>
  supportedDlc.has(row.dlc) && ['passive', 'active', 'trinket', 'card', 'rune'].includes(row.type),
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

  const isPocket = row.type === 'card' || row.type === 'rune'
  const key = lookupKey(row.type, row.name)
  const gameItem = isPocket ? undefined : gameItemsByName.get(key)
  const gameId = isPocket ? pocketIds[normalize(row.name)] : gameItem?.id ? Number(gameItem.id) : knownIds[key]
  const idOffset = isPocket ? POCKET_ID_OFFSET : row.type === 'trinket' ? TRINKET_ID_OFFSET : 0
  return {
    ...(gameId ? { id: idOffset + gameId, gameId } : {}),
    sourceId: row.id,
    name: row.name,
    type: gameItem?.type === 'familiar' ? 'familiar' : row.type,
    ...(row.subType ? { subType: row.subType } : {}),
    description,
    tags: String(row.tags ?? '').split(/\s+/).filter(Boolean),
    imageUrl: row.thumb,
    sourceUrl: row.wiki,
    sourceDlc: row.dlc,
  }
})

const matched = items.filter((item) => Number.isInteger(item.id))
const unmatched = items.filter((item) => !Number.isInteger(item.id)).map((item) => `${item.type}:${item.name}`)
if (unmatched.length) console.warn(`Sem ID do jogo (${unmatched.length}): ${unmatched.join(', ')}`)
await writeFile(targetPath, `${JSON.stringify(matched, null, 2)}\n`, 'utf8')
console.log(`Gerados ${matched.length}/${items.length} itens com ID do jogo.`)

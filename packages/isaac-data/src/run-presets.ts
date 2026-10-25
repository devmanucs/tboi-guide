import type { HealthState } from './types'

/** Characters and floors available in Afterbirth+ (Switch edition, booster packs included). */

export interface CharacterPreset {
  id: string
  name: string
  localizedName: string
  /** In-game sprite hot-linked from the community wiki, like the item icons. */
  spriteUrl: string
  /** Approximate starting health (coin and bone hearts counted as red); Eden is random. */
  startingHealth: HealthState
}

const WIKI_IMAGES = 'https://static.wikia.nocookie.net/bindingofisaacre_gamepedia/images/'

export const CHARACTERS: CharacterPreset[] = [
  { id: 'isaac', name: 'Isaac', localizedName: 'Isaac', spriteUrl: `${WIKI_IMAGES}e/e5/Character_Isaac_appearance.png`, startingHealth: { redHearts: 3, soulHearts: 0, blackHearts: 0 } },
  { id: 'magdalene', name: 'Magdalene', localizedName: 'Madalena', spriteUrl: `${WIKI_IMAGES}b/bf/Character_Magdalene_appearance.png`, startingHealth: { redHearts: 4, soulHearts: 0, blackHearts: 0 } },
  { id: 'cain', name: 'Cain', localizedName: 'Caim', spriteUrl: `${WIKI_IMAGES}d/db/Character_Cain_appearance.png`, startingHealth: { redHearts: 2, soulHearts: 0, blackHearts: 0 } },
  { id: 'judas', name: 'Judas', localizedName: 'Judas', spriteUrl: `${WIKI_IMAGES}8/8d/Character_Judas_appearance.png`, startingHealth: { redHearts: 1, soulHearts: 0, blackHearts: 0 } },
  { id: 'blue-baby', name: '???', localizedName: '??? (Blue Baby)', spriteUrl: `${WIKI_IMAGES}9/9a/Character_%3F%3F%3F_appearance.png`, startingHealth: { redHearts: 0, soulHearts: 3, blackHearts: 0 } },
  { id: 'eve', name: 'Eve', localizedName: 'Eva', spriteUrl: `${WIKI_IMAGES}9/91/Character_Eve_appearance.png`, startingHealth: { redHearts: 2, soulHearts: 0, blackHearts: 0 } },
  { id: 'samson', name: 'Samson', localizedName: 'Sansão', spriteUrl: `${WIKI_IMAGES}8/8c/Character_Samson_appearance.png`, startingHealth: { redHearts: 3, soulHearts: 0, blackHearts: 0 } },
  { id: 'azazel', name: 'Azazel', localizedName: 'Azazel', spriteUrl: `${WIKI_IMAGES}0/06/Character_Azazel_appearance.png`, startingHealth: { redHearts: 0, soulHearts: 0, blackHearts: 3 } },
  { id: 'lazarus', name: 'Lazarus', localizedName: 'Lázaro', spriteUrl: `${WIKI_IMAGES}7/78/Character_Lazarus_appearance.png`, startingHealth: { redHearts: 3, soulHearts: 0, blackHearts: 0 } },
  { id: 'eden', name: 'Eden', localizedName: 'Éden', spriteUrl: `${WIKI_IMAGES}8/83/Character_Eden_appearance.png`, startingHealth: { redHearts: 0, soulHearts: 0, blackHearts: 0 } },
  { id: 'the-lost', name: 'The Lost', localizedName: 'O Perdido', spriteUrl: `${WIKI_IMAGES}f/f0/Character_The_Lost_appearance.png`, startingHealth: { redHearts: 0, soulHearts: 0, blackHearts: 0 } },
  { id: 'lilith', name: 'Lilith', localizedName: 'Lilith', spriteUrl: `${WIKI_IMAGES}a/a8/Character_Lilith_appearance.png`, startingHealth: { redHearts: 1, soulHearts: 0, blackHearts: 2 } },
  { id: 'keeper', name: 'Keeper', localizedName: 'Keeper', spriteUrl: `${WIKI_IMAGES}2/20/Character_Keeper_appearance.png`, startingHealth: { redHearts: 2, soulHearts: 0, blackHearts: 0 } },
  { id: 'apollyon', name: 'Apollyon', localizedName: 'Apollyon', spriteUrl: `${WIKI_IMAGES}4/40/Character_Apollyon_appearance.png`, startingHealth: { redHearts: 2, soulHearts: 0, blackHearts: 0 } },
  { id: 'the-forgotten', name: 'The Forgotten', localizedName: 'O Esquecido', spriteUrl: `${WIKI_IMAGES}2/21/Character_The_Forgotten_appearance.png`, startingHealth: { redHearts: 2, soulHearts: 0, blackHearts: 0 } },
]

export interface FloorPreset {
  id: string
  name: string
  localizedName: string
  chapter: string
  /** Floor reached by going down the trapdoor, when it is unambiguous. */
  next?: string
}

interface ChapterSpec {
  chapter: string
  variants: Array<[id: string, name: string, localizedName: string]>
  nextVariants: string[]
}

const STAGED_CHAPTERS: ChapterSpec[] = [
  {
    chapter: 'Capítulo 1',
    variants: [['basement', 'Basement', 'Porão'], ['cellar', 'Cellar', 'Adega'], ['burning-basement', 'Burning Basement', 'Porão em Chamas']],
    nextVariants: ['caves', 'catacombs', 'flooded-caves'],
  },
  {
    chapter: 'Capítulo 2',
    variants: [['caves', 'Caves', 'Cavernas'], ['catacombs', 'Catacombs', 'Catacumbas'], ['flooded-caves', 'Flooded Caves', 'Cavernas Alagadas']],
    nextVariants: ['depths', 'necropolis', 'dank-depths'],
  },
  {
    chapter: 'Capítulo 3',
    variants: [['depths', 'Depths', 'Profundezas'], ['necropolis', 'Necropolis', 'Necrópole'], ['dank-depths', 'Dank Depths', 'Profundezas Úmidas']],
    nextVariants: ['womb', 'utero', 'scarred-womb'],
  },
  {
    chapter: 'Capítulo 4',
    variants: [['womb', 'Womb', 'Útero'], ['utero', 'Utero', 'Utero'], ['scarred-womb', 'Scarred Womb', 'Útero Cicatrizado']],
    nextVariants: [],
  },
]

export const FLOORS: FloorPreset[] = [
  ...STAGED_CHAPTERS.flatMap(({ chapter, variants, nextVariants }) => variants.flatMap(([id, name, localizedName], index) => [
    { id: `${id}-1`, name: `${name} I`, localizedName: `${localizedName} I`, chapter, next: `${id}-2` },
    { id: `${id}-2`, name: `${name} II`, localizedName: `${localizedName} II`, chapter, next: nextVariants.length ? `${nextVariants[index]}-1` : undefined },
  ])),
  { id: 'blue-womb', name: '??? (Blue Womb)', localizedName: 'Útero Azul', chapter: 'Capítulo 4.5' },
  { id: 'sheol', name: 'Sheol', localizedName: 'Sheol', chapter: 'Capítulo 5', next: 'dark-room' },
  { id: 'cathedral', name: 'Cathedral', localizedName: 'Catedral', chapter: 'Capítulo 5', next: 'chest' },
  { id: 'dark-room', name: 'Dark Room', localizedName: 'Quarto Escuro', chapter: 'Capítulo 6' },
  { id: 'chest', name: 'The Chest', localizedName: 'O Baú', chapter: 'Capítulo 6' },
  { id: 'void', name: 'The Void', localizedName: 'O Vazio', chapter: 'Final' },
]

export function findFloor(id: string | undefined): FloorPreset | undefined {
  return FLOORS.find((floor) => floor.id === id)
}

export function findCharacter(id: string | undefined): CharacterPreset | undefined {
  return CHARACTERS.find((character) => character.id === id)
}

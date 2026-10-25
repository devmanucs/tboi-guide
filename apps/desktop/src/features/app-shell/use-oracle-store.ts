import { create } from 'zustand'
import { displayName } from '../../../../../packages/isaac-data/src/catalog'
import type { IsaacItem, RunState, RunUpdate } from '../../../../../packages/isaac-data/src/types'
import { findCharacter } from '../../../../../packages/isaac-data/src/run-presets'
import { play } from '../../ui/sound'
import { toast, toastError } from '../../ui/toast'

export type Screen = 'live' | 'catalog'

interface OracleStore {
  screen: Screen
  catalog: IsaacItem[]
  itemsById: Map<number, IsaacItem>
  query: string
  selectedItem: IsaacItem | null
  run: RunState | null
  isLoading: boolean
  loadError: string | null
  paletteOpen: boolean
  pinned: boolean
  setScreen: (screen: Screen) => void
  setQuery: (query: string) => void
  selectItem: (item: IsaacItem | null) => void
  openItem: (item: IsaacItem) => void
  setPaletteOpen: (open: boolean) => void
  togglePinned: () => Promise<void>
  load: () => Promise<void>
  startRun: (characterId?: string) => Promise<void>
  chooseCharacter: (characterId: string) => Promise<void>
  addItemToRun: (itemId: number) => Promise<void>
  removeItemFromRun: (itemId: number) => Promise<void>
  updateRun: (update: RunUpdate) => Promise<void>
  endRun: () => Promise<void>
}

function getFailureMessage(error: unknown): string {
  return error instanceof Error ? error.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '') : String(error)
}

export const useOracleStore = create<OracleStore>((set, get) => ({
  screen: 'live',
  catalog: [],
  itemsById: new Map(),
  query: '',
  selectedItem: null,
  run: null,
  isLoading: true,
  loadError: null,
  paletteOpen: false,
  pinned: false,
  setScreen: (screen) => set({ screen }),
  setQuery: (query) => set({ query }),
  selectItem: (selectedItem) => set({ selectedItem }),
  openItem: (item) => set({ selectedItem: item, screen: 'catalog', query: '' }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePinned: async () => {
    try {
      const pinned = await window.oracle.setPinned(!get().pinned)
      set({ pinned })
      toast(pinned ? 'Janela fixada por cima das outras' : 'Janela solta')
    } catch (error) {
      toastError(`Não foi possível fixar a janela: ${getFailureMessage(error)}`)
    }
  },
  load: async () => {
    set({ isLoading: true, loadError: null })
    try {
      const [catalog, run] = await Promise.all([window.oracle.listItems(''), window.oracle.getCurrentRun()])
      set({ catalog, itemsById: new Map(catalog.map((item) => [item.id, item])), run, isLoading: false })
    } catch (error) {
      console.error('Falha ao carregar os dados locais:', error)
      set({ loadError: `Não foi possível abrir o catálogo local: ${getFailureMessage(error)}`, isLoading: false })
    }
  },
  startRun: async (characterId) => {
    try {
      const run = await window.oracle.startRun()
      set({ run, screen: 'live' })
      play('start')
      if (characterId) await get().chooseCharacter(characterId)
    } catch (error) {
      console.error('Falha ao iniciar a run:', error)
      toastError(`Não foi possível iniciar a run: ${getFailureMessage(error)}`)
    }
  },
  chooseCharacter: async (characterId) => {
    const run = get().run
    const character = findCharacter(characterId)
    if (!run || !character) return
    const isFresh = !run.health || (run.collectibles.length === 0 && Object.values(run.health).every((value) => value === 0))
    await get().updateRun({ character: characterId, ...isFresh ? { health: character.startingHealth } : {} })
  },
  addItemToRun: async (itemId) => {
    const item = get().itemsById.get(itemId)
    try {
      if (!get().run) set({ run: await window.oracle.startRun() })
      if (get().run?.collectibles.includes(itemId)) {
        play('tick')
        toast(`${item ? displayName(item) : 'Item'} já está na run`)
        return
      }
      const run = await window.oracle.addItem(itemId)
      set({ run })
      play('pickup')
      toast(`${item ? displayName(item) : 'Item'} adicionado à run`, {
        label: 'Desfazer',
        run: () => void get().removeItemFromRun(itemId),
      })
    } catch (error) {
      toastError(`Não foi possível adicionar o item: ${getFailureMessage(error)}`)
    }
  },
  removeItemFromRun: async (itemId) => {
    try {
      const run = await window.oracle.removeItem(itemId)
      set({ run })
      play('remove')
    } catch (error) {
      toastError(`Não foi possível remover o item: ${getFailureMessage(error)}`)
    }
  },
  updateRun: async (update) => {
    const previous = get().run
    if (previous) set({ run: { ...previous, ...update } })
    try {
      const run = await window.oracle.updateRun(update)
      set({ run })
    } catch (error) {
      set({ run: previous })
      toastError(`Não foi possível salvar a run: ${getFailureMessage(error)}`)
    }
  },
  endRun: async () => {
    try {
      await window.oracle.endRun()
      set({ run: null })
      play('end')
      toast('Run encerrada')
    } catch (error) {
      toastError(`Não foi possível encerrar a run: ${getFailureMessage(error)}`)
    }
  },
}))

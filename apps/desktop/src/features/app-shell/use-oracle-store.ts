import { create } from 'zustand'
import type { IsaacItem, RunState, RunUpdate } from '../../../../../packages/isaac-data/src/types'

type Screen = 'live' | 'finder' | 'collection'

interface OracleStore {
  screen: Screen
  query: string
  items: IsaacItem[]
  selectedItem: IsaacItem | null
  run: RunState | null
  isLoading: boolean
  error: string | null
  setScreen: (screen: Screen) => void
  setQuery: (query: string) => void
  selectItem: (item: IsaacItem | null) => void
  load: () => Promise<void>
  search: (query: string) => Promise<void>
  startRun: () => Promise<void>
  addItemToRun: (itemId: number) => Promise<void>
  removeItemFromRun: (itemId: number) => Promise<void>
  updateRun: (update: RunUpdate) => Promise<void>
  endRun: () => Promise<void>
}

let latestSearchRequest = 0

function getFailureMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export const useOracleStore = create<OracleStore>((set) => ({
  screen: 'finder',
  query: '',
  items: [],
  selectedItem: null,
  run: null,
  isLoading: false,
  error: null,
  setScreen: (screen) => set({ screen }),
  setQuery: (query) => set({ query }),
  selectItem: (selectedItem) => set({ selectedItem }),
  load: async () => {
    set({ isLoading: true, error: null })
    try {
      const [items, run] = await Promise.all([window.oracle.listItems(''), window.oracle.getCurrentRun()])
      set({ items, run, isLoading: false })
    } catch (error) {
      console.error('Falha ao carregar os dados locais:', error)
      set({ error: `Não foi possível abrir o catálogo local: ${getFailureMessage(error)}`, isLoading: false })
    }
  },
  search: async (query) => {
    const requestId = ++latestSearchRequest
    set({ isLoading: true, error: null })
    try {
      const items = await window.oracle.listItems(query)
      if (requestId === latestSearchRequest) set({ items, isLoading: false })
    } catch (error) {
      console.error('Falha na busca local:', error)
      if (requestId === latestSearchRequest) set({ error: `A busca local falhou: ${getFailureMessage(error)}`, isLoading: false })
    }
  },
  startRun: async () => {
    try {
      const run = await window.oracle.startRun()
      set({ run, screen: 'live', error: null })
    } catch (error) {
      console.error('Falha ao iniciar a run:', error)
      set({ error: `Não foi possível iniciar a run: ${getFailureMessage(error)}` })
    }
  },
  addItemToRun: async (itemId) => {
    try {
      const run = await window.oracle.addItem(itemId)
      set({ run, error: null })
    } catch {
      set({ error: 'Inicie uma run antes de adicionar o item.' })
    }
  },
  removeItemFromRun: async (itemId) => {
    try {
      const run = await window.oracle.removeItem(itemId)
      set({ run, error: null })
    } catch {
      set({ error: 'Não foi possível remover o item.' })
    }
  },
  updateRun: async (update) => {
    try {
      const run = await window.oracle.updateRun(update)
      set({ run, error: null })
    } catch {
      set({ error: 'Não foi possível salvar os dados da run.' })
    }
  },
  endRun: async () => {
    await window.oracle.endRun()
    set({ run: null, error: null })
  },
}))

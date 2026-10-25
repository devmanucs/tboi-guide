/**
 * Dev-only stand-in for the Electron preload API, so the renderer can be opened
 * in a plain browser (`pnpm dev:web`) for quick UI work. Never bundled in builds.
 */
import catalogData from '../../../../data/afterbirth-plus/items.json'
import localizedData from '../../../../data/afterbirth-plus/items.pt-BR.json'
import { buildCatalog } from '../../../../packages/isaac-data/src/catalog'
import { searchItems } from '../../../../packages/isaac-data/src/search'
import type { RunState } from '../../../../packages/isaac-data/src/types'
import type { OracleApi } from '../../electron/preload'

const STORAGE_KEY = 'oracle-dev-run'
const items = buildCatalog(catalogData, localizedData)

function readRun(): RunState | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as RunState | null
  } catch {
    return null
  }
}

function writeRun(run: RunState | null): RunState | null {
  try {
    if (run) localStorage.setItem(STORAGE_KEY, JSON.stringify(run))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage may be unavailable in private windows; the run just won't persist.
  }
  return run
}

function requireRun(): RunState {
  const run = readRun()
  if (!run) throw new Error('Não há uma run ativa.')
  return run
}

export const browserOracle: OracleApi = {
  listItems: async (query) => searchItems(items, query),
  getCurrentRun: async () => readRun(),
  startRun: async () => writeRun({ id: crypto.randomUUID(), collectibles: [], trinkets: [], startedAt: Date.now() })!,
  addItem: async (itemId) => {
    const run = requireRun()
    if (!run.collectibles.includes(itemId)) run.collectibles.push(itemId)
    if (items.find((item) => item.id === itemId)?.type === 'active') run.activeItem = itemId
    return writeRun(run)!
  },
  removeItem: async (itemId) => {
    const run = requireRun()
    run.collectibles = run.collectibles.filter((id) => id !== itemId)
    if (run.activeItem === itemId) delete run.activeItem
    return writeRun(run)!
  },
  updateRun: async (update) => writeRun({ ...requireRun(), ...update })!,
  endRun: async () => {
    writeRun(null)
  },
  setPinned: async () => false,
}

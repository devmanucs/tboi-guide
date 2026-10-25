import { app, BrowserWindow, ipcMain, shell } from 'electron'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RunState, RunUpdate } from '../../../packages/isaac-data/src/types'
import { buildCatalog } from '../../../packages/isaac-data/src/catalog'
import { searchItems } from '../../../packages/isaac-data/src/search'
import catalog from '../../../data/afterbirth-plus/items.json'
import localizedCatalog from '../../../data/afterbirth-plus/items.pt-BR.json'

const items = buildCatalog(catalog, localizedCatalog)
const itemsById = new Map(items.map((item) => [item.id, item]))

const databasePath = join(app.getPath('userData'), 'basement-oracle.sqlite')
const database = new Database(databasePath)
database.pragma('journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    ended_at INTEGER
  );
`)

function getCurrentRun(): RunState | null {
  const row = database.prepare(
    'SELECT state_json FROM runs WHERE ended_at IS NULL ORDER BY rowid DESC LIMIT 1',
  ).get() as { state_json: string } | undefined
  return row ? JSON.parse(row.state_json) as RunState : null
}

function persistRun(state: RunState): void {
  database.prepare('INSERT OR REPLACE INTO runs (id, state_json, ended_at) VALUES (?, ?, NULL)')
    .run(state.id, JSON.stringify(state))
}

ipcMain.handle('items:list', (_event, query: string) => searchItems(items, query ?? ''))

ipcMain.handle('run:get', () => getCurrentRun())
ipcMain.handle('run:start', () => {
  database.prepare('UPDATE runs SET ended_at = ? WHERE ended_at IS NULL').run(Date.now())
  const state: RunState = {
    id: randomUUID(),
    collectibles: [],
    trinkets: [],
    startedAt: Date.now(),
  }
  persistRun(state)
  return state
})
ipcMain.handle('run:add-item', (_event, itemId: number) => {
  const state = getCurrentRun()
  if (!state) throw new Error('Inicie uma run antes de adicionar itens.')
  if (!state.collectibles.includes(itemId)) state.collectibles.push(itemId)
  if (itemsById.get(itemId)?.type === 'active') state.activeItem = itemId
  persistRun(state)
  return state
})
ipcMain.handle('run:remove-item', (_event, itemId: number) => {
  const state = getCurrentRun()
  if (!state) throw new Error('Não há uma run ativa.')
  state.collectibles = state.collectibles.filter((id) => id !== itemId)
  if (state.activeItem === itemId) delete state.activeItem
  persistRun(state)
  return state
})
ipcMain.handle('run:update', (_event, update: RunUpdate) => {
  const state = getCurrentRun()
  if (!state) throw new Error('Não há uma run ativa.')
  Object.assign(state, update)
  persistRun(state)
  return state
})
ipcMain.handle('run:end', () => {
  const state = getCurrentRun()
  if (state) database.prepare('UPDATE runs SET ended_at = ? WHERE id = ?').run(Date.now(), state.id)
})
ipcMain.handle('window:set-pinned', (event, pinned: boolean) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  window?.setAlwaysOnTop(pinned, 'floating')
  return window?.isAlwaysOnTop() ?? false
})

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#141211',
    title: 'The Guide of Isaac',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(fileURLToPath(new URL('.', import.meta.url)), '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(fileURLToPath(new URL('.', import.meta.url)), '../renderer/index.html'))
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (new URL(url).protocol === 'https:') void shell.openExternal(url)
    } catch {
      // Ignore malformed external links from catalog content.
    }
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => database.close())

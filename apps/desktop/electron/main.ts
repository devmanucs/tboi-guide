import { app, BrowserWindow, ipcMain, shell } from 'electron'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IsaacItem, RunState, RunUpdate } from '../../../packages/isaac-data/src/types'
import catalog from '../../../data/afterbirth-plus/items.json'
import localizedCatalog from '../../../data/afterbirth-plus/items.pt-BR.json'

const localizedItems = new Map(localizedCatalog.map((item) => [item.id, item]))

const databasePath = join(app.getPath('userData'), 'basement-oracle.sqlite')
const database = new Database(databasePath)
database.pragma('journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT NOT NULL,
    image_url TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_dlc TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    ended_at INTEGER
  );
`)

{
  const insert = database.prepare(`
    INSERT OR REPLACE INTO items (id, name, type, description, tags, image_url, source_url, source_dlc)
    VALUES (@id, @name, @type, @description, @tags, @imageUrl, @sourceUrl, @sourceDlc)
  `)
  database.transaction(() => {
    for (const item of catalog) insert.run({ ...item, tags: JSON.stringify(item.tags) })
  })()
}

function toIsaacItem(row: {
  id: number
  name: string
  type: 'passive' | 'active'
  description: string
  tags: string
  image_url: string
  source_url: string
}): IsaacItem {
  const description = row.description
  const localized = localizedItems.get(row.id)
  const localizedDescription = localized?.localizedDescription ?? description

  return {
    id: row.id,
    name: row.name,
    localizedName: localized?.localizedName,
    version: 'afterbirth-plus',
    type: row.type,
    shortDescription: description.split(/[.!?]\s/)[0] ?? description,
    localizedShortDescription: localizedDescription.split(/(?<=[.!?])\s|\n/)[0] ?? localizedDescription,
    description,
    localizedDescription,
    effects: [],
    pools: [],
    transformations: [],
    tags: JSON.parse(row.tags) as string[],
    localizedTags: localized?.localizedTags,
    aliases: [],
    spritePath: row.image_url,
    sourceUrl: row.source_url,
  }
}

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

ipcMain.handle('items:list', (_event, query: string) => {
  try {
    const trimmedQuery = query.trim()
    const rows = database.prepare(`
        SELECT id, name, type, description, tags, image_url, source_url
        FROM items ORDER BY name COLLATE NOCASE
        `).all()
    const items = rows.map((row) => toIsaacItem(row as Parameters<typeof toIsaacItem>[0]))
    if (!trimmedQuery) return items

    const normalizedQuery = trimmedQuery.toLocaleLowerCase('pt-BR')
    return items.filter((item) => item.id.toString() === trimmedQuery || [
      item.name,
      item.localizedName,
      item.description,
      item.localizedDescription,
      ...item.tags,
      ...item.localizedTags ?? [],
    ].some((value) => value?.toLocaleLowerCase('pt-BR').includes(normalizedQuery)))
  } catch (error) {
    console.error('Failed to query local item catalog:', error)
    throw error
  }
})

ipcMain.handle('run:get', () => getCurrentRun())
ipcMain.handle('run:start', () => {
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
  const item = database.prepare('SELECT type FROM items WHERE id = ?').get(itemId) as { type: 'passive' | 'active' } | undefined
  if (item?.type === 'active') state.activeItem = itemId
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

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#161412',
    title: 'Basement Oracle',
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

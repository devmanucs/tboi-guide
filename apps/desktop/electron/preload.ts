import { contextBridge, ipcRenderer } from 'electron'
import type { IsaacItem, RunState, RunUpdate } from '../../../packages/isaac-data/src/types'

export interface OracleApi {
  listItems(query: string): Promise<IsaacItem[]>
  getCurrentRun(): Promise<RunState | null>
  startRun(): Promise<RunState>
  addItem(itemId: number): Promise<RunState>
  removeItem(itemId: number): Promise<RunState>
  updateRun(update: RunUpdate): Promise<RunState>
  endRun(): Promise<void>
}

const oracleApi: OracleApi = {
  listItems: (query) => ipcRenderer.invoke('items:list', query),
  getCurrentRun: () => ipcRenderer.invoke('run:get'),
  startRun: () => ipcRenderer.invoke('run:start'),
  addItem: (itemId) => ipcRenderer.invoke('run:add-item', itemId),
  removeItem: (itemId) => ipcRenderer.invoke('run:remove-item', itemId),
  updateRun: (update) => ipcRenderer.invoke('run:update', update),
  endRun: () => ipcRenderer.invoke('run:end'),
}

contextBridge.exposeInMainWorld('oracle', oracleApi)

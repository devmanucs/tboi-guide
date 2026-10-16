import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { input: { index: resolve('apps/desktop/electron/main.ts') } },
    },
    resolve: {
      alias: { '@data': resolve('packages/isaac-data/src') },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve('apps/desktop/electron/preload.ts') },
        output: { format: 'cjs', entryFileNames: 'index.cjs' },
      },
    },
  },
  renderer: {
    root: resolve('.'),
    build: {
      rollupOptions: { input: resolve('index.html') },
    },
    resolve: {
      alias: { '@': resolve('apps/desktop/src') },
    },
    plugins: [react(), tailwindcss()],
  },
})

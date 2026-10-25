import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Renderer-only dev server for UI work in a regular browser (uses apps/desktop/src/dev/browser-oracle.ts).
export default defineConfig({
  root: resolve('.'),
  resolve: { alias: { '@': resolve('apps/desktop/src') } },
  plugins: [react(), tailwindcss()],
  server: { port: 5199, strictPort: true },
})

import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppShell } from './features/app-shell/app-shell'
import './globals.css'

if (import.meta.env.DEV && !window.oracle) {
  window.oracle = (await import('./dev/browser-oracle')).browserOracle
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)

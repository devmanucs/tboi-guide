import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppShell } from './features/app-shell/app-shell'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)

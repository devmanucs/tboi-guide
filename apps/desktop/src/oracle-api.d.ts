import type { OracleApi } from '../electron/preload'

declare global {
  interface Window {
    oracle: OracleApi
  }
}

export {}

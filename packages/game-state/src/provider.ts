import type { RunState } from '../../isaac-data/src/types'

export interface GameStateProvider {
  getState(): Promise<Partial<RunState>>
}

export class ManualGameStateProvider implements GameStateProvider {
  constructor(private readonly currentState: () => Partial<RunState>) {}

  async getState(): Promise<Partial<RunState>> {
    return this.currentState()
  }
}

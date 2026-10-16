import type { ItemCandidate } from '../../isaac-data/src/types'

export interface DetectionInput {
  imagePath: string
}

export interface ItemDetector {
  detect(input: DetectionInput): Promise<ItemCandidate[]>
}

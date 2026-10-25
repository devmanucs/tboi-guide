import { useState } from 'react'
import type { CharacterPreset } from '../../../../../packages/isaac-data/src/run-presets'
import { cn } from '../../ui/cn'

export function CharacterPortrait({ character, className }: { character: CharacterPreset | undefined; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (!character || failedUrl === character.spriteUrl) {
    return <img src="/assets/isaac-crying-grande.png" alt="" draggable={false} className={cn('object-contain', !character && 'opacity-40 grayscale', className)} />
  }

  return (
    <img
      src={character.spriteUrl}
      alt={character.localizedName}
      draggable={false}
      onError={() => setFailedUrl(character.spriteUrl)}
      className={cn('object-contain pixelated', className)}
    />
  )
}

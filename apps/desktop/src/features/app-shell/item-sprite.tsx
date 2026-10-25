import { useState } from 'react'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'
import { cn } from '../../ui/cn'

export function ItemSprite({ item, className }: { item: IsaacItem; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (!item.spritePath || failed) {
    return <span className={cn('flex items-center justify-center font-display text-[9px] text-oracle-paper-muted', className)}>#{item.gameId}</span>
  }

  return <img src={item.spritePath} alt="" loading="lazy" draggable={false} onError={() => setFailed(true)} className={cn('object-contain pixelated', className)} />
}

export function itemKindLabel(item: IsaacItem): string {
  if (item.type === 'card') return item.subType === 'tarot' ? 'Tarô' : item.subType === 'playing' ? 'Baralho' : 'Carta'
  return { active: 'Ativo', familiar: 'Familiar', trinket: 'Trinket', passive: 'Passivo', rune: 'Runa' }[item.type]
}

import { useState } from 'react'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'

interface ItemTileProps {
  item: IsaacItem
  selected: boolean
  onSelect: (item: IsaacItem) => void
}

export function ItemTile({ item, selected, onSelect }: ItemTileProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const itemKind = item.type === 'active' ? 'Ativo' : item.type === 'familiar' ? 'Familiar' : 'Passivo'
  const tags = item.localizedTags ?? item.tags

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`group relative flex min-h-[280px] flex-col overflow-hidden rounded-[3px_15px_7px_11px] bg-oracle-paper bg-[url('/assets/isaac-paper.png')] bg-cover p-3.5 text-left text-oracle-paper-ink shadow-[0_4px_0_var(--oracle-shadow),0_8px_16px_#0004] transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_6px_0_var(--oracle-shadow),0_12px_20px_#0005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-oracle-blood-light ${selected ? '-rotate-[0.6deg] shadow-[0_0_0_2px_var(--oracle-blood-light),0_5px_0_var(--oracle-shadow),0_10px_18px_#0005]' : 'hover:rotate-[0.4deg]'}`}
      aria-pressed={selected}
    >
      <span className="flex w-full items-center justify-between font-display text-[9px] uppercase tracking-wide text-oracle-paper-muted">
        <span>{itemKind}</span><span>#{item.id}</span>
      </span>
      <span className="relative mt-2 flex h-[116px] w-full items-center justify-center overflow-hidden rounded-[2px_11px_5px_8px] bg-oracle-paper-shadow/70">
        {item.spritePath && !imageFailed ? (
          <img src={item.spritePath} alt="" loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-contain [image-rendering:pixelated]" />
        ) : (
          <span className="font-display text-[10px] text-oracle-paper-muted">#{item.id}</span>
        )}
      </span>
      <span className="mt-3 line-clamp-2 min-h-9 text-[15px] font-black uppercase leading-[1.15] tracking-[0.035em] text-oracle-paper-ink">{item.localizedName || item.name}</span>
      {item.localizedName && item.localizedName !== item.name && <span className="mt-0.5 truncate text-[10px] text-oracle-paper-muted">{item.name}</span>}
      <span className="mt-1 line-clamp-2 min-h-9 text-[13px] leading-[1.4] text-oracle-paper-muted">{item.localizedShortDescription || item.shortDescription || item.description}</span>
      <span className="mt-auto flex items-center justify-between gap-2 pt-2 font-display text-[9px] uppercase text-oracle-paper-muted">
        <span className="truncate">{tags.slice(0, 2).join(' · ') || item.version.replaceAll('-', ' ')}</span>
        <span className="text-[11px] text-oracle-blood">{selected ? '✦' : '↗'}</span>
      </span>
    </button>
  )
}



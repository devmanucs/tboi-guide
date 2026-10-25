import { displayName, hasDistinctEnglishName } from '../../../../../packages/isaac-data/src/catalog'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'
import { cn } from '../../ui/cn'
import { ItemSprite, itemKindLabel } from './item-sprite'

interface ItemTileProps {
  item: IsaacItem
  selected: boolean
  inRun?: boolean
  onSelect: (item: IsaacItem) => void
}

export function ItemTile({ item, selected, inRun, onSelect }: ItemTileProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-pressed={selected}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-torn paper-card p-3 text-left shadow-[0_4px_0_var(--oracle-shadow),0_8px_16px_rgb(0_0_0/0.25)] transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_6px_0_var(--oracle-shadow),0_14px_24px_rgb(0_0_0/0.35)]',
        selected ? '-rotate-[0.8deg] shadow-[0_0_0_2px_var(--oracle-blood-light),0_5px_0_var(--oracle-shadow),0_12px_22px_rgb(0_0_0/0.4)]' : 'hover:rotate-[0.5deg]',
      )}
    >
      <span className="flex w-full items-center justify-between font-display text-[8px] uppercase tracking-wide text-oracle-paper-muted">
        <span className={item.type === 'active' ? 'text-oracle-blood' : undefined}>{itemKindLabel(item)}</span>
        <span>#{item.gameId}</span>
      </span>
      <span className="relative mt-2 flex h-[84px] w-full items-center justify-center rounded-torn-sm bg-oracle-paper-shadow/60 shadow-[inset_0_2px_0_rgb(0_0_0/0.06)]">
        <ItemSprite item={item} className="h-[64px] w-[64px] transition-transform duration-200 group-hover:scale-110" />
        {inRun && <span className="absolute right-1.5 top-1.5 rounded-full bg-oracle-blood px-1.5 py-0.5 font-display text-[7px] uppercase text-[#fff0dc]">Na run</span>}
      </span>
      <span className="mt-2.5 line-clamp-2 text-[14px] font-black uppercase leading-[1.15] tracking-[0.03em]">{displayName(item)}</span>
      <span className="mt-0.5 truncate text-[11px] font-semibold text-oracle-paper-muted">{hasDistinctEnglishName(item) ? item.name : ' '}</span>
      <span className="mt-1.5 line-clamp-2 text-[12px] leading-[1.4] text-oracle-paper-muted">{item.localizedShortDescription || item.shortDescription}</span>
    </button>
  )
}

import { ChevronDown, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { displayName, hasDistinctEnglishName } from '../../../../../packages/isaac-data/src/catalog'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'
import { Button } from '../../ui/button'
import { cn } from '../../ui/cn'
import { ItemSprite, itemKindLabel } from './item-sprite'
import { useOracleStore } from './use-oracle-store'

interface ItemDetailProps {
  item: IsaacItem | null
  emptyHint?: string
  className?: string
}

export function ItemDetail({ item, emptyHint = 'Escolha uma carta para revelar o que ela faz', className }: ItemDetailProps) {
  if (!item) {
    return (
      <aside className={cn('flex min-h-[320px] flex-col items-center justify-center rounded-torn border border-dashed border-oracle-line-strong px-6 text-center text-oracle-quiet', className)}>
        <div className="font-display text-3xl text-oracle-special/70">✦</div>
        <p className="mt-3 max-w-52 font-display text-[8px] uppercase leading-5 tracking-wide">{emptyHint}</p>
      </aside>
    )
  }

  return <FilledItemDetail key={item.id} item={item} className={className} />
}

function FilledItemDetail({ item, className }: { item: IsaacItem; className?: string }) {
  const { run, addItemToRun, removeItemFromRun } = useOracleStore()
  const [showOriginal, setShowOriginal] = useState(false)
  const description = item.localizedDescription || item.description
  const alreadyInRun = run?.collectibles.includes(item.id) ?? false

  return (
    <aside className={cn('flex flex-col gap-3 animate-fade-in', className)}>
      <article className="overflow-hidden rounded-torn paper-card p-4 shadow-[0_5px_0_var(--oracle-shadow),0_14px_28px_rgb(0_0_0/0.4)]">
        <div className="flex items-center justify-between font-display text-[8px] uppercase tracking-wide text-oracle-paper-muted">
          <span className={item.type === 'active' ? 'text-oracle-blood' : undefined}>{itemKindLabel(item)}</span>
          <span>#{item.gameId}</span>
        </div>
        <div className="my-3 flex h-[132px] items-center justify-center rounded-torn-sm bg-oracle-paper-shadow/65 shadow-[inset_0_2px_0_rgb(0_0_0/0.06)]">
          <ItemSprite item={item} className="h-[104px] w-[104px]" />
        </div>
        <h2 className="text-center text-[19px] font-black uppercase leading-[1.15] tracking-[0.04em]">{displayName(item)}</h2>
        {hasDistinctEnglishName(item) && <p className="mt-1 text-center text-[12px] font-semibold text-oracle-paper-muted">{item.name}</p>}

        <div className="mt-4 font-display text-[9px] uppercase text-oracle-blood">O que faz</div>
        <p data-selectable className="mt-1.5 whitespace-pre-line text-[14px] font-medium leading-[1.55]">{description}</p>

        {item.localizedDescription && item.localizedDescription !== item.description && (
          <div className="mt-3 border-t border-oracle-paper-ink/10 pt-2">
            <button
              type="button"
              onClick={() => setShowOriginal((current) => !current)}
              aria-expanded={showOriginal}
              className="flex w-full items-center justify-between py-1 font-display text-[8px] uppercase tracking-wide text-oracle-paper-muted hover:text-oracle-paper-ink"
            >
              Texto original em inglês
              <ChevronDown size={12} className={cn('transition-transform', showOriginal && 'rotate-180')} />
            </button>
            {showOriginal && <p data-selectable className="mt-1 whitespace-pre-line text-[12px] leading-5 text-oracle-paper-muted animate-fade-in">{item.description}</p>}
          </div>
        )}
      </article>

      {alreadyInRun ? (
        <Button variant="secondary" size="lg" className="w-full justify-center" icon={<Trash2 size={14} />} onClick={() => void removeItemFromRun(item.id)}>
          Tirar da run
        </Button>
      ) : (
        <Button variant="primary" size="lg" className="w-full justify-center" icon={<Plus size={15} />} onClick={() => void addItemToRun(item.id)}>
          {run ? 'Adicionar à run' : 'Começar run com este item'}
        </Button>
      )}
      {item.sourceUrl && (
        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 font-display text-[8px] uppercase tracking-wide text-oracle-quiet transition-colors hover:text-oracle-special">
          Ver na wiki <ExternalLink size={10} />
        </a>
      )}
    </aside>
  )
}

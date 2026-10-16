import { ArrowDownToLine, ExternalLink } from 'lucide-react'
import type { IsaacItem, RunState } from '../../../../../packages/isaac-data/src/types'

interface ItemDetailProps {
  item: IsaacItem | null
  run: RunState | null
  onAddToRun: (itemId: number) => void
}

export function ItemDetail({ item, run, onAddToRun }: ItemDetailProps) {
  if (!item) {
    return (
      <aside className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center text-oracle-muted">
        <div className="font-display text-3xl text-oracle-special">✦</div>
        <p className="mt-3 max-w-52 font-display text-[8px] uppercase leading-5 tracking-wide">Escolha uma carta para revelar o que ela faz</p>
      </aside>
    )
  }

  const itemKind = item.type === 'active' ? 'Ativo' : item.type === 'familiar' ? 'Familiar' : 'Passivo'
  const description = item.localizedDescription || item.description
  const shortDescription = item.localizedShortDescription || item.shortDescription
  const tags = item.localizedTags ?? item.tags
  const alreadyInRun = run?.collectibles.includes(item.id) ?? false

  return (
    <aside className="self-start px-1 pb-3">
      <div className="mb-3 flex items-center justify-between font-display text-[9px] uppercase tracking-wide text-oracle-muted">
        <span>Carta revelada</span><span>#{item.id}</span>
      </div>
      <article className="overflow-hidden rounded-[4px_17px_7px_12px] bg-oracle-paper bg-[url('/assets/isaac-paper.png')] bg-cover p-4 text-oracle-paper-ink shadow-[0_5px_0_#090b0a,0_12px_24px_#0005]">
        <div className="flex items-center justify-between font-display text-[9px] uppercase tracking-wide text-oracle-paper-muted">
          <span>{itemKind}</span><span>{item.version.replaceAll('-', ' ')}</span>
        </div>
        <div className="my-3 flex min-h-[174px] items-center justify-center overflow-hidden rounded-[3px_13px_6px_9px] bg-oracle-paper-shadow/75 p-2">
          {item.spritePath ? <img src={item.spritePath} alt={`${item.localizedName || item.name} sprite`} className="max-h-[148px] max-w-full object-contain [image-rendering:pixelated]" /> : <span className="font-display text-[10px] text-oracle-paper-muted">ITEM #{item.id}</span>}
        </div>
        <h2 className="text-center text-[20px] font-black uppercase leading-[1.15] tracking-[0.04em]">{item.localizedName || item.name}</h2>
        {item.localizedName && item.localizedName !== item.name && <p className="mt-1 text-center text-[12px] text-oracle-paper-muted">{item.name}</p>}
        <div className="mt-4 font-display text-[10px] uppercase text-oracle-blood">O que muda</div>
        <p className="mt-1.5 text-[15px] font-semibold leading-[1.5]">{shortDescription || description}</p>
        {description !== shortDescription && <details className="mt-3 text-[13px] leading-5 text-oracle-paper-muted">
          <summary className="cursor-pointer font-display text-[9px] uppercase tracking-wide">Ver descrição completa</summary>
          <p className="mt-2 whitespace-pre-line">{description}</p>
        </details>}
        {item.effects.length > 0 && <ul className="mt-2 list-inside list-disc text-[13px] leading-5 text-oracle-paper-muted">{item.effects.slice(0, 4).map((effect) => <li key={effect}>{effect}</li>)}</ul>}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 6).map((tag) => <span key={tag} className="rounded-full bg-oracle-surface-raised px-2.5 py-1 font-display text-[8px] uppercase text-oracle-paper">{tag}</span>)}
          {item.pools.slice(0, 3).map((pool) => <span key={pool} className="rounded-full bg-oracle-blood px-2.5 py-1 font-display text-[8px] uppercase text-oracle-paper">{pool}</span>)}
        </div>
        {(item.quality !== undefined || item.pools.length > 0) && <div className="mt-3 flex gap-3 font-display text-[9px] uppercase text-oracle-paper-muted">
          {item.quality !== undefined && <span>Qualidade {item.quality}</span>}{item.pools.length > 0 && <span>{item.pools.length} pools</span>}
        </div>}
      </article>
      {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1 font-display text-[9px] uppercase tracking-wide text-oracle-muted hover:text-oracle-special">Fonte do catálogo <ExternalLink size={11} /></a>}
      <button type="button" onClick={() => onAddToRun(item.id)} disabled={!run || alreadyInRun} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[4px_14px_6px_11px] bg-oracle-blood px-3 py-3 font-display text-[10px] uppercase tracking-wide text-oracle-paper shadow-[0_3px_0_#090b0a] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-oracle-blood-light disabled:cursor-not-allowed disabled:bg-[#3c433e] disabled:text-oracle-quiet disabled:shadow-none">
        <ArrowDownToLine size={14} />{!run ? 'Inicie uma run no Live' : alreadyInRun ? 'Já está na run' : 'Adicionar à run'}
      </button>
    </aside>
  )
}



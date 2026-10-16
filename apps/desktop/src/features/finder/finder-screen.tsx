import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { ItemDetail } from '../app-shell/item-detail'
import { ItemTile } from '../app-shell/item-tile'
import { useOracleStore } from '../app-shell/use-oracle-store'

type ItemFilter = 'all' | 'passive' | 'active'

export function FinderScreen() {
  const { query, setQuery, items, selectedItem, selectItem, isLoading, run, addItemToRun, search } = useOracleStore()
  const [filter, setFilter] = useState<ItemFilter>('all')

  useEffect(() => {
    const timer = window.setTimeout(() => void search(query), 140)
    return () => window.clearTimeout(timer)
  }, [query, search])

  const filteredItems = useMemo(
    () => items.filter((item) => filter === 'all' || item.type === filter),
    [filter, items],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-[10px] uppercase tracking-wide text-oracle-blood-light">Identificação rápida · catálogo local</div>
          <h1 className="mt-2 font-display text-[24px] uppercase leading-tight tracking-wide text-oracle-ink">Buscar item</h1>
        </div>
        <div className="font-display text-[10px] uppercase tracking-wide text-oracle-muted">{filteredItems.length} de {items.length} itens</div>
      </div>

      <label className="flex h-12 shrink-0 items-center gap-3 rounded-full bg-oracle-surface px-4 text-oracle-ink transition-colors focus-within:bg-oracle-surface-raised">
        <Search size={17} className="shrink-0 text-oracle-blood-light" aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome em português ou inglês, ID, efeito…" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-oracle-muted" autoFocus />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca" className="text-oracle-muted transition-colors hover:text-white"><X size={15} /></button>}
      </label>

      <div className="mt-4 flex shrink-0 items-center gap-4 pb-2">
        {(['all', 'passive', 'active'] as const).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option} className={`relative py-1.5 font-display text-[10px] uppercase tracking-wide transition-colors ${filter === option ? 'text-oracle-special after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-oracle-blood' : 'text-oracle-muted hover:text-oracle-ink'}`}>
            {option === 'all' ? 'Todos' : option === 'passive' ? 'Passivos' : 'Ativos'}
          </button>
        ))}
        <span className="ml-auto hidden font-display text-[9px] uppercase tracking-wide text-oracle-quiet sm:inline">Selecione uma carta para ver detalhes</span>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_314px]">
        <div className="min-h-[300px] overflow-y-auto pb-3 pr-1">
          {isLoading ? (
            <div className="py-14 text-center font-display text-[10px] uppercase tracking-wide text-oracle-muted">Consultando catálogo local…</div>
          ) : filteredItems.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4">
              {filteredItems.map((item) => <ItemTile key={item.id} item={item} selected={selectedItem?.id === item.id} onSelect={selectItem} />)}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-oracle-muted">
              <span className="font-display text-3xl text-oracle-blood-light">…</span>
              <p className="mt-3 font-display text-[10px] uppercase tracking-wide">Nenhum item encontrado</p>
              <p className="mt-1 text-[13px]">Tente outro nome ou palavra-chave.</p>
            </div>
          )}
        </div>
        <ItemDetail item={selectedItem} run={run} onAddToRun={(itemId) => void addItemToRun(itemId)} />
      </div>
    </div>
  )
}



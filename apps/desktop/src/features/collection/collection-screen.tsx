import { useMemo, useState } from 'react'
import { ItemDetail } from '../app-shell/item-detail'
import { ItemTile } from '../app-shell/item-tile'
import { useOracleStore } from '../app-shell/use-oracle-store'

type ItemFilter = 'all' | 'passive' | 'active'

export function CollectionScreen() {
  const { items, selectedItem, selectItem, run, addItemToRun } = useOracleStore()
  const [filter, setFilter] = useState<ItemFilter>('all')
  const filteredItems = useMemo(
    () => items.filter((item) => filter === 'all' || item.type === filter),
    [filter, items],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-[10px] uppercase tracking-wide text-oracle-blood-light">Rebirth · Afterbirth · Afterbirth+</div>
          <h1 className="mt-2 font-display text-[24px] uppercase leading-tight tracking-wide text-oracle-ink">Coleção</h1>
        </div>
        <div className="font-display text-[10px] uppercase tracking-wide text-oracle-muted">{filteredItems.length} registros · catálogo em validação</div>
      </div>

      <div className="flex shrink-0 items-center gap-4 pb-2">
        {(['all', 'passive', 'active'] as const).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option} className={`relative py-1.5 font-display text-[10px] uppercase tracking-wide transition-colors ${filter === option ? 'text-oracle-special after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-oracle-blood' : 'text-oracle-muted hover:text-oracle-ink'}`}>
            {option === 'all' ? 'Todos' : option === 'passive' ? 'Passivos' : 'Ativos'}
          </button>
        ))}
        <span className="ml-auto hidden font-display text-[9px] uppercase tracking-wide text-oracle-quiet sm:inline">Clique numa carta para inspecionar</span>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_314px]">
        <div className="min-h-[300px] overflow-y-auto pb-3 pr-1">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4">
            {filteredItems.map((item) => <ItemTile key={item.id} item={item} selected={selectedItem?.id === item.id} onSelect={selectItem} />)}
          </div>
        </div>
        <ItemDetail item={selectedItem} run={run} onAddToRun={(itemId) => void addItemToRun(itemId)} />
      </div>
    </div>
  )
}

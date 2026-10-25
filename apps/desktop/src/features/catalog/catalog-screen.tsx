import { ArrowUpDown, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { displayName } from '../../../../../packages/isaac-data/src/catalog'
import { rankItems } from '../../../../../packages/isaac-data/src/search'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'
import { Dialog } from '../../ui/dialog'
import { SegmentedControl } from '../../ui/segmented-control'
import { Select, type SelectOption } from '../../ui/select'
import { TextField } from '../../ui/text-field'
import { useMediaQuery } from '../../ui/use-media-query'
import { ItemDetail } from '../app-shell/item-detail'
import { ItemTile } from '../app-shell/item-tile'
import { useOracleStore } from '../app-shell/use-oracle-store'

type ItemFilter = 'all' | 'passive' | 'active' | 'familiar' | 'trinket' | 'card' | 'rune' | 'run'
type SortOrder = 'relevance' | 'name' | 'english' | 'id'

const sortOptions: SelectOption<SortOrder>[] = [
  { value: 'relevance', label: 'Relevância', hint: 'Melhor resultado' },
  { value: 'name', label: 'Nome', hint: 'Português' },
  { value: 'english', label: 'Nome original', hint: 'Inglês' },
  { value: 'id', label: 'ID do item', hint: '#1 → #500' },
]

const sorters: Record<Exclude<SortOrder, 'relevance'>, (a: IsaacItem, b: IsaacItem) => number> = {
  name: (a, b) => displayName(a).localeCompare(displayName(b), 'pt-BR'),
  english: (a, b) => a.name.localeCompare(b.name, 'en'),
  id: (a, b) => a.gameId - b.gameId || a.id - b.id,
}

export function CatalogScreen() {
  const { catalog, query, setQuery, selectedItem, selectItem, run } = useOracleStore()
  const [filter, setFilter] = useState<ItemFilter>('all')
  const [sort, setSort] = useState<SortOrder>('relevance')
  const [detailOpen, setDetailOpen] = useState(false)
  const isWide = useMediaQuery('(min-width: 1280px)')
  const inputRef = useRef<HTMLInputElement>(null)
  const runIds = useMemo(() => new Set(run?.collectibles ?? []), [run])

  const matches = useMemo(() => rankItems(catalog, query).map((result) => result.item), [catalog, query])
  const counts = useMemo(() => ({
    all: matches.length,
    passive: matches.filter((item) => item.type === 'passive').length,
    active: matches.filter((item) => item.type === 'active').length,
    familiar: matches.filter((item) => item.type === 'familiar').length,
    trinket: matches.filter((item) => item.type === 'trinket').length,
    card: matches.filter((item) => item.type === 'card').length,
    rune: matches.filter((item) => item.type === 'rune').length,
    run: matches.filter((item) => runIds.has(item.id)).length,
  }), [matches, runIds])
  const visibleItems = useMemo(() => {
    const filtered = matches.filter((item) => filter === 'all' || (filter === 'run' ? runIds.has(item.id) : item.type === filter))
    return sort === 'relevance' && query.trim() ? filtered : [...filtered].sort(sorters[sort === 'relevance' ? 'name' : sort])
  }, [filter, matches, query, runIds, sort])

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  function handleSelect(item: IsaacItem) {
    selectItem(item)
    if (!isWide) setDetailOpen(true)
  }

  return (
    <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-[9px] uppercase tracking-[0.18em] text-oracle-blood-light">Rebirth · Afterbirth · Afterbirth+</div>
            <h1 className="mt-2 font-display text-[22px] uppercase leading-tight tracking-wide text-oracle-ink">Catálogo</h1>
          </div>
          <div className="font-display text-[9px] uppercase tracking-wide text-oracle-quiet">{visibleItems.length} de {catalog.length} itens</div>
        </header>

        <div className="sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-3 bg-oracle-bg/85 px-1 py-2 backdrop-blur-md">
          <TextField
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            icon={<Search size={16} />}
            placeholder="Filtrar por nome (inglês ou português), ID, efeito…"
            containerClassName="min-w-[260px] flex-1"
          />
          <SegmentedControl
            label="Tipo de item"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Todos', count: counts.all },
              { value: 'passive', label: 'Passivos', count: counts.passive },
              { value: 'active', label: 'Ativos', count: counts.active },
              { value: 'familiar', label: 'Familiares', count: counts.familiar },
              { value: 'trinket', label: 'Trinkets', count: counts.trinket },
              { value: 'card', label: 'Cartas', count: counts.card },
              { value: 'rune', label: 'Runas', count: counts.rune },
              ...run ? [{ value: 'run' as const, label: 'Na run', count: counts.run }] : [],
            ]}
          />
          <Select className="w-[190px]" icon={<ArrowUpDown size={14} />} value={sort} options={sortOptions} onChange={setSort} align="end" menuClassName="w-[240px]" />
        </div>

        {visibleItems.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-4 pb-6">
            {visibleItems.map((item) => <ItemTile key={item.id} item={item} inRun={runIds.has(item.id)} selected={selectedItem?.id === item.id} onSelect={handleSelect} />)}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center text-oracle-quiet">
            <span className="font-display text-3xl text-oracle-blood-light">?</span>
            <p className="mt-3 font-display text-[9px] uppercase tracking-wide">Nenhum item encontrado</p>
            <p className="mt-1 text-[13px]">Tente parte do nome, em inglês ou português.</p>
          </div>
        )}
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-0">
          <div className="mb-3 font-display text-[8px] uppercase tracking-wide text-oracle-quiet">Carta revelada</div>
          <ItemDetail item={selectedItem} />
        </div>
      </div>

      <Dialog open={detailOpen && !isWide} onClose={() => setDetailOpen(false)} label="Detalhes do item" className="max-w-[360px] p-4">
        <ItemDetail item={selectedItem} />
      </Dialog>
    </div>
  )
}

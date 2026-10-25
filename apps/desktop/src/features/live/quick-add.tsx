import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { displayName, hasDistinctEnglishName } from '../../../../../packages/isaac-data/src/catalog'
import { rankItems } from '../../../../../packages/isaac-data/src/search'
import { cn } from '../../ui/cn'
import { Kbd } from '../../ui/kbd'
import { Popover } from '../../ui/popover'
import { TextField } from '../../ui/text-field'
import { ItemSprite, itemKindLabel } from '../app-shell/item-sprite'
import { useOracleStore } from '../app-shell/use-oracle-store'

const MAX_SUGGESTIONS = 7

export function QuickAdd({ autoFocus }: { autoFocus?: boolean }) {
  const { catalog, run, addItemToRun } = useOracleStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => query.trim() ? rankItems(catalog, query).slice(0, MAX_SUGGESTIONS).map((result) => result.item) : [], [catalog, query])

  useEffect(() => setHighlighted(0), [query])
  function add(itemId: number | undefined) {
    if (itemId === undefined) return
    void addItemToRun(itemId)
    setQuery('')
    inputRef.current?.focus()
  }

  const showMenu = open && query.trim().length > 0

  return (
    <div ref={rootRef} className="relative">
      <TextField
        ref={inputRef}
        size="lg"
        autoFocus={autoFocus}
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') setHighlighted((current) => Math.min(suggestions.length - 1, current + 1))
          else if (event.key === 'ArrowUp') setHighlighted((current) => Math.max(0, current - 1))
          else if (event.key === 'Enter') add(suggestions[highlighted]?.id)
          else if (event.key === 'Escape') {
            if (query) setQuery('')
            else event.currentTarget.blur()
          } else return
          event.preventDefault()
        }}
        placeholder={run ? 'Pegou um item? Digite o nome em inglês ou português…' : 'Digite o primeiro item para já começar a run…'}
        icon={<Plus size={18} strokeWidth={2.5} />}
        trailing={!query && <Kbd className="hidden md:inline-flex">Enter</Kbd>}
        aria-label="Adicionar item à run"
        role="combobox"
        aria-expanded={showMenu}
      />

      <Popover anchorRef={rootRef} open={showMenu} onDismiss={() => setOpen(false)} maxHeight={420}>
        <div className="overflow-y-auto p-1" role="listbox">
          {suggestions.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-oracle-quiet">Nenhum item com esse nome</div>}
          {suggestions.map((item, index) => {
            const inRun = run?.collectibles.includes(item.id) ?? false
            return (
              <div
                key={item.id}
                role="option"
                aria-selected={index === highlighted}
                onPointerMove={() => setHighlighted(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => add(item.id)}
                className={cn('flex cursor-pointer items-center gap-3 rounded-[4px] px-2.5 py-2', index === highlighted && 'bg-white/[0.07]')}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-torn-sm paper-card">
                  <ItemSprite item={item} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[14px] font-semibold text-oracle-ink">{displayName(item)}</span>
                    {hasDistinctEnglishName(item) && <span className="truncate text-[12px] text-oracle-quiet">{item.name}</span>}
                  </span>
                  <span className="block truncate text-[11px] text-oracle-muted">{item.localizedShortDescription || item.shortDescription}</span>
                </span>
                {inRun ? <span className="font-display text-[7px] uppercase text-oracle-blood-light">Na run</span> : <span className="font-display text-[8px] uppercase text-oracle-quiet">{itemKindLabel(item)}</span>}
              </div>
            )
          })}
        </div>
      </Popover>
    </div>
  )
}

import { BookOpen, CirclePlus, CornerDownLeft, Heart, Pin, Search, StepForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { displayName, hasDistinctEnglishName } from '../../../../../packages/isaac-data/src/catalog'
import { findFloor } from '../../../../../packages/isaac-data/src/run-presets'
import { normalizeSearchText, rankItems } from '../../../../../packages/isaac-data/src/search'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'
import { cn } from '../../ui/cn'
import { Dialog } from '../../ui/dialog'
import { Kbd } from '../../ui/kbd'
import { play } from '../../ui/sound'
import { ItemSprite, itemKindLabel } from '../app-shell/item-sprite'
import { useOracleStore } from '../app-shell/use-oracle-store'

type Entry =
  | { kind: 'item'; key: string; item: IsaacItem }
  | { kind: 'command'; key: string; label: string; hint: string; icon: ReactNode; keywords: string; perform: () => void }

const MAX_ITEM_RESULTS = 50

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useOracleStore()
  return (
    <Dialog open={paletteOpen} onClose={() => setPaletteOpen(false)} label="Pesquisa rápida" position="top" className="max-w-[880px]">
      <PaletteBody onClose={() => setPaletteOpen(false)} />
    </Dialog>
  )
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const { catalog, itemsById, run, pinned, addItemToRun, openItem, startRun, setScreen, togglePinned, updateRun } = useOracleStore()
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => play('open'), [])

  const commands = useMemo<Entry[]>(() => {
    const nextFloor = findFloor(findFloor(run?.floor)?.next)
    const list: Array<Entry | false> = [
      { kind: 'command', key: 'go-live', label: 'Ir para a run', hint: 'Tela Live', icon: <Heart size={15} />, keywords: 'live run atual', perform: () => setScreen('live') },
      { kind: 'command', key: 'go-catalog', label: 'Abrir catálogo', hint: 'Todos os itens', icon: <BookOpen size={15} />, keywords: 'catalogo colecao collection finder', perform: () => setScreen('catalog') },
      Boolean(nextFloor) && { kind: 'command', key: 'next-floor', label: `Descer para ${nextFloor!.localizedName}`, hint: nextFloor!.name, icon: <StepForward size={15} />, keywords: 'proximo andar next floor descer', perform: () => {
        play('floor')
        void updateRun({ floor: nextFloor!.id })
      } },
      { kind: 'command', key: 'new-run', label: run ? 'Começar nova run' : 'Nova run', hint: run ? 'Encerra a atual' : 'Comece a registrar', icon: <CirclePlus size={15} />, keywords: 'nova run new start iniciar', perform: () => void startRun() },
      { kind: 'command', key: 'pin', label: pinned ? 'Soltar janela' : 'Fixar janela por cima', hint: 'Sempre visível', icon: <Pin size={15} />, keywords: 'pin fixar topo always on top', perform: () => void togglePinned() },
    ]
    return list.filter((entry): entry is Entry => Boolean(entry))
  }, [pinned, run, setScreen, startRun, togglePinned, updateRun])

  const sections = useMemo(() => {
    const normalized = normalizeSearchText(query)
    if (!normalized) {
      const recent = [...run?.collectibles ?? []].reverse().slice(0, 6)
        .map((id) => itemsById.get(id))
        .filter((item): item is IsaacItem => Boolean(item))
        .map((item): Entry => ({ kind: 'item', key: `item-${item.id}`, item }))
      return [
        ...recent.length ? [{ title: 'Itens recentes da run', entries: recent }] : [],
        { title: 'Ações', entries: commands },
      ]
    }
    const matchedCommands = commands.filter((entry) => entry.kind === 'command' && normalizeSearchText(`${entry.label} ${entry.keywords}`).includes(normalized))
    const items = rankItems(catalog, query).slice(0, MAX_ITEM_RESULTS).map(({ item }): Entry => ({ kind: 'item', key: `item-${item.id}`, item }))
    return [
      ...items.length ? [{ title: 'Itens', entries: items }] : [],
      ...matchedCommands.length ? [{ title: 'Ações', entries: matchedCommands }] : [],
    ]
  }, [catalog, commands, itemsById, query, run])

  const entries = useMemo(() => sections.flatMap((section) => section.entries), [sections])
  const active = entries[Math.min(highlighted, entries.length - 1)]

  useEffect(() => setHighlighted(0), [query])
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  function perform(entry: Entry | undefined, alternate = false) {
    if (!entry) return
    onClose()
    if (entry.kind === 'command') entry.perform()
    else if (alternate) openItem(entry.item)
    else void addItemToRun(entry.item.id)
  }

  let index = -1

  return (
    <div
      className="flex h-[min(560px,72vh)] flex-col"
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') setHighlighted((current) => Math.min(entries.length - 1, current + 1))
        else if (event.key === 'ArrowUp') setHighlighted((current) => Math.max(0, current - 1))
        else if (event.key === 'PageDown') setHighlighted((current) => Math.min(entries.length - 1, current + 8))
        else if (event.key === 'PageUp') setHighlighted((current) => Math.max(0, current - 8))
        else if (event.key === 'Enter') perform(active, event.ctrlKey || event.metaKey || event.shiftKey)
        else return
        event.preventDefault()
      }}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-oracle-line px-5">
        <Search size={18} className="shrink-0 text-oracle-blood-light" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nome do item em inglês ou português, ID…"
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[17px] text-oracle-ink outline-none placeholder:text-oracle-quiet"
        />
        <Kbd>Esc</Kbd>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_300px]">
        <div ref={listRef} role="listbox" aria-label="Resultados" className="overflow-y-auto p-2">
          {entries.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-oracle-quiet">
              <span className="font-display text-2xl text-oracle-blood-light">?</span>
              <p className="mt-2 font-display text-[9px] uppercase tracking-wide">Nada encontrado</p>
              <p className="mt-1 text-[12px]">Tente parte do nome, como “moms kn” ou “brim”.</p>
            </div>
          )}
          {sections.map((section) => (
            <div key={section.title} className="mb-1">
              <div className="px-3 pb-1.5 pt-2 font-display text-[8px] uppercase tracking-wide text-oracle-quiet">{section.title}</div>
              {section.entries.map((entry) => {
                index++
                const entryIndex = index
                const isActive = entry === active
                return (
                  <div
                    key={entry.key}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    onPointerMove={() => setHighlighted(entryIndex)}
                    onClick={(event) => perform(entry, event.ctrlKey || event.metaKey)}
                    className={cn('flex cursor-pointer items-center gap-3 rounded-torn-sm px-3 py-2', isActive ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]')}
                  >
                    {entry.kind === 'item' ? <ItemRow item={entry.item} inRun={run?.collectibles.includes(entry.item.id) ?? false} /> : (
                      <>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-torn-sm bg-oracle-surface-raised text-oracle-blood-light">{entry.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold text-oracle-ink">{entry.label}</span>
                          <span className="block truncate text-[11px] text-oracle-quiet">{entry.hint}</span>
                        </span>
                      </>
                    )}
                    {isActive && <CornerDownLeft size={14} className="shrink-0 text-oracle-quiet" />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="overflow-y-auto border-l border-oracle-line bg-black/15 p-4">
          {active?.kind === 'item' ? <ItemPreview item={active.item} /> : (
            <div className="flex h-full flex-col items-center justify-center text-center text-oracle-quiet">
              <span className="font-display text-2xl text-oracle-special/70">✦</span>
              <p className="mt-3 max-w-48 text-[12px] leading-5">Pegou um item no jogo? Digite o nome que aparece na tela, em inglês mesmo.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-11 shrink-0 items-center gap-4 border-t border-oracle-line px-4 text-[11px] text-oracle-quiet">
        <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
        <span className="flex items-center gap-1.5"><Kbd>Enter</Kbd> {active?.kind === 'command' ? 'executar' : 'adicionar à run'}</span>
        <span className="flex items-center gap-1.5"><Kbd>Ctrl</Kbd><Kbd>Enter</Kbd> abrir no catálogo</span>
        <span className="ml-auto font-display text-[8px] uppercase tracking-wide">{catalog.length} itens</span>
      </div>
    </div>
  )
}

function ItemRow({ item, inRun }: { item: IsaacItem; inRun: boolean }) {
  return (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-torn-sm paper-card">
        <ItemSprite item={item} className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-oracle-ink">{displayName(item)}</span>
          {hasDistinctEnglishName(item) && <span className="truncate text-[12px] text-oracle-quiet">{item.name}</span>}
        </span>
        <span className="block truncate text-[11px] text-oracle-muted">{item.localizedShortDescription || item.shortDescription}</span>
      </span>
      {inRun && <span className="shrink-0 rounded-full bg-oracle-blood/25 px-2 py-0.5 font-display text-[7px] uppercase text-oracle-blood-light">Na run</span>}
      <span className={cn('shrink-0 font-display text-[8px] uppercase', item.type === 'active' ? 'text-oracle-blood-light' : 'text-oracle-quiet')}>{itemKindLabel(item)}</span>
    </>
  )
}

function ItemPreview({ item }: { item: IsaacItem }) {
  return (
    <div key={item.id} className="animate-fade-in">
      <div className="flex h-[120px] items-center justify-center rounded-torn paper-card shadow-[0_4px_0_var(--oracle-shadow)]">
        <ItemSprite item={item} className="h-[88px] w-[88px]" />
      </div>
      <h3 className="mt-3 text-[16px] font-black uppercase leading-tight tracking-[0.03em] text-oracle-ink">{displayName(item)}</h3>
      <p className="mt-0.5 text-[12px] text-oracle-quiet">{item.name} · #{item.gameId} · {itemKindLabel(item)}</p>
      <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.6] text-oracle-muted">{item.localizedDescription || item.description}</p>
    </div>
  )
}

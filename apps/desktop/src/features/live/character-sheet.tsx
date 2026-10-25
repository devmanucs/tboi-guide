import { Repeat2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { displayName, isPocketItem } from '../../../../../packages/isaac-data/src/catalog'
import { findCharacter, findFloor } from '../../../../../packages/isaac-data/src/run-presets'
import type { HealthState, IsaacItem, RunState } from '../../../../../packages/isaac-data/src/types'
import { cn } from '../../ui/cn'
import { Counter } from '../../ui/counter'
import { HeartRow, PixelBomb, PixelCoin, PixelHeart, PixelKey } from '../../ui/pixel-icons'
import { play, type SoundName } from '../../ui/sound'
import { ItemSprite } from '../app-shell/item-sprite'
import { useOracleStore } from '../app-shell/use-oracle-store'
import { CharacterPortrait } from './character-portrait'

const ORBIT_SIZE = 8
const MIN_SLOTS = 21

const formatHearts = (value: number) => (Number.isInteger(value) ? String(value) : `${Math.floor(value)}½`)

interface CharacterSheetProps {
  run: RunState
  /** Items in pickup order, oldest first. */
  items: IsaacItem[]
  selectedId: number | undefined
  onSelect: (itemId: number) => void
  onChangeCharacter: () => void
}

export function CharacterSheet({ run, items, selectedId, onSelect, onChangeCharacter }: CharacterSheetProps) {
  const updateRun = useOracleStore((state) => state.updateRun)
  const character = findCharacter(run.character)
  const floor = findFloor(run.floor)
  const health: HealthState = run.health ?? { redHearts: 0, soulHearts: 0, blackHearts: 0 }
  const activeItem = items.find((item) => item.id === run.activeItem)
  const trinket = [...items].reverse().find((item) => item.type === 'trinket')
  const pocket = [...items].reverse().find(isPocketItem)
  // Everything except what is held in the active and trinket slots; older actives and trinkets
  // stay listed (dimmed) since picking a new one swaps the old one out. Cards and runes are
  // consumables, so only the latest one shows, in the pocket slot.
  const passives = items.filter((item) => item.id !== run.activeItem && item.id !== trinket?.id && !isPocketItem(item))
  const newest = items[items.length - 1]
  const heldItem = useHeldItem(items)
  const orbiting = passives.filter((item) => item.type === 'passive' || item.type === 'familiar').slice(-ORBIT_SIZE)
  const slotCount = Math.max(MIN_SLOTS, Math.ceil((passives.length + 1) / 7) * 7)

  const setHealth = (field: keyof HealthState) => (value: number, direction: 1 | -1) => {
    play(direction > 0 ? 'heartUp' : 'heartDown')
    void updateRun({ health: { ...health, [field]: value } })
  }
  const setPickup = (field: 'coins' | 'bombs' | 'keys', sound: SoundName) => (value: number, direction: 1 | -1) => {
    play(direction > 0 ? sound : field === 'bombs' ? 'bomb' : 'tick')
    void updateRun({ [field]: value })
  }

  return (
    <section className="overflow-hidden rounded-torn bg-oracle-surface shadow-[inset_0_0_0_1px_var(--oracle-line),0_5px_0_var(--oracle-shadow),0_20px_40px_rgb(0_0_0/0.35)]">
      <div className="grid lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        {/* Stage: the character with its HUD, like the game screen */}
        <div className="relative flex min-h-[380px] flex-col overflow-hidden bg-[radial-gradient(70%_60%_at_50%_55%,#3a2c22_0%,#1d1612_70%,#120e0c_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-[url('/assets/isaac-paper.png')] bg-[length:320px] opacity-[0.07] mix-blend-screen" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgb(0_0_0/0.7)]" />

          <div className="relative flex items-start justify-between p-4">
            <div className="flex flex-col gap-2">
              <div className="flex max-w-[190px] flex-wrap gap-x-2 gap-y-1">
                <HeartRow amount={health.redHearts} kind="red" />
                {health.soulHearts > 0 && <HeartRow amount={health.soulHearts} kind="soul" />}
                {health.blackHearts > 0 && <HeartRow amount={health.blackHearts} kind="black" />}
              </div>
              <div className="flex flex-col gap-1 font-display text-[12px] tabular-nums text-oracle-ink drop-shadow-[0_2px_0_rgb(0_0_0/0.8)]">
                <span className="flex items-center gap-1.5"><span className="flex w-4 justify-center"><PixelCoin size={13} /></span>{String(run.coins ?? 0).padStart(2, '0')}</span>
                <span className="flex items-center gap-1.5"><span className="flex w-4 justify-center"><PixelBomb size={12} /></span>{String(run.bombs ?? 0).padStart(2, '0')}</span>
                <span className="flex items-center gap-1.5"><span className="flex w-4 justify-center"><PixelKey size={15} /></span>{String(run.keys ?? 0).padStart(2, '0')}</span>
              </div>
            </div>
            {activeItem && (
              <button type="button" onClick={() => onSelect(activeItem.id)} title={displayName(activeItem)} className="flex flex-col items-center gap-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-torn-sm bg-black/40 shadow-[inset_0_0_0_1px_rgb(224_112_92/0.4)]">
                  <ItemSprite item={activeItem} className="h-10 w-10" />
                </span>
                <span className="font-display text-[7px] uppercase text-oracle-blood-light">Ativo</span>
              </button>
            )}
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <div className="relative h-[220px] w-[220px]">
              <div className="absolute inset-3 rounded-full border border-dashed border-oracle-special/15" />
              <div className="absolute inset-0 animate-orbit">
                {orbiting.map((item, index) => {
                  const angle = (index / Math.max(orbiting.length, 1)) * Math.PI * 2 - Math.PI / 2
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={displayName(item)}
                      onClick={() => onSelect(item.id)}
                      className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                      style={{ left: `${50 + Math.cos(angle) * 46}%`, top: `${50 + Math.sin(angle) * 46}%` }}
                    >
                      <span className="flex h-full w-full animate-orbit-reverse items-center justify-center">
                        <ItemSprite item={item} className="h-8 w-8 drop-shadow-[0_3px_0_rgb(0_0_0/0.5)] transition-transform hover:scale-125" />
                      </span>
                    </button>
                  )
                })}
              </div>

              <button type="button" onClick={onChangeCharacter} title="Trocar personagem" className="group absolute inset-0 m-auto flex h-[132px] w-[120px] flex-col items-center justify-end">
                {heldItem && (
                  <span key={heldItem.key} className="pointer-events-none absolute -top-10 left-1/2 z-10 -ml-7 flex h-14 w-14 animate-hold-up items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(255_230_150/0.7),transparent_65%)] animate-shine" />
                    <ItemSprite item={heldItem.item} className="relative h-12 w-12" />
                  </span>
                )}
                <span className="absolute bottom-0 h-4 w-20 rounded-[50%] bg-black/55 blur-[3px]" />
                <span className={cn('relative', heldItem ? '' : 'animate-float')}>
                  <CharacterPortrait character={character} className="h-[112px] w-[112px] drop-shadow-[0_6px_0_rgb(0_0_0/0.35)] transition-transform group-hover:scale-105" />
                </span>
              </button>
            </div>
          </div>

          <div className="relative flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="font-display text-[8px] uppercase tracking-wide text-oracle-quiet">{floor ? `${floor.chapter} · ${floor.name}` : 'Escolha o andar'}</div>
              <div className="mt-1 truncate font-display text-[17px] uppercase leading-tight text-oracle-ink drop-shadow-[0_2px_0_rgb(0_0_0/0.8)]">{character?.localizedName.replace(' (Blue Baby)', '') ?? 'Quem é você?'}</div>
              <div className="truncate text-[11px] text-oracle-muted">{floor?.localizedName ?? (character ? character.name : 'Clique no personagem para escolher')}</div>
            </div>
            <button type="button" onClick={onChangeCharacter} className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 font-display text-[8px] uppercase tracking-wide text-oracle-muted transition-colors hover:bg-black/55 hover:text-oracle-ink">
              <Repeat2 size={12} /> Trocar
            </button>
          </div>
        </div>

        {/* Equipment: every item picked up, filling the slots */}
        <div className="paper-card relative flex min-w-0 flex-col p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[11px] uppercase tracking-wide">Equipamento</h2>
            <span className="font-display text-[8px] uppercase tracking-wide text-oracle-paper-muted">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <HeldSlot label="Item ativo" emptyLabel="Nenhum equipado" emptyHint="Ativos entram aqui sozinhos" item={activeItem} isNewest={activeItem?.id === newest?.id} selected={activeItem?.id === selectedId} onSelect={onSelect} />
            <HeldSlot label="Trinket" emptyLabel="Nenhum" emptyHint="Bugigangas do chão" item={trinket} isNewest={trinket?.id === newest?.id} selected={trinket?.id === selectedId} onSelect={onSelect} />
            <HeldSlot label="Bolso" emptyLabel="Vazio" emptyHint="Cartas e runas" item={pocket} isNewest={pocket?.id === newest?.id} selected={pocket?.id === selectedId} onSelect={onSelect} />
          </div>

          <div className="mt-4 font-display text-[8px] uppercase tracking-wide text-oracle-paper-muted">Passivos e familiares · {passives.filter((item) => item.type === 'passive' || item.type === 'familiar').length}</div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {Array.from({ length: slotCount }, (_, index) => {
              const item = passives[index]
              if (!item) return <span key={`empty-${index}`} className="aspect-square rounded-torn-sm border border-dashed border-oracle-paper-ink/15" />
              const isNewest = item.id === newest?.id
              const swapped = item.type === 'active' || item.type === 'trinket'
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-label={swapped ? `${displayName(item)} (trocado)` : displayName(item)}
                  className={cn(
                    'group relative flex aspect-square items-center justify-center rounded-torn-sm bg-oracle-paper-shadow shadow-[inset_0_2px_0_rgb(0_0_0/0.1),0_2px_0_rgb(0_0_0/0.15)] transition-transform hover:-translate-y-0.5 hover:bg-[#dcc9a3]',
                    isNewest && 'animate-equip shadow-[0_0_0_2px_var(--oracle-special),0_2px_0_rgb(0_0_0/0.15)]',
                    item.id === selectedId && 'shadow-[0_0_0_2px_var(--oracle-blood),0_2px_0_rgb(0_0_0/0.15)]',
                  )}
                >
                  <ItemSprite item={item} className={cn('h-[78%] w-[78%] transition-transform group-hover:scale-110', swapped && 'opacity-40 grayscale')} />
                  {swapped && <span className="absolute bottom-0.5 right-1 font-display text-[7px] text-oracle-blood">{item.type === 'trinket' ? 'T' : 'A'}</span>}
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-oracle-paper-ink px-2 py-1 text-[11px] font-semibold text-oracle-paper shadow-lg group-hover:block">
                    {displayName(item)}{swapped && (item.type === 'trinket' ? ' · trinket trocado' : ' · ativo trocado')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-oracle-line bg-oracle-sidebar/80 p-3 sm:grid-cols-3 2xl:grid-cols-6">
        <Counter label="Vermelhos" icon={<PixelHeart kind="red" size={15} />} value={health.redHearts} step={0.5} max={12} format={formatHearts} accent="text-oracle-blood-light" onChange={setHealth('redHearts')} />
        <Counter label="Almas" icon={<PixelHeart kind="soul" size={15} />} value={health.soulHearts} step={0.5} max={12} format={formatHearts} accent="text-oracle-soul" onChange={setHealth('soulHearts')} />
        <Counter label="Negros" icon={<PixelHeart kind="black" size={15} />} value={health.blackHearts} step={0.5} max={12} format={formatHearts} accent="text-oracle-muted" onChange={setHealth('blackHearts')} />
        <Counter label="Moedas" icon={<PixelCoin size={14} />} value={run.coins} accent="text-oracle-special" onChange={setPickup('coins', 'coin')} />
        <Counter label="Bombas" icon={<PixelBomb size={13} />} value={run.bombs} onChange={setPickup('bombs', 'tick')} />
        <Counter label="Chaves" icon={<PixelKey size={16} />} value={run.keys} onChange={setPickup('keys', 'key')} />
      </div>
    </section>
  )
}

interface HeldSlotProps {
  label: string
  emptyLabel: string
  emptyHint: string
  item: IsaacItem | undefined
  isNewest: boolean
  selected: boolean
  onSelect: (itemId: number) => void
}

function HeldSlot({ label, emptyLabel, emptyHint, item, isNewest, selected, onSelect }: HeldSlotProps) {
  return (
    <button
      type="button"
      onClick={() => item && onSelect(item.id)}
      disabled={!item}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-torn-sm p-2 text-left transition-colors',
        item ? 'bg-oracle-paper-ink/[0.07] hover:bg-oracle-paper-ink/[0.12]' : 'border border-dashed border-oracle-paper-ink/25',
        selected && 'shadow-[0_0_0_2px_var(--oracle-blood)]',
      )}
    >
      <span key={item?.id} className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-torn-sm bg-oracle-paper-shadow shadow-[inset_0_2px_0_rgb(0_0_0/0.1)]', isNewest && 'animate-equip')}>
        {item ? <ItemSprite item={item} className="h-11 w-11" /> : <span className="font-display text-[14px] text-oracle-paper-muted/60">?</span>}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[8px] uppercase tracking-wide text-oracle-blood">{label}</span>
        <span className="block truncate text-[14px] font-black uppercase leading-tight">{item ? displayName(item) : emptyLabel}</span>
        <span className="block truncate text-[11px] text-oracle-paper-muted">{item ? item.localizedShortDescription : emptyHint}</span>
      </span>
    </button>
  )
}

/** Shows the newest item held over the character's head for a moment, like the in-game pickup pose. */
function useHeldItem(items: IsaacItem[]): { item: IsaacItem; key: number } | null {
  const [held, setHeld] = useState<{ item: IsaacItem; key: number } | null>(null)
  const previousIds = useRef<Set<number> | null>(null)

  useEffect(() => {
    const ids = new Set(items.map((item) => item.id))
    const previous = previousIds.current
    previousIds.current = ids
    if (!previous) return
    const added = [...items].reverse().find((item) => !previous.has(item.id))
    if (added) setHeld({ item: added, key: Date.now() })
  }, [items])

  useEffect(() => {
    if (!held) return
    const timer = window.setTimeout(() => setHeld(null), 1900)
    return () => window.clearTimeout(timer)
  }, [held])

  return held
}

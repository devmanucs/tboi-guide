import { Flag, MapPin, Pin, PinOff, StepForward } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FLOORS, findFloor } from '../../../../../packages/isaac-data/src/run-presets'
import type { IsaacItem } from '../../../../../packages/isaac-data/src/types'
import { Button } from '../../ui/button'
import { Dialog } from '../../ui/dialog'
import { Kbd } from '../../ui/kbd'
import { Select, type SelectOption } from '../../ui/select'
import { play } from '../../ui/sound'
import { useMediaQuery } from '../../ui/use-media-query'
import { ItemDetail } from '../app-shell/item-detail'
import { useOracleStore } from '../app-shell/use-oracle-store'
import { CharacterPicker } from './character-picker'
import { CharacterSheet } from './character-sheet'
import { QuickAdd } from './quick-add'

const floorOptions: SelectOption<string>[] = FLOORS.map((floor) => ({
  value: floor.id,
  label: floor.localizedName,
  hint: floor.localizedName !== floor.name ? floor.name : undefined,
  group: floor.chapter,
}))

export function LiveScreen() {
  const run = useOracleStore((state) => state.run)
  return run ? <ActiveRun key={run.id} /> : <NewRun />
}

function NewRun() {
  const startRun = useOracleStore((state) => state.startRun)

  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col justify-center py-6">
      <div className="flex items-center gap-5 animate-slide-up">
        <img src="/assets/isaac-crying-grande.png" alt="" className="h-20 w-20 shrink-0 object-contain drop-shadow-[0_6px_0_rgb(0_0_0/0.35)]" />
        <div>
          <div className="font-display text-[9px] uppercase tracking-[0.18em] text-oracle-blood-light">Modo run rápido</div>
          <h1 className="mt-2 font-display text-[22px] uppercase leading-tight tracking-wide text-oracle-ink">Quem vai descer hoje?</h1>
          <p className="mt-1.5 max-w-xl text-[14px] leading-6 text-oracle-muted">
            Escolha o personagem para começar. Depois é só digitar o nome dos itens que aparecem na tela do Switch, em inglês mesmo, e ir equipando.
          </p>
        </div>
      </div>

      <div className="mt-7">
        <CharacterPicker onPick={(characterId) => void startRun(characterId)} />
      </div>

      <div className="mt-7 flex items-center gap-3 text-[12px] text-oracle-quiet">
        <span className="h-px flex-1 bg-oracle-line" />
        ou já registre o primeiro item
        <span className="h-px flex-1 bg-oracle-line" />
      </div>
      <div className="mt-4">
        <QuickAdd />
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-oracle-quiet">Pesquise qualquer item de qualquer tela com <Kbd>Ctrl</Kbd><Kbd>K</Kbd></p>
    </div>
  )
}

function ActiveRun() {
  const { run, itemsById, updateRun, endRun, pinned, togglePinned, chooseCharacter } = useOracleStore()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [pickingCharacter, setPickingCharacter] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const isWide = useMediaQuery('(min-width: 1280px)')

  const runItems = useMemo(
    () => (run?.collectibles ?? []).map((id) => itemsById.get(id)).filter((item): item is IsaacItem => Boolean(item)),
    [itemsById, run?.collectibles],
  )
  const newest = runItems[runItems.length - 1]
  const selectedItem = runItems.find((item) => item.id === selectedId) ?? newest ?? null

  if (!run) return null
  const floor = findFloor(run.floor)
  const nextFloor = findFloor(floor?.next)

  function selectItem(itemId: number) {
    play('tick')
    setSelectedId(itemId)
    if (!isWide) setDetailOpen(true)
  }

  return (
    <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <header className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <div className="flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.18em] text-oracle-blood-light">
              <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-oracle-blood-light/60" /><span className="relative h-2 w-2 rounded-full bg-oracle-blood-light" /></span>
              Ao vivo · salvo neste PC
            </div>
            <h1 className="mt-1.5 font-display text-[20px] uppercase leading-tight tracking-wide text-oracle-ink">Run em curso</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Select
              className="w-[220px]"
              icon={<MapPin size={14} />}
              value={run.floor}
              options={floorOptions}
              placeholder={run.floor && !floor ? run.floor : 'Andar atual'}
              onChange={(floorId) => void updateRun({ floor: floorId })}
              searchable
              align="end"
              menuClassName="w-[280px]"
            />
            <Button
              variant="primary"
              disabled={!nextFloor}
              title={nextFloor ? `Descer para ${nextFloor.localizedName}` : 'Escolha o próximo andar no menu'}
              icon={<StepForward size={14} />}
              onClick={() => {
                if (!nextFloor) return
                play('floor')
                void updateRun({ floor: nextFloor.id })
              }}
            >
              Descer
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => void togglePinned()} title={pinned ? 'Soltar janela' : 'Fixar janela por cima das outras'} aria-label="Fixar janela">
              {pinned ? <PinOff size={15} /> : <Pin size={15} />}
            </Button>
            <Button variant="danger" size="icon" className="h-10 w-10" onClick={() => setConfirmEnd(true)} title="Encerrar run" aria-label="Encerrar run">
              <Flag size={15} />
            </Button>
          </div>
        </header>

        <QuickAdd autoFocus />

        <CharacterSheet
          run={run}
          items={runItems}
          selectedId={selectedItem?.id}
          onSelect={selectItem}
          onChangeCharacter={() => setPickingCharacter(true)}
        />
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-0">
          <div className="mb-3 font-display text-[8px] uppercase tracking-wide text-oracle-quiet">{selectedItem && selectedItem.id === newest?.id ? 'Último item pego' : 'Item selecionado'}</div>
          <ItemDetail item={selectedItem} emptyHint="Os itens que você pegar aparecem aqui" />
        </div>
      </div>

      <Dialog open={detailOpen && !isWide} onClose={() => setDetailOpen(false)} label="Detalhes do item" className="max-w-[360px] p-4">
        <ItemDetail item={selectedItem} />
      </Dialog>

      <Dialog open={pickingCharacter} onClose={() => setPickingCharacter(false)} label="Escolher personagem" className="max-w-[640px]">
        <div className="p-5">
          <div className="font-display text-[9px] uppercase tracking-wide text-oracle-blood-light">Personagem</div>
          <h2 className="mt-1.5 mb-4 text-[18px] font-bold text-oracle-ink">Com quem você está jogando?</h2>
          <CharacterPicker
            compact
            value={run.character}
            onPick={(characterId) => {
              setPickingCharacter(false)
              void chooseCharacter(characterId)
            }}
          />
        </div>
      </Dialog>

      <Dialog open={confirmEnd} onClose={() => setConfirmEnd(false)} label="Encerrar run" className="max-w-[400px]">
        <div className="p-6">
          <div className="font-display text-[9px] uppercase tracking-wide text-oracle-blood-light">Encerrar run</div>
          <h2 className="mt-2 text-[18px] font-bold text-oracle-ink">A run acabou?</h2>
          <p className="mt-2 text-[13px] leading-6 text-oracle-muted">
            Os {runItems.length} itens e os recursos registrados ficam guardados no histórico deste computador, e a tela Live volta a ficar livre para uma nova run.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmEnd(false)} autoFocus>Continuar jogando</Button>
            <Button variant="primary" onClick={() => { setConfirmEnd(false); void endRun() }}>Encerrar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

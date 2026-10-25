import { BookOpen, Heart, Search, Volume2, VolumeX } from 'lucide-react'
import { useEffect } from 'react'
import { findCharacter, findFloor } from '../../../../../packages/isaac-data/src/run-presets'
import { Button } from '../../ui/button'
import { cn } from '../../ui/cn'
import { Kbd } from '../../ui/kbd'
import { play, useSoundSettings } from '../../ui/sound'
import { ToastViewport } from '../../ui/toast'
import { CatalogScreen } from '../catalog/catalog-screen'
import { CommandPalette } from '../command-palette/command-palette'
import { CharacterPortrait } from '../live/character-portrait'
import { LiveScreen } from '../live/live-screen'
import { useOracleStore, type Screen } from './use-oracle-store'

const navigation = [
  { id: 'live', label: 'Run ao vivo', detail: 'Modo rápido', icon: Heart, shortcut: '1' },
  { id: 'catalog', label: 'Catálogo', detail: 'Todos os itens', icon: BookOpen, shortcut: '2' },
] as const satisfies ReadonlyArray<{ id: Screen; label: string; detail: string; shortcut: string; icon: unknown }>

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}

export function AppShell() {
  const { screen, setScreen, load, isLoading, loadError, run, paletteOpen, setPaletteOpen } = useOracleStore()
  const { muted, toggleMuted } = useSoundSettings()

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(!useOracleStore.getState().paletteOpen)
      } else if (event.key === '/' && !modifier && !isTypingTarget(event.target) && !useOracleStore.getState().paletteOpen) {
        event.preventDefault()
        setPaletteOpen(true)
      } else if (modifier && event.key.toLowerCase() === 'm') {
        event.preventDefault()
        useSoundSettings.getState().toggleMuted()
      } else if (modifier && (event.key === '1' || event.key === '2')) {
        event.preventDefault()
        setScreen(event.key === '1' ? 'live' : 'catalog')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setPaletteOpen, setScreen])

  const character = findCharacter(run?.character)
  const floor = findFloor(run?.floor)

  return (
    <div className="flex h-screen overflow-hidden bg-oracle-bg text-oracle-ink">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-oracle-line bg-oracle-sidebar">
        <div className="flex items-center gap-3 px-5 pb-4 pt-6">
          <img src="/assets/isaac-crying.png" alt="" className="h-9 w-9 object-contain pixelated drop-shadow-[0_3px_0_rgb(0_0_0/0.4)]" />
          <div className="font-display text-[11px] leading-[1.5] text-oracle-ink">
            <div>The guide of</div>
            <div className="text-oracle-blood-light">Isaac</div>
          </div>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex h-10 w-full items-center gap-2.5 rounded-torn-sm bg-oracle-surface px-3 text-left text-[12px] text-oracle-quiet shadow-[inset_0_0_0_1px_var(--oracle-line)] transition-colors hover:bg-oracle-surface-raised hover:text-oracle-muted"
          >
            <Search size={14} className="text-oracle-blood-light" />
            <span className="flex-1">Pesquisa rápida</span>
            <span className="flex gap-0.5"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></span>
          </button>
        </div>

        <nav className="space-y-1 px-3 py-3" aria-label="Navegação principal">
          {navigation.map(({ id, label, detail, icon: Icon, shortcut }) => {
            const active = screen === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (!active) play('tick')
                  setScreen(id)
                }}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-torn-sm px-3 py-2.5 text-left transition-[background-color,color,transform]',
                  active ? 'paper-card shadow-[0_3px_0_var(--oracle-shadow)]' : 'text-oracle-muted hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-oracle-ink',
                )}
              >
                <Icon size={16} strokeWidth={2} className={active ? 'text-oracle-blood' : 'text-oracle-quiet group-hover:text-oracle-muted'} />
                <span className="flex-1">
                  <span className="block font-display text-[9px] uppercase tracking-wide">{label}</span>
                  <span className={cn('mt-0.5 block text-[11px]', active ? 'text-oracle-paper-muted' : 'text-oracle-quiet')}>{detail}</span>
                </span>
                <span className={cn('font-mono text-[10px]', active ? 'text-oracle-paper-muted' : 'text-oracle-quiet opacity-0 group-hover:opacity-100')}>^{shortcut}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto space-y-2 p-3">
          {run ? (
            <button type="button" onClick={() => setScreen('live')} className="flex w-full items-center gap-3 rounded-torn-sm bg-oracle-surface p-2.5 text-left shadow-[inset_0_0_0_1px_var(--oracle-line)] transition-colors hover:bg-oracle-surface-raised">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-torn-sm bg-black/30">
                <CharacterPortrait character={character} className="h-9 w-9" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-display text-[7px] uppercase tracking-wide text-oracle-blood-light">
                  <span className="h-1.5 w-1.5 rounded-full bg-oracle-blood-light" /> Run em curso
                </span>
                <span className="mt-1 block truncate text-[13px] font-bold">{character?.localizedName ?? 'Personagem?'}</span>
                <span className="block truncate text-[11px] text-oracle-quiet">{floor?.localizedName ?? run.floor ?? 'Andar?'} · {run.collectibles.length} itens</span>
              </span>
            </button>
          ) : (
            <div className="px-2 py-1 text-[11px] text-oracle-quiet">
              <div className="flex items-center gap-1.5 font-display text-[7px] uppercase tracking-wide text-oracle-positive">
                <span className="h-1.5 w-1.5 rounded-full bg-oracle-positive" /> Offline
              </div>
              <div className="mt-1.5">Pronto para uma nova run</div>
            </div>
          )}
          <button
            type="button"
            onClick={toggleMuted}
            aria-pressed={!muted}
            className="flex w-full items-center gap-2 rounded-torn-sm px-2.5 py-2 text-[12px] text-oracle-quiet transition-colors hover:bg-white/[0.04] hover:text-oracle-muted"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-oracle-special" />}
            <span className="flex-1 text-left">{muted ? 'Sons desligados' : 'Sons ligados'}</span>
            <span className="font-mono text-[10px]">^M</span>
          </button>
        </div>
      </aside>

      <main className="oracle-floor flex min-w-0 flex-1 flex-col overflow-hidden">
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-7 xl:px-8">
          {loadError ? (
            <div role="alert" className="m-auto max-w-md rounded-torn bg-[#3a1f1b] p-6 text-center shadow-[0_4px_0_var(--oracle-shadow)]">
              <div className="font-display text-xl text-oracle-danger">!</div>
              <p className="mt-2 text-[14px] text-[#ffc5b3]">{loadError}</p>
              <Button variant="secondary" className="mt-4" onClick={() => void load()}>Tentar de novo</Button>
            </div>
          ) : isLoading ? (
            <div className="m-auto font-display text-[9px] uppercase tracking-wide text-oracle-quiet">Abrindo o porão…</div>
          ) : screen === 'live' ? <LiveScreen /> : <CatalogScreen />}
        </section>
      </main>

      {paletteOpen && <CommandPalette />}
      <ToastViewport />
    </div>
  )
}

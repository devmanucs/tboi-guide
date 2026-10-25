import { CHARACTERS } from '../../../../../packages/isaac-data/src/run-presets'
import { cn } from '../../ui/cn'
import { play } from '../../ui/sound'
import { CharacterPortrait } from './character-portrait'

interface CharacterPickerProps {
  value?: string
  onPick: (characterId: string) => void
  compact?: boolean
}

export function CharacterPicker({ value, onPick, compact }: CharacterPickerProps) {
  return (
    <div className={cn('grid gap-2.5', compact ? 'grid-cols-5' : 'grid-cols-[repeat(auto-fill,minmax(104px,1fr))]')}>
      {CHARACTERS.map((character, index) => {
        const selected = character.id === value
        return (
          <button
            key={character.id}
            type="button"
            onPointerEnter={() => play('tick')}
            onClick={() => {
              play('select')
              onPick(character.id)
            }}
            style={{ animationDelay: `${index * 18}ms` }}
            className={cn(
              'group relative flex flex-col items-center overflow-hidden rounded-torn bg-oracle-surface px-2 pb-2.5 pt-3 shadow-[inset_0_0_0_1px_var(--oracle-line),0_3px_0_var(--oracle-shadow)] transition-[transform,background-color,box-shadow] animate-slide-up [animation-fill-mode:backwards] hover:-translate-y-1 hover:bg-oracle-surface-raised',
              selected && 'paper-card shadow-[0_0_0_2px_var(--oracle-blood-light),0_3px_0_var(--oracle-shadow)] hover:bg-oracle-paper',
            )}
          >
            <span className={cn('absolute inset-x-3 bottom-9 h-2.5 rounded-[50%] blur-[2px]', selected ? 'bg-black/25' : 'bg-black/50')} />
            <CharacterPortrait character={character} className={cn('relative transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110', compact ? 'h-14 w-14' : 'h-[68px] w-[68px]')} />
            <span className={cn('mt-2 w-full truncate text-center font-display text-[8px] uppercase tracking-wide', selected ? 'text-oracle-paper-ink' : 'text-oracle-ink')}>{character.localizedName.replace(' (Blue Baby)', '')}</span>
            <span className={cn('w-full truncate text-center text-[10px]', selected ? 'text-oracle-paper-muted' : 'text-oracle-quiet')}>{character.id === 'blue-baby' ? 'Blue Baby' : character.name}</span>
          </button>
        )
      })}
    </div>
  )
}

import { cn } from './cn'

interface SegmentedControlProps<T extends string> {
  value: T
  options: Array<{ value: T; label: string; count?: number }>
  onChange: (value: T) => void
  label: string
}

export function SegmentedControl<T extends string>({ value, options, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex h-10 items-center gap-0.5 rounded-torn-sm bg-oracle-surface p-1 shadow-[inset_0_0_0_1px_var(--oracle-line)]">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-full items-center gap-1.5 rounded-[3px_9px_4px_7px] px-3 font-display text-[9px] uppercase tracking-wide transition-[background-color,color]',
              active ? 'bg-oracle-paper text-oracle-paper-ink shadow-[0_2px_0_var(--oracle-shadow)]' : 'text-oracle-muted hover:text-oracle-ink',
            )}
          >
            {option.label}
            {option.count !== undefined && <span className={cn('text-[8px]', active ? 'text-oracle-blood' : 'text-oracle-quiet')}>{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

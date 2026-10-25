import { Minus, Plus } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from './cn'

interface CounterProps {
  label: string
  value: number | undefined
  onChange: (value: number, direction: 1 | -1) => void
  icon: ReactNode
  step?: number
  max?: number
  accent?: string
  format?: (value: number) => string
}

/** Compact HUD counter: icon, editable value and -/+ buttons. Arrow keys and typing also work. */
export function Counter({ label, value, onChange, icon, step = 1, max = 99, accent = 'text-oracle-ink', format = (current) => String(current).padStart(2, '0') }: CounterProps) {
  const current = value ?? 0
  const [draft, setDraft] = useState<string | null>(null)

  useEffect(() => setDraft(null), [value])

  function commit(next: number) {
    const clamped = Math.min(max, Math.max(0, Math.round(next / step) * step))
    if (clamped === current) return
    onChange(clamped, clamped > current ? 1 : -1)
  }

  return (
    <div className="flex h-12 min-w-0 items-center gap-1 rounded-torn-sm bg-black/25 pl-2.5 pr-1 shadow-[inset_0_0_0_1px_var(--oracle-line)] focus-within:shadow-[inset_0_0_0_1px_var(--oracle-blood-light)]">
      <span className="flex w-5 shrink-0 justify-center">{icon}</span>
      <label className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-[7px] uppercase tracking-wide text-oracle-quiet">{label}</span>
        <input
          inputMode="decimal"
          value={draft ?? format(current)}
          onFocus={(event) => {
            setDraft(String(current))
            requestAnimationFrame(() => event.target.select())
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            const parsed = Number(draft?.replace(',', '.').replace('½', '.5'))
            setDraft(null)
            if (draft !== null && Number.isFinite(parsed)) commit(parsed)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
              if (event.key === 'Escape') setDraft(null)
              event.currentTarget.blur()
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault()
              commit(current + (event.key === 'ArrowUp' ? step : -step))
            }
          }}
          className={cn('w-full min-w-0 bg-transparent font-display text-[15px] leading-tight tabular-nums outline-none', accent)}
        />
      </label>
      <div className="flex shrink-0 gap-0.5">
        <button type="button" tabIndex={-1} aria-label={`Diminuir ${label}`} disabled={current <= 0} onClick={() => commit(current - step)} className="flex h-8 w-7 items-center justify-center rounded-[4px] text-oracle-quiet transition-colors hover:bg-white/[0.07] hover:text-oracle-ink active:scale-90 disabled:opacity-25">
          <Minus size={13} strokeWidth={2.75} />
        </button>
        <button type="button" tabIndex={-1} aria-label={`Aumentar ${label}`} disabled={current >= max} onClick={() => commit(current + step)} className="flex h-8 w-7 items-center justify-center rounded-[4px] bg-white/[0.04] text-oracle-muted transition-colors hover:bg-white/[0.1] hover:text-oracle-ink active:scale-90 disabled:opacity-25">
          <Plus size={13} strokeWidth={2.75} />
        </button>
      </div>
    </div>
  )
}

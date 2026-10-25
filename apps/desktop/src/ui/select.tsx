import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { normalizeSearchText } from '../../../../packages/isaac-data/src/search'
import { cn } from './cn'
import { Popover } from './popover'
import { play } from './sound'

export interface SelectOption<T extends string> {
  value: T
  label: string
  hint?: string
  group?: string
}

interface SelectProps<T extends string> {
  value: T | undefined
  options: SelectOption<T>[]
  onChange: (value: T) => void
  placeholder?: string
  label?: string
  icon?: ReactNode
  searchable?: boolean
  className?: string
  menuClassName?: string
  align?: 'start' | 'end'
}

export function Select<T extends string>({ value, options, onChange, placeholder = 'Selecionar', label, icon, searchable, className, menuClassName, align = 'start' }: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [highlighted, setHighlighted] = useState(0)
    const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const selected = options.find((option) => option.value === value)

  const visibleOptions = useMemo(() => {
    const query = normalizeSearchText(filter)
    if (!query) return options
    return options.filter((option) => normalizeSearchText(`${option.label} ${option.hint ?? ''} ${option.group ?? ''}`).includes(query))
  }, [filter, options])

  useEffect(() => {
    if (!open) return
    setFilter('')
    setHighlighted(Math.max(0, options.findIndex((option) => option.value === value)))
    requestAnimationFrame(() => (searchable ? searchRef.current : listRef.current)?.focus())
    // Only reset when the menu opens; options may be recreated on every render.
  }, [open])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${highlighted}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  function commit(option: SelectOption<T> | undefined) {
    if (!option) return
    if (option.value !== value) play('select')
    onChange(option.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') setHighlighted((index) => Math.min(visibleOptions.length - 1, index + 1))
    else if (event.key === 'ArrowUp') setHighlighted((index) => Math.max(0, index - 1))
    else if (event.key === 'Home') setHighlighted(0)
    else if (event.key === 'End') setHighlighted(visibleOptions.length - 1)
    else if (event.key === 'Enter') commit(visibleOptions[highlighted])
    else if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false)
      if (event.key === 'Escape') triggerRef.current?.focus()
      return
    } else return
    event.preventDefault()
    event.stopPropagation()
  }

  let lastGroup: string | undefined

  return (
    <div className={cn('relative', className)}>
      {label && <div className="mb-1.5 font-display text-[8px] uppercase tracking-wide text-oracle-quiet">{label}</div>}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-torn-sm bg-oracle-surface-raised px-3 text-left shadow-[inset_0_0_0_1px_var(--oracle-line)] transition-[background-color,box-shadow] hover:bg-oracle-surface-hover',
          open && 'shadow-[inset_0_0_0_1px_var(--oracle-blood-light),0_0_0_3px_rgb(224_112_92/0.15)]',
        )}
      >
        {icon && <span className="flex shrink-0 text-oracle-blood-light">{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-[13px] font-semibold', selected ? 'text-oracle-ink' : 'text-oracle-quiet')}>{selected?.label ?? placeholder}</span>
        </span>
        {selected?.hint && <span className="hidden truncate text-[11px] text-oracle-quiet lg:block">{selected.hint}</span>}
        <ChevronDown size={14} className={cn('shrink-0 text-oracle-quiet transition-transform', open && 'rotate-180')} />
      </button>

      <Popover anchorRef={triggerRef} open={open} onDismiss={() => setOpen(false)} align={align} className={menuClassName}>
        <div className="flex min-h-0 flex-1 flex-col" onKeyDown={handleKeyDown}>
          {searchable && (
            <div className="flex items-center gap-2 border-b border-oracle-line px-3 py-2">
              <Search size={13} className="text-oracle-quiet" />
              <input
                ref={searchRef}
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value)
                  setHighlighted(0)
                }}
                placeholder="Filtrar…"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-oracle-quiet"
              />
            </div>
          )}
          <div ref={listRef} id={listId} role="listbox" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto p-1 outline-none">
            {visibleOptions.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-oracle-quiet">Nada encontrado</div>}
            {visibleOptions.map((option, index) => {
              const showGroup = option.group && option.group !== lastGroup
              lastGroup = option.group
              const isSelected = option.value === value
              return (
                <div key={option.value}>
                  {showGroup && <div className="px-2.5 pb-1 pt-2.5 font-display text-[8px] uppercase tracking-wide text-oracle-quiet">{option.group}</div>}
                  <div
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onPointerMove={() => setHighlighted(index)}
                    onClick={() => commit(option)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-[4px] px-2.5 py-2 text-[13px]',
                      index === highlighted ? 'bg-white/[0.07] text-oracle-ink' : 'text-oracle-muted',
                    )}
                  >
                    <span className="flex-1 truncate font-semibold">{option.label}</span>
                    {option.hint && <span className="truncate text-[11px] text-oracle-quiet">{option.hint}</span>}
                    <Check size={13} className={cn('shrink-0 text-oracle-blood-light', !isSelected && 'invisible')} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Popover>
    </div>
  )
}

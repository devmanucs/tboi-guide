import { X } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from './cn'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value: string
  onValueChange: (value: string) => void
  icon?: ReactNode
  trailing?: ReactNode
  size?: 'md' | 'lg'
  ref?: Ref<HTMLInputElement>
  containerClassName?: string
}

export function TextField({ value, onValueChange, icon, trailing, size = 'md', ref, containerClassName, className, ...props }: TextFieldProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 rounded-torn-sm bg-oracle-surface px-3.5 text-oracle-ink shadow-[inset_0_0_0_1px_var(--oracle-line),inset_0_2px_0_rgb(0_0_0/0.25)] transition-[background-color,box-shadow] focus-within:bg-oracle-surface-raised focus-within:shadow-[inset_0_0_0_1px_var(--oracle-blood-light),0_0_0_3px_rgb(224_112_92/0.15)]',
        size === 'lg' ? 'h-12' : 'h-10',
        containerClassName,
      )}
    >
      {icon && <span className="flex shrink-0 text-oracle-quiet transition-colors group-focus-within:text-oracle-blood-light">{icon}</span>}
      <input
        ref={ref}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        className={cn('min-w-0 flex-1 bg-transparent outline-none placeholder:text-oracle-quiet', size === 'lg' ? 'text-[15px]' : 'text-[13px]', className)}
        {...props}
      />
      {value && (
        <button type="button" onClick={() => onValueChange('')} aria-label="Limpar" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-oracle-quiet transition-colors hover:bg-white/[0.06] hover:text-oracle-ink">
          <X size={14} />
        </button>
      )}
      {trailing}
    </div>
  )
}

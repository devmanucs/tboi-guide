import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-oracle-blood text-[#fff0dc] shadow-[0_3px_0_var(--oracle-shadow),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-[#bb4136] active:translate-y-[2px] active:shadow-[0_1px_0_var(--oracle-shadow)]',
  secondary: 'bg-oracle-surface-raised text-oracle-ink shadow-[0_2px_0_var(--oracle-shadow),inset_0_0_0_1px_var(--oracle-line)] hover:bg-oracle-surface-hover active:translate-y-[1px] active:shadow-none',
  ghost: 'text-oracle-muted hover:bg-white/[0.05] hover:text-oracle-ink',
  danger: 'text-oracle-muted hover:bg-oracle-blood/15 hover:text-oracle-danger',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[9px]',
  md: 'h-10 gap-2 px-4 text-[10px]',
  lg: 'h-12 gap-2.5 px-6 text-[11px]',
  icon: 'h-8 w-8 justify-center',
}

export function Button({ variant = 'secondary', size = 'md', icon, className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center rounded-torn-sm font-display uppercase tracking-wide transition-[background-color,color,transform,box-shadow] duration-100 disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

import type { ReactNode } from 'react'
import { cn } from './cn'

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] bg-white/[0.06] px-1.5 font-mono text-[10px] font-semibold text-oracle-muted shadow-[inset_0_-1px_0_rgb(0_0_0/0.5),inset_0_0_0_1px_var(--oracle-line)]', className)}>
      {children}
    </kbd>
  )
}

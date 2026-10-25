import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
  position?: 'center' | 'top'
}

export function Dialog({ open, onClose, label, children, className, position = 'center' }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]')]
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={cn('fixed inset-0 z-50 flex justify-center bg-[#0a0807]/70 px-4 backdrop-blur-[3px] animate-fade-in', position === 'top' ? 'items-start pt-[12vh]' : 'items-center')}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn('w-full overflow-hidden rounded-torn bg-[#1d1916] shadow-[0_0_0_1px_var(--oracle-line-strong),0_6px_0_var(--oracle-shadow),0_30px_80px_rgb(0_0_0/0.7)] animate-pop-in', className)}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

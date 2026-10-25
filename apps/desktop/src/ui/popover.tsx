import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'

interface PopoverProps {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onDismiss: () => void
  children: ReactNode
  className?: string
  align?: 'start' | 'end'
  maxHeight?: number
}

const GAP = 6
const VIEWPORT_MARGIN = 12

/** Floating panel rendered in a portal so it never gets clipped or covered by sibling stacking contexts. */
export function Popover({ anchorRef, open, onDismiss, children, className, align = 'start', maxHeight = 340 }: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' })
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useLayoutEffect(() => {
    if (!open) return
    let frame = 0
    const place = () => {
      const anchor = anchorRef.current?.getBoundingClientRect()
      if (!anchor) return
      const below = window.innerHeight - anchor.bottom - GAP - VIEWPORT_MARGIN
      const above = anchor.top - GAP - VIEWPORT_MARGIN
      const placeAbove = below < Math.min(maxHeight, 220) && above > below
      setStyle({
        position: 'fixed',
        minWidth: anchor.width,
        maxHeight: Math.min(maxHeight, placeAbove ? above : below),
        ...placeAbove ? { bottom: window.innerHeight - anchor.top + GAP } : { top: anchor.bottom + GAP },
        ...align === 'end' ? { right: window.innerWidth - anchor.right } : { left: anchor.left },
      })
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }
    place()
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
    }
  }, [align, anchorRef, maxHeight, open])

  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      onDismissRef.current()
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [anchorRef, open])

  if (!open) return null

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={cn('z-[70] flex flex-col overflow-hidden rounded-torn-sm bg-[#25201c] shadow-[0_0_0_1px_var(--oracle-line-strong),0_16px_40px_rgb(0_0_0/0.6)] animate-pop-in', className)}
    >
      {children}
    </div>,
    document.body,
  )
}

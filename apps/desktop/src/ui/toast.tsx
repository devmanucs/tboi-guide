import { useEffect } from 'react'
import { create } from 'zustand'
import { play } from './sound'

interface Toast {
  id: number
  message: string
  tone: 'info' | 'error'
  action?: { label: string; run: () => void }
}

interface ToastStore {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id' | 'tone'> & { tone?: Toast['tone'] }) => void
  dismiss: (id: number) => void
}

let nextToastId = 0

export const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  show: (toast) => set((state) => ({ toasts: [...state.toasts.slice(-2), { tone: 'info', ...toast, id: ++nextToastId }] })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

export function toast(message: string, action?: Toast['action']) {
  useToasts.getState().show({ message, action })
}

export function toastError(message: string) {
  play('error')
  useToasts.getState().show({ message, tone: 'error' })
}

function ToastItem({ toast: item }: { toast: Toast }) {
  const dismiss = useToasts((state) => state.dismiss)

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), item.action ? 6000 : 3500)
    return () => window.clearTimeout(timer)
  }, [dismiss, item])

  return (
    <div role="status" className="pointer-events-auto flex min-w-[280px] max-w-[420px] items-center gap-3 rounded-torn-sm bg-[#2a2420] px-4 py-3 text-[13px] text-oracle-ink shadow-[0_0_0_1px_var(--oracle-line-strong),0_4px_0_var(--oracle-shadow),0_14px_30px_rgb(0_0_0/0.5)] animate-slide-up">
      <span className={item.tone === 'error' ? 'font-display text-[11px] text-oracle-danger' : 'font-display text-[11px] text-oracle-special'}>{item.tone === 'error' ? '!' : '✦'}</span>
      <span className="flex-1">{item.message}</span>
      {item.action && (
        <button
          type="button"
          onClick={() => {
            item.action?.run()
            dismiss(item.id)
          }}
          className="rounded-[4px] px-2 py-1 font-display text-[9px] uppercase tracking-wide text-oracle-blood-light transition-colors hover:bg-white/[0.06]"
        >
          {item.action.label}
        </button>
      )}
    </div>
  )
}

export function ToastViewport() {
  const toasts = useToasts((state) => state.toasts)
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((item) => <ToastItem key={item.id} toast={item} />)}
    </div>
  )
}

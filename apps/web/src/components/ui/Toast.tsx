import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '../../utils/cn'
import {
  ToastContext,
  type ToastOptions,
  type ToastVariant,
} from './toast-context'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
}

const AUTO_DISMISS_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (variant: ToastVariant, options: ToastOptions) => {
      const id = `toast-${nextId.current}`
      nextId.current += 1
      setToasts((current) => [...current, { id, variant, ...options }])

      const duration = options.duration ?? AUTO_DISMISS_MS
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration)
      }
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      toast,
      success: (options: ToastOptions) => toast('success', options),
      error: (options: ToastOptions) => toast('error', options),
      info: (options: ToastOptions) => toast('info', options),
      warning: (options: ToastOptions) => toast('warning', options),
      dismiss,
    }),
    [toast, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

const variantStyles: Record<ToastVariant, { icon: typeof Info; iconClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-500' },
  error: { icon: XCircle, iconClass: 'text-red-500' },
  info: { icon: Info, iconClass: 'text-sky-500' },
  warning: { icon: AlertTriangle, iconClass: 'text-amber-500' },
}

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      aria-live="polite"
    >
      {toasts.map((toastItem) => {
        const { icon: Icon, iconClass } = variantStyles[toastItem.variant]
        const isError = toastItem.variant === 'error'
        return (
          <div
            key={toastItem.id}
            role={isError ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg',
              'border-slate-200',
            )}
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', iconClass)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toastItem.title}</p>
              {toastItem.description && (
                <p className="mt-0.5 text-sm text-slate-600">{toastItem.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toastItem.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}

import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  description?: string
  duration?: number
}

export interface ToastContextValue {
  toast: (variant: ToastVariant, options: ToastOptions) => void
  success: (options: ToastOptions) => void
  error: (options: ToastOptions) => void
  info: (options: ToastOptions) => void
  warning: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

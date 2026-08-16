import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="size-6 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-5">
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}

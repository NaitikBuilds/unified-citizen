import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <Loader2 className={cn('animate-spin text-ucg-blue', sizeClasses[size])} aria-hidden="true" />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </span>
  )
}

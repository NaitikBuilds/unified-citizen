import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
}

export function Badge({
  variant = 'neutral',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}

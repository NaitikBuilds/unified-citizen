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
  neutral:
    'bg-ucg-fog/80 text-slate-600 ring-ucg-fog',
  success:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning:
    'bg-amber-50 text-amber-700 ring-amber-500/25',
  danger:
    'bg-red-50 text-red-700 ring-red-500/20',
  info:
    'bg-ucg-blue/8 text-ucg-blue ring-ucg-blue/15',
  purple:
    'bg-violet-50 text-violet-700 ring-violet-500/20',
}

export function Badge({
  variant = 'neutral',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-system text-[0.6875rem] font-medium tracking-[0.08em] uppercase ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ucg-blue text-white hover:bg-blue-700 focus-visible:outline-ucg-blue active:bg-blue-800',
  secondary:
    'bg-ucg-fog text-ucg-ink hover:bg-slate-200 focus-visible:outline-slate-500 active:bg-slate-300',
  outline:
    'border border-ucg-fog bg-white text-ucg-ink hover:bg-ucg-paper focus-visible:outline-ucg-blue active:bg-ucg-fog',
  ghost:
    'bg-transparent text-ucg-ink hover:bg-ucg-fog focus-visible:outline-slate-500 active:bg-slate-200',
  // Danger stays on the red scale — a destructive action must read as
  // unmistakably critical and hold contrast (ucg-critical is a lighter
  // salmon that fails white-text AA on large fills).
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 active:bg-red-800',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {isLoading && (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}

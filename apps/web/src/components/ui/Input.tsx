import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  /** Optional element rendered inside the input on the left (e.g. an icon). */
  leftSlot?: ReactNode
  /** Optional element rendered inside the input on the right (e.g. a visibility toggle). */
  rightSlot?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function Input({
  label,
  hint,
  error,
  leftSlot,
  rightSlot,
  className,
  id,
  ref,
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy =
    error ?? hint
      ? `${inputId}-${error ? 'error' : 'hint'}`
      : undefined

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftSlot && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {leftSlot}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
            'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30',
            error ? 'border-red-500' : 'border-slate-300',
            leftSlot ? 'pl-9' : undefined,
            rightSlot ? 'pr-10' : undefined,
            className,
          )}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightSlot}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

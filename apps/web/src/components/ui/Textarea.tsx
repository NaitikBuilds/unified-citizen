import { useId, type Ref, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  /** Extra classes for the label element (when `label` is provided). */
  labelClassName?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({
  label,
  hint,
  error,
  labelClassName,
  className,
  id,
  ref,
  ...rest
}: TextareaProps) {
  const autoId = useId()
  const textareaId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn('mb-1.5 block text-sm font-medium text-slate-700', labelClassName)}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

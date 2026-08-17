import { useId, type Ref, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  options: SelectOption[]
  /** Extra classes for the label element (when `label` is provided). */
  labelClassName?: string
  ref?: Ref<HTMLSelectElement>
}

export function Select({
  label,
  hint,
  error,
  placeholder,
  options,
  labelClassName,
  className,
  id,
  ref,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className={cn('mb-1.5 block text-sm font-medium text-slate-700', labelClassName)}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          'focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

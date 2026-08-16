import type {
  HTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('min-w-full divide-y divide-slate-200 text-sm', className)}
        {...rest}
      />
    </div>
  )
}

export function TableHeader({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-slate-50', className)} {...rest} />
}

export function TableBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-slate-100 bg-white', className)} {...rest} />
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-slate-50/70', className)} {...rest} />
}

export function TableHead({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
        className,
      )}
      {...rest}
    />
  )
}

export function TableCell({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3 text-slate-700', className)}
      {...rest}
    />
  )
}

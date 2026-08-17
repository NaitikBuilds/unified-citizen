import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

export interface PaginationProps {
  page: number
  totalPages: number
  total?: number
  onPageChange: (page: number) => void
  className?: string
}

/** Builds a compact page window: 1 … prev current next … last. */
function pageWindow(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages: Array<number | 'ellipsis'> = [1]
  if (current > 3) {
    pages.push('ellipsis')
  }
  for (
    let page = Math.max(2, current - 1);
    page <= Math.min(total - 1, current + 1);
    page += 1
  ) {
    pages.push(page)
  }
  if (current < total - 2) {
    pages.push('ellipsis')
  }
  pages.push(total)
  return pages
}

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      className={cn('flex flex-wrap items-center gap-1', className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span className="sr-only">Previous</span>
      </Button>

      {pageWindow(page, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-slate-400" aria-hidden="true">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className={item === page ? '' : 'min-w-8'}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>

      {total !== undefined && (
        <span className="ml-3 font-system text-[0.6875rem] uppercase tracking-[0.12em] text-slate-500">
          {total} {total === 1 ? 'item' : 'items'}
        </span>
      )}
    </nav>
  )
}

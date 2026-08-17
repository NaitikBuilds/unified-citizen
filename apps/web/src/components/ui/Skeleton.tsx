import { cn } from '../../utils/cn'

export interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-ucg-fog motion-reduce:animate-none', className)}
      aria-hidden="true"
    />
  )
}

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

/** Multi-line text skeleton used for cards and paragraphs. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={index === lines - 1 ? 'h-3.5 w-2/3' : 'h-3.5 w-full'} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ucg-fog bg-white p-5 shadow-[0_1px_2px_rgba(9,12,18,0.04)]',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="mb-3 h-4 w-1/3" />
      <SkeletonText lines={2} />
    </div>
  )
}

import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface PublicPageProps {
  children: ReactNode
  /** Content width: 'lg' = max-w-7xl (default), 'md' = max-w-5xl, 'sm' = max-w-3xl. */
  size?: 'lg' | 'md' | 'sm'
  className?: string
}

/**
 * Shared container for public inner pages — consistent gutters and vertical
 * rhythm. The fixed pill header is cleared by PageHero; this shell keeps the
 * rest of the page on the civic grid.
 */
export function PublicPage({ children, size = 'lg', className }: PublicPageProps) {
  const width =
    size === 'sm' ? 'max-w-3xl' : size === 'md' ? 'max-w-5xl' : 'max-w-7xl'
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', width, className)}>
      {children}
    </div>
  )
}

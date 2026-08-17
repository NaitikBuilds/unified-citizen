import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Reveal } from './Reveal'
import { SystemStatus } from './SystemStatus'

export interface PageHeroProps {
  /** Mono eyebrow above the title, e.g. "ABOUT". */
  eyebrow: string
  title: string
  description?: string
  /** Optional mono system readout rendered under the description. */
  meta?: string
  align?: 'left' | 'center'
  children?: ReactNode
  className?: string
}

/**
 * Editorial hero for public inner pages: mono eyebrow, strong serif H1,
 * supporting paragraph, optional system readout, and subtle grid geometry.
 * Provides the top clearance under the fixed floating pill header.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  meta,
  align = 'left',
  children,
  className,
}: PageHeroProps) {
  const centered = align === 'center'
  return (
    <header className={cn('page-hero', className)}>
      <div
        className={cn(
          'page-hero-inner',
          centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl',
        )}
      >
        <Reveal>
          <p className={cn('eyebrow text-ucg-blue', centered && 'justify-center')}>
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="page-hero-title mt-5">{title}</h1>
        </Reveal>
        {description && (
          <Reveal delay={160}>
            <p className={cn('page-hero-desc', centered && 'mx-auto')}>{description}</p>
          </Reveal>
        )}
        {(meta || children) && (
          <Reveal delay={240}>
            <div className={cn('mt-6', centered && 'flex justify-center')}>
              {meta ? <SystemStatus label={meta} /> : null}
              {children}
            </div>
          </Reveal>
        )}
      </div>
    </header>
  )
}

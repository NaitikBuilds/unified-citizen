import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Reveal } from './Reveal'

export interface CtaPanelAction {
  to: string
  label: string
  /** For light panels, render as outline instead of solid. */
  secondary?: boolean
}

export interface CtaPanelProps {
  eyebrow?: string
  title: string
  description?: string
  actions: CtaPanelAction[]
  /** midnight (default) or light surface. */
  tone?: 'midnight' | 'light'
  children?: ReactNode
  className?: string
}

/** Contextual call-to-action strip used at the end of public inner pages. */
export function CtaPanel({
  eyebrow,
  title,
  description,
  actions,
  tone = 'midnight',
  children,
  className,
}: CtaPanelProps) {
  return (
    <Reveal className={className}>
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12',
          tone === 'midnight' ? 'cta-panel-midnight' : 'cta-panel-light',
        )}
      >
        {tone === 'midnight' && (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(120,150,200,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,200,0.08) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative">
          {eyebrow && (
            <p
              className={cn(
                'eyebrow justify-center',
                tone === 'midnight' ? 'text-ucg-signal' : 'text-ucg-blue',
              )}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              'display-serif-sm mx-auto mt-4 max-w-2xl',
              tone === 'midnight' ? 'text-ucg-white' : 'text-ucg-ink',
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'mx-auto mt-4 max-w-xl',
                tone === 'midnight' ? 'text-blue-200/80' : 'text-slate-600',
              )}
            >
              {description}
            </p>
          )}
          {children}
          {actions.length > 0 && (
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {actions.map((action) =>
                action.secondary ? (
                  <Link
                    key={action.to + action.label}
                    to={action.to}
                    className={cn(
                      'inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-semibold transition-colors',
                      tone === 'midnight'
                        ? 'border-white/30 text-ucg-white hover:bg-white/10'
                        : 'border-slate-300 text-ucg-ink hover:bg-slate-50',
                    )}
                  >
                    {action.label}
                  </Link>
                ) : (
                  <Link
                    key={action.to + action.label}
                    to={action.to}
                    className={cn(
                      'inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors',
                      tone === 'midnight'
                        ? 'bg-ucg-white text-ucg-ink hover:bg-blue-50'
                        : 'bg-ucg-blue text-white hover:bg-blue-700',
                    )}
                  >
                    {action.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}

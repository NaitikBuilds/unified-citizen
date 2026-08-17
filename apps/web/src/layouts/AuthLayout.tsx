import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Landmark } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import { CitySkyline } from '../components/hero/CitySkyline'

export interface AuthNarrative {
  /** Mono eyebrow shown above the headline, e.g. "CITIZEN ACCESS". */
  eyebrow: string
  /** Editorial serif headline in the civic panel. */
  headline: string
  /** Supporting description. */
  description: string
}

export interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Cross-link row under the panel, e.g. "Don't have an account? Create one". */
  footer?: ReactNode
  narrative: AuthNarrative
}

/**
 * V2 authentication shell: a split-screen CivicOS surface.
 *
 * Desktop — left: midnight civic narrative (grid, system readout, skyline);
 * right: paper/light form surface. Mobile — the narrative collapses into a
 * compact cinematic header above the form so signing in stays immediate.
 * Presentation only; no auth behavior lives here.
 */
export function AuthLayout({ title, subtitle, children, footer, narrative }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ucg-paper lg:flex-row">
      {/* Desktop civic narrative */}
      <aside className="auth-narrative" aria-label="About the platform">
        <div className="auth-narrative-inner">
          <Link to="/" className="ucg-logo" aria-label="Unified Citizen — home">
            <span className="ucg-logo-mark">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <span className="ucg-wordmark">Unified Citizen</span>
          </Link>

          <div className="auth-narrative-copy">
            <p className="eyebrow text-ucg-signal">{narrative.eyebrow}</p>
            <h1 className="display-serif-sm mt-5">{narrative.headline}</h1>
            <p className="auth-narrative-desc mt-5">{narrative.description}</p>
          </div>

          <span className="auth-system-readout">
            <span className="auth-system-dot" aria-hidden="true" />
            CIVIC GRID · SECURE ACCESS
          </span>
        </div>
        <div className="auth-skyline" aria-hidden="true">
          <CitySkyline />
        </div>
      </aside>

      {/* Light surface */}
      <div className="relative flex flex-1 flex-col">
        <div className="auth-topbar">
          <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="Unified Citizen — home">
            <span className="ucg-logo-mark">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <span className="ucg-wordmark">Unified Citizen</span>
          </Link>
          <Link to="/" className="auth-back">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>

        {/* Mobile: compact cinematic header */}
        <div className="auth-mobile-hero lg:hidden">
          <div className="auth-skyline" aria-hidden="true">
            <CitySkyline />
          </div>
          <div className="relative z-[1]">
            <p className="eyebrow text-ucg-signal">{narrative.eyebrow}</p>
            <h1 className="display-serif-sm mt-4">{narrative.headline}</h1>
            <p className="auth-narrative-desc mt-3">{narrative.description}</p>
          </div>
        </div>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="w-full max-w-md">
            <div className="auth-panel">
              <p className="auth-panel-eyebrow">{title.toUpperCase()}</p>
              <h2 className="mt-3">{title}</h2>
              {subtitle && <p className="auth-panel-sub">{subtitle}</p>}
              <div className="mt-6">{children}</div>
            </div>
            {footer && (
              <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>
            )}
          </div>
        </main>

        <div className="lg:hidden">
          <Footer />
        </div>
      </div>
    </div>
  )
}

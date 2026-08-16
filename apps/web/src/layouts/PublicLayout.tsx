import type { ReactNode } from 'react'
import { Landmark } from 'lucide-react'
import { Footer } from '../components/layout/Footer'

export interface PublicLayoutProps {
  /** Primary navigation links (rendered on md+ screens; mobile nav arrives in Phase 4). */
  nav?: ReactNode
  /** Right-side actions, e.g. a Sign in button. */
  actions?: ReactNode
  children: ReactNode
}

/**
 * Base layout for unauthenticated/public pages (landing, about, FAQ, etc.).
 * Router-agnostic: callers pass the navigation and actions they need.
 */
export function PublicLayout({ nav, actions, children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600">
              <Landmark className="size-5 text-white" aria-hidden="true" />
            </span>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">
              Unified Citizen Governance
            </span>
          </div>

          {nav && (
            <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
              {nav}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}

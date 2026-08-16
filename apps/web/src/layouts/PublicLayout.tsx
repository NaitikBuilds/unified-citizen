import type { ReactNode } from 'react'
import { Landmark } from 'lucide-react'
import { Footer } from '../components/layout/Footer'
import type { NavItem } from '../components/layout/types'

export interface PublicLayoutProps {
  navItems?: NavItem[]
  onNavigate?: (key: string) => void
  actions?: ReactNode
  children: ReactNode
}

/**
 * Base layout for unauthenticated/public pages (landing, about, FAQ, etc.).
 * Prop-driven so Phase 2 pages supply their own navigation without duplicating
 * the shell.
 */
export function PublicLayout({
  navItems = [],
  onNavigate,
  actions,
  children,
}: PublicLayoutProps) {
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

          {navItems.length > 0 && (
            <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate?.(item.key)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {item.label}
                </button>
              ))}
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

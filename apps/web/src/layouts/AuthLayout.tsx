import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Landmark } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui'
import { Footer } from '../components/layout/Footer'

export interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Cross-link row under the card, e.g. "Don't have an account? Create one". */
  footer?: ReactNode
}

/**
 * Shared shell for the authentication screens. Matches the landing page
 * design language (brand header + footer, centered card) and stays
 * responsive on mobile.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600">
              <Landmark className="size-5 text-white" aria-hidden="true" />
            </span>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">
              Unified Citizen Governance
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-14">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
          {footer && (
            <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

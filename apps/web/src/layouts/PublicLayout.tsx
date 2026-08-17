import type { ReactNode } from 'react'
import { Footer } from '../components/layout/Footer'
import { PublicHeader } from '../components/layout/PublicHeader'

export interface PublicLayoutProps {
  /** Primary navigation links (rendered in the pill on md+ and the mobile drawer). */
  nav?: ReactNode
  /** Right-side actions, e.g. a Sign in button. */
  actions?: ReactNode
  /** dark = transparent over a cinematic hero until scrolled; light = always compact. */
  tone?: 'light' | 'dark'
  children: ReactNode
}

/**
 * Base layout for unauthenticated/public pages. The floating pill header
 * sits over the page; the home page passes tone="dark" so it starts
 * transparent above the cinematic hero.
 */
export function PublicLayout({ nav, actions, tone = 'light', children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ucg-paper">
      <PublicHeader nav={nav} actions={actions} tone={tone} />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}

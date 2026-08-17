import { useState, type ReactNode } from 'react'
import { Topbar } from '../components/layout/Topbar'
import { Sidebar } from '../components/layout/Sidebar'
import { MobileNav } from '../components/layout/MobileNav'
import type { NavItem } from '../components/layout/types'

export interface AppLayoutProps {
  title?: string
  navItems: NavItem[]
  activeKey?: string
  onNavigate: (key: string) => void
  topbarRight?: ReactNode
  sidebarFooter?: ReactNode
  children: ReactNode
}

/**
 * V4.1 civic portal shell shared by the Citizen, Department, and Admin
 * portals: paper surface with a faint civic grid, white sidebar with a
 * signal-treated active nav item, sticky translucent topbar, centered
 * content column, and a slim operational footer. Behavior is unchanged —
 * this is presentation only.
 */
export function AppLayout({
  title,
  navItems,
  activeKey,
  onNavigate,
  topbarRight,
  sidebarFooter,
  children,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="portal-shell">
      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          activeKey={activeKey}
          onSelect={onNavigate}
          footer={sidebarFooter}
        />

        <MobileNav
          open={mobileOpen}
          navItems={navItems}
          activeKey={activeKey}
          onSelect={onNavigate}
          onClose={() => setMobileOpen(false)}
          footer={sidebarFooter}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={title}
            onMenuClick={() => setMobileOpen(true)}
            right={topbarRight}
          />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      <div className="portal-footer">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="portal-system-label">Unified Citizen Governance · Operations console</p>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} City Governance Portal
          </p>
        </div>
      </div>
    </div>
  )
}

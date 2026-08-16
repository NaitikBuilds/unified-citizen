import { useState, type ReactNode } from 'react'
import { Landmark } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Sidebar } from '../components/layout/Sidebar'
import { MobileNav } from '../components/layout/MobileNav'
import { Footer } from '../components/layout/Footer'
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
 * Base authenticated shell shared by the Citizen, Department, and Admin
 * portals. Prop-driven: each portal supplies its own navigation config in
 * later phases. Fully responsive (sidebar → drawer on mobile).
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
    <div className="flex min-h-screen flex-col bg-slate-50">
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
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-2 pb-4 pt-2">
          <Landmark className="size-4 text-slate-400" aria-hidden="true" />
          <p className="text-xs text-slate-400">Unified Citizen Governance</p>
        </div>
        <Footer />
      </div>
    </div>
  )
}

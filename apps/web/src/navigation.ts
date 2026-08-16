import { LayoutDashboard } from 'lucide-react'
import type { NavItem } from './components/layout/types'

/**
 * Per-portal navigation configs consumed by PortalLayout. Items are added as
 * later phases implement their screens (Phase 4+ adds citizen nav, Phase 24+
 * department, Phase 36+ admin).
 */
export const portalNavigation = {
  citizen: [
    { key: 'dashboard', label: 'Dashboard', href: '/citizen', icon: LayoutDashboard },
  ] satisfies NavItem[],

  department: [
    { key: 'dashboard', label: 'Dashboard', href: '/department', icon: LayoutDashboard },
  ] satisfies NavItem[],

  admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ] satisfies NavItem[],
} satisfies Record<'citizen' | 'department' | 'admin', NavItem[]>

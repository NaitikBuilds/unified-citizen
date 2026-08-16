import {
  Bell,
  CircleHelp,
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Settings,
  UserRound,
} from 'lucide-react'
import type { NavItem } from './components/layout/types'

/**
 * Per-portal navigation configs consumed by PortalLayout. Items are added as
 * later phases implement their screens (Phase 4+ adds citizen nav, Phase 24+
 * department, Phase 36+ admin).
 */
export const portalNavigation = {
  citizen: [
    { key: 'dashboard', label: 'Dashboard', href: '/citizen', icon: LayoutDashboard },
    { key: 'grievances', label: 'My Grievances', href: '/citizen/grievances', icon: ListTodo },
    { key: 'submit', label: 'Submit Grievance', href: '/citizen/submit', icon: PlusCircle },
    { key: 'notifications', label: 'Notifications', href: '/citizen/notifications', icon: Bell },
    { key: 'profile', label: 'Profile', href: '/citizen/profile', icon: UserRound },
    { key: 'settings', label: 'Settings', href: '/citizen/settings', icon: Settings },
    { key: 'help', label: 'Help', href: '/citizen/help', icon: CircleHelp },
  ] satisfies NavItem[],

  department: [
    { key: 'dashboard', label: 'Dashboard', href: '/department', icon: LayoutDashboard },
  ] satisfies NavItem[],

  admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ] satisfies NavItem[],
} satisfies Record<'citizen' | 'department' | 'admin', NavItem[]>

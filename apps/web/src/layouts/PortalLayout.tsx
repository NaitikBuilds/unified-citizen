import { useCallback } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { AppLayout } from './AppLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth/auth-context'
import { portalNavigation } from '../navigation'
import { ROLE_LABELS, type Portal } from '../auth/roles'

export interface PortalLayoutProps {
  portal: Portal
}

/**
 * Authenticated shell for the Citizen, Department, and Admin portals.
 * Resolves the portal's nav config, highlights the active item, and provides
 * the session user chip + logout in the topbar and sidebar footer.
 */
export function PortalLayout({ portal }: PortalLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = portalNavigation[portal]

  const activeKey = navItems.find(
    (item) => item.href && location.pathname.startsWith(item.href),
  )?.key

  const handleNavigate = useCallback(
    (key: string) => {
      const item = navItems.find((navItem) => navItem.key === key)
      if (item?.href) {
        navigate(item.href)
      }
    },
    [navItems, navigate],
  )

  const handleLogout = useCallback(async () => {
    // Navigate to the public home first, then clear the session, so the user
    // leaves the portal instead of bouncing back through the auth guard.
    navigate('/')
    await logout()
  }, [logout, navigate])

  const title =
    portal === 'citizen'
      ? 'Citizen Portal'
      : portal === 'department'
        ? 'Department Portal'
        : 'Administration'

  const userName = user?.name ?? ''
  const userRole = user ? ROLE_LABELS[user.role] : ''

  return (
    <AppLayout
      title={title}
      navItems={navItems}
      activeKey={activeKey}
      onNavigate={handleNavigate}
      topbarRight={
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-100">
              <UserRound className="size-4 text-slate-500" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      }
      sidebarFooter={
        <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      }
    >
      <Outlet />
    </AppLayout>
  )
}

import { useCallback, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { AppLayout } from './AppLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../auth/auth-context'
import { portalNavigation } from '../navigation'
import { ROLE_LABELS, type Portal } from '../auth/roles'

export interface PortalLayoutProps {
  portal: Portal
  /**
   * Visual identity for the shell. Defaults to the portal's own identity;
   * override only when a portal should wear another role's tone.
   */
  tone?: Portal
  /** Extra actions rendered in the topbar before the user chip (e.g. a notification bell). */
  topbarExtra?: ReactNode
}

/**
 * Authenticated shell for the Citizen, Department, and Admin portals.
 * Resolves the portal's nav config, highlights the active item, and provides
 * the session user chip + logout in the topbar and sidebar footer.
 */
export function PortalLayout({ portal, tone = portal, topbarExtra }: PortalLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = portalNavigation[portal]

  // Active-route correctness: exact pathname match first, then the longest
  // matching prefix, otherwise undefined. (Previously the first nav item
  // whose prefix matched could win over an exact nested route.)
  const activeKey = (() => {
    const exact = navItems.find((item) => item.href && location.pathname === item.href)
    if (exact) {
      return exact.key
    }
    const longestPrefix = navItems
      .filter((item) => item.href && location.pathname.startsWith(`${item.href}/`))
      .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0]
    return longestPrefix?.key
  })()

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
    // Navigate to the sign-in page first, then clear the session, so the user
    // leaves the portal instead of bouncing back through the auth guard.
    navigate('/auth/login')
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
  const avatarText = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const userChip = (
    <div className="portal-user-chip">
      <span className="portal-avatar" aria-hidden="true">
        {avatarText || <UserRound className="size-4" />}
        <span className="portal-avatar-dot" />
      </span>
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="truncate text-sm font-medium text-ucg-ink">{userName}</p>
        <p className="portal-system-label mt-0.5">{userRole.toUpperCase()}</p>
      </div>
    </div>
  )

  return (
    <AppLayout
      tone={tone}
      title={title}
      navItems={navItems}
      activeKey={activeKey}
      onNavigate={handleNavigate}
      topbarRight={
        <div className="flex items-center gap-2 sm:gap-3">
          {topbarExtra}
          {userChip}
          <Button
            variant="outline"
            size="sm"
            className="portal-signout"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      }
      sidebarFooter={
        <Button
          variant="ghost"
          size="sm"
          className="portal-signout w-full"
          onClick={handleLogout}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      }
    >
      <Outlet />
    </AppLayout>
  )
}

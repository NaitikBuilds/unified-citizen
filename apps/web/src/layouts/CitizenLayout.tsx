import { PortalLayout } from './PortalLayout'
import { NotificationBell } from '../components/notifications/NotificationBell'

/**
 * Citizen portal shell (Member 4 — Step 86). Composes the shared PortalLayout
 * with citizen-specific topbar chrome (notification entry point). The citizen
 * navigation lives in `navigation.ts`; session/auth come from the shared
 * AuthProvider. Notification unread state is wired in Step 94.
 */
export function CitizenLayout() {
  return (
    <PortalLayout
      portal="citizen"
      topbarExtra={<NotificationBell />}
    />
  )
}

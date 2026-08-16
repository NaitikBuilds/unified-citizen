import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PageLoader } from '../components/ui/PageLoader'
import { useAuth } from './auth-context'

export interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Blocks unauthenticated access. While the session is being restored a loader
 * is shown (prevents a flash of the login screen). On sign-out the user is
 * sent to /auth/login with the attempted location preserved as returnTo.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader label="Restoring your session…" />
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />
  }

  return <>{children}</>
}

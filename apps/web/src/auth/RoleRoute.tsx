import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { UserRole } from '../contracts/auth'
import { roleHomePath } from './roles'
import { useAuth } from './auth-context'

export interface RoleRouteProps {
  roles: UserRole[]
  children: ReactNode
}

/**
 * Role-aware guard for portal route groups. Users whose role is not allowed
 * are redirected to their own portal home. This controls navigation UX only —
 * the backend enforces authorization.
 */
export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }

  return <>{children}</>
}

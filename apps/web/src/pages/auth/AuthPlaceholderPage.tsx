import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState } from '../../components/ui'
import { useAuth } from '../../auth/auth-context'
import { roleHomePath } from '../../auth/roles'

export interface AuthPlaceholderPageProps {
  mode: 'login' | 'register'
}

/**
 * Placeholder for the authentication screens. The real Sign in / Register UI
 * is implemented in Phase 3 — the auth mechanism (AuthProvider, service layer,
 * token persistence) is already wired. Authenticated users are redirected to
 * their own portal.
 */
export function AuthPlaceholderPage({ mode }: AuthPlaceholderPageProps) {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }

  const isLogin = mode === 'login'

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{isLogin ? 'Sign in' : 'Create an account'}</CardTitle>
          <CardDescription>
            The sign-in experience is implemented in Phase 3. The shared
            authentication system is already in place — routes are protected and
            sessions are restored automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={isLogin ? 'Sign in coming in Phase 3' : 'Registration coming in Phase 3'}
            description={
              isLogin
                ? 'Use the foundation smoke screen (/foundation) or mock accounts to explore the portals meanwhile.'
                : 'Citizen registration will be available here once the Phase 3 UI ships.'
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

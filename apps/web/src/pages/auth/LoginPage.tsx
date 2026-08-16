import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { roleHomePath } from '../../auth/roles'
import { getErrorMessage } from '../../utils/errors'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'

interface LoginFormErrors {
  email?: string
  password?: string
  form?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Citizen sign-in. Uses the shared AuthProvider/AuthService — no separate
 * auth mechanism. On success the user is routed by role (Citizen → /citizen,
 * staff → /department, super admin → /admin), honoring a safe `returnTo`.
 */
export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const location = useLocation()

  const locationState = location.state as
    | { registered?: boolean; email?: string }
    | null
  const registered = locationState?.registered === true

  const [email, setEmail] = useState(locationState?.email ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Already signed in → go to the user's portal (or a safe returnTo within it).
  if (isAuthenticated && user) {
    const home = roleHomePath(user.role)
    const returnTo = new URLSearchParams(location.search).get('returnTo')
    const target = returnTo && returnTo.startsWith(home) ? returnTo : home
    return <Navigate to={target} replace />
  }

  function validate(): boolean {
    const next: LoginFormErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      next.email = 'Email is required'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = 'Enter a valid email address'
    }

    if (!password) {
      next.password = 'Password is required'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      await login({ email: email.trim(), password })
      // Success: AuthProvider updates state and the redirect above takes over.
    } catch (error) {
      setErrors({ form: getErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Sign in to submit, track and resolve your grievances."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create one
          </Link>
        </>
      }
    >
      {registered && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Account created successfully. Please sign in.
        </div>
      )}

      {errors.form && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={isSubmitting}
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          }
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          <LogIn className="size-4" aria-hidden="true" />
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}

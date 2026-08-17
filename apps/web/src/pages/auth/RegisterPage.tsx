import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../../auth/auth-context'
import { roleHomePath } from '../../auth/roles'
import { getErrorMessage, isApiError } from '../../utils/errors'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'

interface RegisterFormErrors {
  name?: string
  email?: string
  password?: string
  confirm?: string
  form?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Citizen registration. Fields and rules mirror the backend register contract
 * (apps/api: name ≥ 2, valid email, password ≥ 6). The password confirmation
 * is a client-side check only. The backend does not auto-login on register —
 * on success the user is sent to the sign-in page.
 */
export function RegisterPage() {
  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated && user) {
    return <Navigate to={roleHomePath(user.role)} replace />
  }

  function validate(): boolean {
    const next: RegisterFormErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      next.name = 'Name is required'
    } else if (trimmedName.length < 2) {
      next.name = 'Name must be at least 2 characters long'
    }

    if (!trimmedEmail) {
      next.email = 'Email is required'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = 'Enter a valid email address'
    }

    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters long'
    }

    if (!confirm) {
      next.confirm = 'Please confirm your password'
    } else if (confirm !== password) {
      next.confirm = 'Passwords do not match'
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
      await register({ name: name.trim(), email: email.trim(), password })
      // Backend contract: account created, not auto-logged-in → sign in next.
      navigate('/auth/login', {
        state: { registered: true, email: email.trim() },
      })
    } catch (error) {
      if (isApiError(error) && error.fieldErrors) {
        setErrors({
          ...(error.fieldErrors.name ? { name: error.fieldErrors.name } : {}),
          ...(error.fieldErrors.email ? { email: error.fieldErrors.email } : {}),
          ...(error.fieldErrors.password ? { password: error.fieldErrors.password } : {}),
          ...(error.fieldErrors.confirm ? { confirm: error.fieldErrors.confirm } : {}),
        })
      } else {
        setErrors({ form: getErrorMessage(error) })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Free registration — submit and track grievances in minutes."
      narrative={{
        eyebrow: 'Join the civic grid',
        headline: 'Your voice in the city\u2019s system.',
        description:
          'A free account lets you report issues, receive updates and stay in control of every resolution.',
      }}
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="auth-crosslink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign in
          </Link>
        </>
      }
    >
      {errors.form && (
        <div role="alert" className="auth-alert auth-alert-error mb-5">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          disabled={isSubmitting}
          required
          className="ucg-input-field"
          labelClassName="auth-label"
        />

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
          className="ucg-input-field"
          labelClassName="auth-label"
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="Use at least 6 characters."
          error={errors.password}
          disabled={isSubmitting}
          required
          className="ucg-input-field"
          labelClassName="auth-label"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          }
        />

        <Input
          label="Confirm password"
          name="confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
          disabled={isSubmitting}
          required
          className="ucg-input-field"
          labelClassName="auth-label"
        />

        <Button type="submit" size="lg" className="ucg-btn-submit w-full" isLoading={isSubmitting}>
          <UserPlus className="size-4" aria-hidden="true" />
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}

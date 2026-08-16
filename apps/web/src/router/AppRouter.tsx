import { Link, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { PortalLayout } from '../layouts/PortalLayout'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { RoleRoute } from '../auth/RoleRoute'
import { PublicNav } from '../components/layout/PublicNav'
import { useAuth } from '../auth/auth-context'
import { roleHomePath } from '../auth/roles'

import { HomePage } from '../pages/public/HomePage'
import { AboutPage } from '../pages/public/AboutPage'
import { ServicesPage } from '../pages/public/ServicesPage'
import { HowItWorksPage } from '../pages/public/HowItWorksPage'
import { DepartmentsPage } from '../pages/public/DepartmentsPage'
import { FaqPage } from '../pages/public/FaqPage'
import { ContactPage } from '../pages/public/ContactPage'
import { HelpPage } from '../pages/public/HelpPage'

import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { CitizenLayout } from '../layouts/CitizenLayout'
import { CitizenDashboardPage } from '../pages/citizen/CitizenDashboardPage'
import { SubmitGrievancePage } from '../pages/citizen/SubmitGrievancePage'
import { CitizenPlaceholderPage } from '../pages/citizen/CitizenPlaceholderPage'
import { DepartmentDashboardPage } from '../pages/department/DepartmentDashboardPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { FoundationPage } from '../pages/FoundationPage'

function LandingActions() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return (
      <Link
        to={roleHomePath(user.role)}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Go to portal
      </Link>
    )
  }

  return (
    <>
      <Link
        to="/auth/login"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Sign in
      </Link>
      <Link
        to="/auth/register"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Register
      </Link>
    </>
  )
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public landing (Phase 2 — Member 4 Step 84) */}
      <Route
        path="/"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <AboutPage />
          </PublicLayout>
        }
      />
      <Route
        path="/services"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <ServicesPage />
          </PublicLayout>
        }
      />
      <Route
        path="/how-it-works"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <HowItWorksPage />
          </PublicLayout>
        }
      />
      <Route
        path="/departments"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <DepartmentsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <FaqPage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <ContactPage />
          </PublicLayout>
        }
      />
      <Route
        path="/help"
        element={
          <PublicLayout nav={<PublicNav />} actions={<LandingActions />}>
            <HelpPage />
          </PublicLayout>
        }
      />

      {/* Dev reference: Phase 0 foundation smoke screen */}
      <Route path="/foundation" element={<FoundationPage />} />

      {/* Citizen authentication (Phase 3 — Member 4 Step 85) */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Citizen portal group (Member 4) */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['CITIZEN']}>
              <CitizenLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/citizen" element={<CitizenDashboardPage />} />
        {/* Built in later steps of this batch: 91 list, 92 details, 94 notifications */}
        <Route
          path="/citizen/grievances"
          element={
            <CitizenPlaceholderPage
              title="My Grievances"
              phase="Step 91 — Member 4"
              description="Your grievance list with filters, search, sorting and pagination will appear here."
            />
          }
        />
        <Route
          path="/citizen/grievances/:id"
          element={
            <CitizenPlaceholderPage
              title="Grievance Details"
              phase="Step 92 — Member 4"
              description="Full grievance details, AI analysis, SLA and timeline will appear here."
            />
          }
        />
        <Route path="/citizen/submit" element={<SubmitGrievancePage />} />
        <Route
          path="/citizen/notifications"
          element={
            <CitizenPlaceholderPage
              title="Notifications"
              phase="Step 94 — Member 4"
              description="Your notification center with unread tracking will appear here."
            />
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <CitizenPlaceholderPage
              title="Profile"
              phase="Step 99 — Member 4"
              description="Your name, contact details and security settings will appear here."
            />
          }
        />
        <Route
          path="/citizen/settings"
          element={
            <CitizenPlaceholderPage
              title="Settings"
              phase="Step 100 — Member 4"
              description="Notification preferences, language and accessibility options will appear here."
            />
          }
        />
        <Route
          path="/citizen/help"
          element={
            <CitizenPlaceholderPage
              title="Help"
              phase="Step 101 — Member 4"
              description="FAQ, support and grievance guidance will appear here."
            />
          }
        />
      </Route>

      {/* Department portal group (officers + department admins) */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['OFFICER', 'DEPARTMENT_ADMIN']}>
              <PortalLayout portal="department" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/department" element={<DepartmentDashboardPage />} />
      </Route>

      {/* Admin portal group */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute roles={['SUPER_ADMIN']}>
              <PortalLayout portal="admin" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

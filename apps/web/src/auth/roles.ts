import type { UserRole } from '../contracts/auth'

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  OFFICER: 'Officer',
  DEPARTMENT_ADMIN: 'Department Admin',
  SUPER_ADMIN: 'Super Admin',
}

export const ALL_ROLES: UserRole[] = ['CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN']

/** The portal a role belongs to. Citizens get their own portal; staff share the department portal. */
export type Portal = 'citizen' | 'department' | 'admin'

export function portalForRole(role: UserRole): Portal {
  switch (role) {
    case 'CITIZEN':
      return 'citizen'
    case 'OFFICER':
    case 'DEPARTMENT_ADMIN':
      return 'department'
    case 'SUPER_ADMIN':
      return 'admin'
  }
}

/** Landing route for an authenticated role (used by guards and redirects). */
export function roleHomePath(role: UserRole): string {
  switch (role) {
    case 'CITIZEN':
      return '/citizen'
    case 'OFFICER':
    case 'DEPARTMENT_ADMIN':
      return '/department'
    case 'SUPER_ADMIN':
      return '/admin'
  }
}

export function isDepartmentStaff(role: UserRole): boolean {
  return role === 'OFFICER' || role === 'DEPARTMENT_ADMIN'
}

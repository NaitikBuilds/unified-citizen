import type { UserProfile } from '../../contracts/user'

export type MockUser = UserProfile & { password: string }

/** All mock accounts share this password — MOCK ONLY, never used in production. */
export const MOCK_PASSWORD = 'password123'

export const mockUsers: MockUser[] = [
  // --- Super admin ---
  {
    id: 'user-super-admin',
    name: 'Aarav Mehta',
    email: 'admin@unified.gov',
    role: 'SUPER_ADMIN',
    departmentId: null,
    phone: '+91 90000 00001',
    password: MOCK_PASSWORD,
    createdAt: '2026-01-05T09:00:00.000Z',
  },
  // --- Department admins ---
  {
    id: 'user-admin-pwd',
    name: 'Priya Sharma',
    email: 'priya.sharma@unified.gov',
    role: 'DEPARTMENT_ADMIN',
    departmentId: 'dept-pwd',
    phone: '+91 90000 00002',
    password: MOCK_PASSWORD,
    createdAt: '2026-01-08T10:00:00.000Z',
  },
  {
    id: 'user-admin-sanitation',
    name: 'Rahul Verma',
    email: 'rahul.verma@unified.gov',
    role: 'DEPARTMENT_ADMIN',
    departmentId: 'dept-sanitation',
    phone: '+91 90000 00003',
    password: MOCK_PASSWORD,
    createdAt: '2026-01-09T11:00:00.000Z',
  },
  // --- Officers ---
  {
    id: 'user-officer-pwd-1',
    name: 'Vikram Singh',
    email: 'vikram.singh@unified.gov',
    role: 'OFFICER',
    departmentId: 'dept-pwd',
    phone: '+91 90000 00011',
    password: MOCK_PASSWORD,
    createdAt: '2026-02-02T09:30:00.000Z',
  },
  {
    id: 'user-officer-pwd-2',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@unified.gov',
    role: 'OFFICER',
    departmentId: 'dept-pwd',
    phone: '+91 90000 00012',
    password: MOCK_PASSWORD,
    createdAt: '2026-02-03T09:30:00.000Z',
  },
  {
    id: 'user-officer-san-1',
    name: 'Kavya Nair',
    email: 'kavya.nair@unified.gov',
    role: 'OFFICER',
    departmentId: 'dept-sanitation',
    phone: '+91 90000 00013',
    password: MOCK_PASSWORD,
    createdAt: '2026-02-04T09:30:00.000Z',
  },
  {
    id: 'user-officer-water-1',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@unified.gov',
    role: 'OFFICER',
    departmentId: 'dept-water',
    phone: '+91 90000 00014',
    password: MOCK_PASSWORD,
    createdAt: '2026-02-05T09:30:00.000Z',
  },
  {
    id: 'user-officer-electricity-1',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@unified.gov',
    role: 'OFFICER',
    departmentId: 'dept-electricity',
    phone: '+91 90000 00015',
    password: MOCK_PASSWORD,
    createdAt: '2026-02-06T09:30:00.000Z',
  },
  {
    id: 'user-officer-health-1',
    name: 'Arjun Patel',
    email: 'arjun.patel@unified.gov',
    role: 'OFFICER',
    departmentId: 'dept-health',
    phone: '+91 90000 00016',
    password: MOCK_PASSWORD,
    createdAt: '2026-02-07T09:30:00.000Z',
  },
  // --- Citizens ---
  {
    id: 'user-citizen-1',
    name: 'Meera Joshi',
    email: 'meera.joshi@example.com',
    role: 'CITIZEN',
    departmentId: null,
    phone: '+91 90000 00101',
    password: MOCK_PASSWORD,
    createdAt: '2026-03-10T12:00:00.000Z',
  },
  {
    id: 'user-citizen-2',
    name: 'Aditya Rao',
    email: 'aditya.rao@example.com',
    role: 'CITIZEN',
    departmentId: null,
    phone: '+91 90000 00102',
    password: MOCK_PASSWORD,
    createdAt: '2026-03-12T12:00:00.000Z',
  },
  {
    id: 'user-citizen-3',
    name: 'Neha Kapoor',
    email: 'neha.kapoor@example.com',
    role: 'CITIZEN',
    departmentId: null,
    phone: '+91 90000 00103',
    password: MOCK_PASSWORD,
    createdAt: '2026-03-15T12:00:00.000Z',
  },
  {
    id: 'user-citizen-4',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@example.com',
    role: 'CITIZEN',
    departmentId: null,
    phone: '+91 90000 00104',
    password: MOCK_PASSWORD,
    createdAt: '2026-04-01T12:00:00.000Z',
  },
  {
    id: 'user-citizen-5',
    name: 'Divya Menon',
    email: 'divya.menon@example.com',
    role: 'CITIZEN',
    departmentId: null,
    phone: '+91 90000 00105',
    password: MOCK_PASSWORD,
    createdAt: '2026-04-05T12:00:00.000Z',
  },
]

/** Lookup helper used by mock services and data. */
export function getMockUser(id: string): MockUser | undefined {
  return mockUsers.find((user) => user.id === id)
}

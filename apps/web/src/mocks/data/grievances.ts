import type { Grievance } from '../../contracts/grievance'

export const mockGrievances: Grievance[] = [
  {
    id: 'GRV-1001',
    title: 'Large pothole near Main Road',
    description:
      'A large pothole is creating a serious traffic hazard near Main Road.',
    status: 'ASSIGNED',
    priority: 'HIGH',
    category: 'ROAD',
    department: {
      id: 'dept-pwd',
      name: 'Public Works Department',
    },
    assignedOfficer: {
      id: 'officer-001',
      name: 'Demo Officer',
      email: 'officer@example.com',
      departmentId: 'dept-pwd',
      isActive: true,
    },
    location: 'Main Road',
    createdAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T12:30:00.000Z',
  },
  {
    id: 'GRV-1002',
    title: 'Garbage accumulation in residential area',
    description:
      'Garbage has not been collected for several days in the residential area.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'SANITATION',
    department: {
      id: 'dept-sanitation',
      name: 'Sanitation Department',
    },
    location: 'Green Park',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'GRV-1003',
    title: 'Water contamination complaint',
    description:
      'Residents are reporting unusual smell and color in the supplied water.',
    status: 'ESCALATED',
    priority: 'CRITICAL',
    category: 'WATER',
    department: {
      id: 'dept-water',
      name: 'Water Department',
    },
    location: 'Lake View Colony',
    createdAt: '2026-08-14T07:30:00.000Z',
  },
]
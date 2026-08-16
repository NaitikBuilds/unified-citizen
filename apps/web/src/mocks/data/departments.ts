import type { Department } from '../../contracts/department'

export const mockDepartments: Department[] = [
  {
    id: 'dept-pwd',
    name: 'Public Works Department',
    code: 'PWD',
    description: 'Roads, footpaths, drainage and public infrastructure maintenance.',
    isActive: true,
    createdAt: '2026-01-05T09:00:00.000Z',
  },
  {
    id: 'dept-sanitation',
    name: 'Sanitation Department',
    code: 'SAN',
    description: 'Garbage collection, cleanliness drives and waste management.',
    isActive: true,
    createdAt: '2026-01-05T09:05:00.000Z',
  },
  {
    id: 'dept-water',
    name: 'Water Department',
    code: 'WTR',
    description: 'Water supply, leakage repair and water quality monitoring.',
    isActive: true,
    createdAt: '2026-01-05T09:10:00.000Z',
  },
  {
    id: 'dept-electricity',
    name: 'Electricity Department',
    code: 'ELE',
    description: 'Power supply, street lighting and electrical fault repair.',
    isActive: true,
    createdAt: '2026-01-05T09:15:00.000Z',
  },
  {
    id: 'dept-health',
    name: 'Health Department',
    code: 'HLT',
    description: 'Public health, sanitation hygiene and disease control.',
    isActive: true,
    createdAt: '2026-01-05T09:20:00.000Z',
  },
  {
    id: 'dept-transport',
    name: 'Transport Department',
    code: 'TRN',
    description: 'Public transport, traffic signals and road permits.',
    isActive: true,
    createdAt: '2026-01-05T09:25:00.000Z',
  },
]

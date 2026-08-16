import type { Feedback } from '../../contracts/feedback'

export const mockFeedback: Feedback[] = [
  {
    id: 'fb-1',
    grievanceId: 'GRV-1009',
    userId: 'user-citizen-1',
    rating: 5,
    comment: 'Very quick response. The bill was corrected within days.',
    createdAt: '2026-08-06T09:00:00.000Z',
  },
  {
    id: 'fb-2',
    grievanceId: 'GRV-1010',
    userId: 'user-citizen-3',
    rating: 4,
    comment: 'Bins installed promptly. One more bin near the east gate would help.',
    createdAt: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'fb-3',
    grievanceId: 'GRV-1013',
    userId: 'user-citizen-1',
    rating: 2,
    comment: 'Fixed once but the adjacent section is loose again. Reopened.',
    createdAt: '2026-08-11T09:00:00.000Z',
  },
]

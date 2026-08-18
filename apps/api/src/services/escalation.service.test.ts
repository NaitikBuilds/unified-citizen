import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEscalationsByGrievanceId,
  getEscalationsForUser,
} from './escalation.service.js';
import { prisma } from './prisma.service.js';

// Mock Prisma (same pattern as sla.service.test.ts).
vi.mock('./prisma.service.js', () => ({
  prisma: {
    escalation: {
      findMany: vi.fn(),
    },
  },
}));

const sampleEscalation = {
  id: 'esc-1',
  grievanceId: 'grv-1',
  level: 'LEVEL_1',
  status: 'OPEN',
  reason: 'SLA breached',
  createdById: 'officer-1',
  createdAt: new Date('2026-01-01'),
  escalatedAt: new Date('2026-01-01'),
  resolvedAt: null,
};

describe('getEscalationsByGrievanceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns escalations for an existing grievance', async () => {
    vi.mocked(prisma.escalation.findMany).mockResolvedValueOnce([sampleEscalation] as any);

    const escalations = await getEscalationsByGrievanceId('grv-1');

    expect(escalations).toHaveLength(1);
    expect(prisma.escalation.findMany).toHaveBeenCalledWith({
      where: { grievanceId: 'grv-1' },
      orderBy: { escalatedAt: 'desc' },
    });
  });

  it('returns an empty array when the grievance has no escalations', async () => {
    vi.mocked(prisma.escalation.findMany).mockResolvedValueOnce([]);

    const escalations = await getEscalationsByGrievanceId('grv-missing');

    expect(escalations).toEqual([]);
  });
});

describe('getEscalationsForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scopes CITIZEN to escalations of grievances they own', async () => {
    vi.mocked(prisma.escalation.findMany).mockResolvedValueOnce([sampleEscalation] as any);

    const escalations = await getEscalationsForUser({
      userId: 'citizen-1',
      role: 'CITIZEN',
      departmentId: null,
    });

    expect(escalations).toHaveLength(1);
    expect(prisma.escalation.findMany).toHaveBeenCalledWith({
      where: { grievance: { citizenId: 'citizen-1' } },
      orderBy: { escalatedAt: 'desc' },
    });
  });

  it('scopes OFFICER to their own department', async () => {
    vi.mocked(prisma.escalation.findMany).mockResolvedValueOnce([sampleEscalation] as any);

    const escalations = await getEscalationsForUser({
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });

    expect(escalations).toHaveLength(1);
    expect(prisma.escalation.findMany).toHaveBeenCalledWith({
      where: { grievance: { departmentId: 'dept-1' } },
      orderBy: { escalatedAt: 'desc' },
    });
  });

  it('scopes DEPARTMENT_ADMIN to their own department', async () => {
    vi.mocked(prisma.escalation.findMany).mockResolvedValueOnce([] as any);

    const escalations = await getEscalationsForUser({
      userId: 'dept-admin-1',
      role: 'DEPARTMENT_ADMIN',
      departmentId: 'dept-1',
    });

    expect(escalations).toEqual([]);
    expect(prisma.escalation.findMany).toHaveBeenCalledWith({
      where: { grievance: { departmentId: 'dept-1' } },
      orderBy: { escalatedAt: 'desc' },
    });
  });

  it('returns an empty list for OFFICER without a department (no prisma call)', async () => {
    const escalations = await getEscalationsForUser({
      userId: 'officer-2',
      role: 'OFFICER',
      departmentId: null,
    });

    expect(escalations).toEqual([]);
    expect(prisma.escalation.findMany).not.toHaveBeenCalled();
  });

  it('returns all escalations for SUPER_ADMIN without a where scope', async () => {
    vi.mocked(prisma.escalation.findMany).mockResolvedValueOnce([sampleEscalation] as any);

    const escalations = await getEscalationsForUser({
      userId: 'admin-1',
      role: 'SUPER_ADMIN',
      departmentId: null,
    });

    expect(escalations).toHaveLength(1);
    expect(prisma.escalation.findMany).toHaveBeenCalledWith({
      orderBy: { escalatedAt: 'desc' },
    });
  });
});

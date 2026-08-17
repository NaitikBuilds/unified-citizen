import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSlaByGrievanceId,
  getSlasForUser,
} from './sla.service.js';
import { prisma } from './prisma.service.js';

// Mock Prisma (same pattern as subresource-auth.test.ts).
vi.mock('./prisma.service.js', () => ({
  prisma: {
    sLA: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const sampleSla = {
  id: 'sla-1',
  grievanceId: 'grv-1',
  departmentId: 'dept-1',
  status: 'ACTIVE',
};

describe('getSlaByGrievanceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the SLA for an existing grievance', async () => {
    vi.mocked(prisma.sLA.findUnique).mockResolvedValueOnce(sampleSla as any);

    const sla = await getSlaByGrievanceId('grv-1');

    expect(sla).toEqual(sampleSla);
    expect(prisma.sLA.findUnique).toHaveBeenCalledWith({
      where: { grievanceId: 'grv-1' },
    });
  });

  it('returns null when the grievance has no SLA yet', async () => {
    vi.mocked(prisma.sLA.findUnique).mockResolvedValueOnce(null);

    const sla = await getSlaByGrievanceId('grv-missing');

    expect(sla).toBeNull();
  });
});

describe('getSlasForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scopes CITIZEN to SLAs of grievances they own', async () => {
    vi.mocked(prisma.sLA.findMany).mockResolvedValueOnce([sampleSla] as any);

    const slas = await getSlasForUser({
      userId: 'citizen-1',
      role: 'CITIZEN',
      departmentId: null,
    });

    expect(slas).toHaveLength(1);
    expect(prisma.sLA.findMany).toHaveBeenCalledWith({
      where: { grievance: { citizenId: 'citizen-1' } },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('scopes OFFICER to their own department', async () => {
    vi.mocked(prisma.sLA.findMany).mockResolvedValueOnce([sampleSla] as any);

    const slas = await getSlasForUser({
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });

    expect(slas).toHaveLength(1);
    expect(prisma.sLA.findMany).toHaveBeenCalledWith({
      where: { departmentId: 'dept-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('scopes DEPARTMENT_ADMIN to their own department', async () => {
    vi.mocked(prisma.sLA.findMany).mockResolvedValueOnce([] as any);

    const slas = await getSlasForUser({
      userId: 'dept-admin-1',
      role: 'DEPARTMENT_ADMIN',
      departmentId: 'dept-1',
    });

    expect(slas).toEqual([]);
    expect(prisma.sLA.findMany).toHaveBeenCalledWith({
      where: { departmentId: 'dept-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns an empty list for OFFICER without a department (no prisma call)', async () => {
    const slas = await getSlasForUser({
      userId: 'officer-2',
      role: 'OFFICER',
      departmentId: null,
    });

    expect(slas).toEqual([]);
    expect(prisma.sLA.findMany).not.toHaveBeenCalled();
  });

  it('returns all SLAs for SUPER_ADMIN without a where scope', async () => {
    vi.mocked(prisma.sLA.findMany).mockResolvedValueOnce([sampleSla] as any);

    const slas = await getSlasForUser({
      userId: 'admin-1',
      role: 'SUPER_ADMIN',
      departmentId: null,
    });

    expect(slas).toHaveLength(1);
    expect(prisma.sLA.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });
});

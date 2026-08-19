import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSlaByGrievanceId,
  getSlasForUser,
  createSLAForGrievance,
} from './sla.service.js';
import { prisma } from './prisma.service.js';

// Mock Prisma for read operations
vi.mock('./prisma.service.js', () => ({
  prisma: {
    sLA: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

function makeTx() {
  return {
    sLAPolicy: { findFirst: vi.fn() },
    sLA: { create: vi.fn().mockResolvedValue({ id: 'sla-1' }) },
  };
}

const sampleSla = {
  id: 'sla-1',
  grievanceId: 'grv-1',
  departmentId: 'dept-1',
  status: 'ACTIVE',
};

describe('createSLAForGrievance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null without a department and never queries the policy store', async () => {
    const tx = makeTx();
    expect(await createSLAForGrievance('g-1', null, 'HIGH', tx)).toBeNull();
    expect(tx.sLAPolicy.findFirst).not.toHaveBeenCalled();
    expect(tx.sLA.create).not.toHaveBeenCalled();
  });

  it('returns null when departmentId is undefined', async () => {
    const tx = makeTx();
    expect(await createSLAForGrievance('g-1', undefined, 'HIGH', tx)).toBeNull();
    expect(tx.sLAPolicy.findFirst).not.toHaveBeenCalled();
  });

  it('creates the SLA from the department+priority policy, scoped to the department', async () => {
    const tx = makeTx();
    tx.sLAPolicy.findFirst.mockResolvedValueOnce({
      id: 'policy-1',
      responseTimeHours: 8,
      resolutionTimeHours: 48,
    });

    await createSLAForGrievance('g-1', 'dept-1', 'HIGH', tx);

    // The policy lookup must always be scoped to the grievance's department.
    expect(tx.sLAPolicy.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          departmentId: 'dept-1',
          priority: 'HIGH',
          isActive: true,
        }),
      }),
    );

    expect(tx.sLA.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          grievanceId: 'g-1',
          departmentId: 'dept-1',
          policyId: 'policy-1',
          responseTimeHours: 8,
          resolutionTimeHours: 48,
          status: 'ACTIVE',
        }),
      }),
    );
  });

  it('falls back to the department default policy when no priority policy exists', async () => {
    const tx = makeTx();
    tx.sLAPolicy.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'default-policy',
        responseTimeHours: 24,
        resolutionTimeHours: 72,
      });

    await createSLAForGrievance('g-1', 'dept-1', 'LOW', tx);

    expect(tx.sLAPolicy.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          departmentId: 'dept-1',
          priority: null,
          isActive: true,
        }),
      }),
    );
    expect(tx.sLA.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ policyId: 'default-policy' }),
      }),
    );
  });

  it('uses default hours and a null policyId when no policy exists', async () => {
    const tx = makeTx();
    tx.sLAPolicy.findFirst.mockResolvedValue(null);

    await createSLAForGrievance('g-1', 'dept-1', 'MEDIUM', tx);

    const data = (tx.sLA.create as any).mock.calls[0][0].data;
    expect(data.policyId).toBeNull();
    expect(data.responseTimeHours).toBe(24);
    expect(data.resolutionTimeHours).toBe(72);
    // Deadlines must be in the future and proportional to the configured hours.
    expect(data.responseDueAt.getTime()).toBeGreaterThan(Date.now());
    expect(data.resolutionDueAt.getTime()).toBeGreaterThan(data.responseDueAt.getTime());
  });
});

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

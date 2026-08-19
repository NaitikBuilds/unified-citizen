import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAuditLogsByGrievanceId,
  getAuditLogsForUser,
} from './audit.service.js';
import { prisma } from './prisma.service.js';

// Mock Prisma (same pattern as escalation.service.test.ts).
vi.mock('./prisma.service.js', () => ({
  prisma: {
    auditLog: {
      findMany: vi.fn(),
    },
  },
}));

const sampleAuditLog = {
  id: 'audit-1',
  userId: 'citizen-1',
  user: { id: 'citizen-1', name: 'Meera Joshi' },
  grievanceId: 'grv-1',
  grievance: { id: 'grv-1', ticketId: 'GRV-1001', title: 'Pothole on Main Road' },
  action: 'CREATE_GRIEVANCE',
  oldValue: null,
  newValue: { title: 'Pothole on Main Road' },
  metadata: null,
  createdAt: new Date('2026-01-01'),
};

describe('getAuditLogsByGrievanceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns audit logs for an existing grievance', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([sampleAuditLog] as any);

    const logs = await getAuditLogsByGrievanceId('grv-1');

    expect(logs).toHaveLength(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { grievanceId: 'grv-1' },
      include: {
        user: { select: { id: true, name: true } },
        grievance: { select: { id: true, ticketId: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns an empty array when the grievance has no audit logs', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([]);

    const logs = await getAuditLogsByGrievanceId('grv-missing');

    expect(logs).toEqual([]);
  });
});

describe('getAuditLogsForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('scopes CITIZEN to audit logs of grievances they own', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([sampleAuditLog] as any);

    const logs = await getAuditLogsForUser({
      userId: 'citizen-1',
      role: 'CITIZEN',
      departmentId: null,
    });

    expect(logs).toHaveLength(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { grievance: { citizenId: 'citizen-1' } },
      include: {
        user: { select: { id: true, name: true } },
        grievance: { select: { id: true, ticketId: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('scopes OFFICER to their own department', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([sampleAuditLog] as any);

    const logs = await getAuditLogsForUser({
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });

    expect(logs).toHaveLength(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { grievance: { departmentId: 'dept-1' } },
      include: {
        user: { select: { id: true, name: true } },
        grievance: { select: { id: true, ticketId: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('scopes DEPARTMENT_ADMIN to their own department', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([] as any);

    const logs = await getAuditLogsForUser({
      userId: 'dept-admin-1',
      role: 'DEPARTMENT_ADMIN',
      departmentId: 'dept-1',
    });

    expect(logs).toEqual([]);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { grievance: { departmentId: 'dept-1' } },
      include: {
        user: { select: { id: true, name: true } },
        grievance: { select: { id: true, ticketId: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns an empty list for OFFICER without a department (no prisma call)', async () => {
    const logs = await getAuditLogsForUser({
      userId: 'officer-2',
      role: 'OFFICER',
      departmentId: null,
    });

    expect(logs).toEqual([]);
    expect(prisma.auditLog.findMany).not.toHaveBeenCalled();
  });

  it('returns all audit logs for SUPER_ADMIN without a where scope', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([sampleAuditLog] as any);

    const logs = await getAuditLogsForUser({
      userId: 'admin-1',
      role: 'SUPER_ADMIN',
      departmentId: null,
    });

    expect(logs).toHaveLength(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      include: {
        user: { select: { id: true, name: true } },
        grievance: { select: { id: true, ticketId: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});

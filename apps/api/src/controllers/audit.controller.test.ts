import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuditLogsByGrievance, listAuditLogs } from './audit.controller.js';
import { prisma } from '../services/prisma.service.js';
import * as subresourceAuth from '../services/subresource-auth.service.js';
import * as auditService from '../services/audit.service.js';
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

// Mock all external dependencies.
vi.mock('../services/prisma.service.js', () => ({
  prisma: {
    grievance: { findUnique: vi.fn() },
  },
}));

vi.mock('../services/subresource-auth.service.js', () => ({
  canAccessGrievanceSubResource: vi.fn(),
}));

vi.mock('../services/audit.service.js', () => ({
  getAuditLogsByGrievanceId: vi.fn(),
  getAuditLogsForUser: vi.fn(),
}));

const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response & { status: any; json: any };
};

const mockNext = vi.fn() as NextFunction;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Per-grievance endpoint: GET /:grievanceId ───────────────────────

describe('GET /audit-logs/:grievanceId', () => {
  const baseReq = (overrides?: Partial<AuthenticatedRequest>) =>
    ({
      params: { grievanceId: 'grv-1' },
      user: { userId: 'citizen-1', role: 'CITIZEN', departmentId: null },
      ...overrides,
    }) as unknown as AuthenticatedRequest;

  it('returns 404 for a nonexistent grievance', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce(null);

    const res = mockRes();
    await getAuditLogsByGrievance(baseReq(), res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Grievance not found' });
    // Must not reach authorization or service layer.
    expect(subresourceAuth.canAccessGrievanceSubResource).not.toHaveBeenCalled();
    expect(auditService.getAuditLogsByGrievanceId).not.toHaveBeenCalled();
  });

  it('returns 403 when citizen accesses another citizen\'s grievance', async () => {
    // Grievance exists but belongs to a different citizen.
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({ id: 'grv-1' } as any);
    vi.mocked(subresourceAuth.canAccessGrievanceSubResource).mockResolvedValueOnce(false);

    const res = mockRes();
    await getAuditLogsByGrievance(baseReq(), res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(auditService.getAuditLogsByGrievanceId).not.toHaveBeenCalled();
  });

  it('returns 403 when officer accesses a grievance from another department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({ id: 'grv-1' } as any);
    vi.mocked(subresourceAuth.canAccessGrievanceSubResource).mockResolvedValueOnce(false);

    const res = mockRes();
    const req = baseReq({
      user: { userId: 'officer-1', role: 'OFFICER', departmentId: 'dept-1' },
    } as any);
    await getAuditLogsByGrievance(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
  });

  it('returns 200 with empty array when authorized but no audit logs exist', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({ id: 'grv-1' } as any);
    vi.mocked(subresourceAuth.canAccessGrievanceSubResource).mockResolvedValueOnce(true);
    vi.mocked(auditService.getAuditLogsByGrievanceId).mockResolvedValueOnce([]);

    const res = mockRes();
    await getAuditLogsByGrievance(baseReq(), res, mockNext);

    expect(res.json).toHaveBeenCalledWith({ auditLogs: [] });
  });

  it('returns 200 with audit logs for authorized citizen on their own grievance', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({ id: 'grv-1' } as any);
    vi.mocked(subresourceAuth.canAccessGrievanceSubResource).mockResolvedValueOnce(true);
    const fakeLog = [{ id: 'audit-1', action: 'CREATE_GRIEVANCE' }];
    vi.mocked(auditService.getAuditLogsByGrievanceId).mockResolvedValueOnce(fakeLog as any);

    const res = mockRes();
    await getAuditLogsByGrievance(baseReq(), res, mockNext);

    expect(res.json).toHaveBeenCalledWith({ auditLogs: fakeLog });
  });
});

// ─── Collection endpoint: GET / ──────────────────────────────────────

describe('GET /audit-logs', () => {
  const baseReq = (userOverrides?: Partial<{ userId: string; role: string; departmentId: string | null }>) =>
    ({
      query: {},
      user: { userId: 'citizen-1', role: 'CITIZEN', departmentId: null, ...userOverrides },
    }) as unknown as AuthenticatedRequest;

  it('returns only citizen-scoped audit logs (prevents collection IDOR)', async () => {
    const citizenLogs = [{ id: 'audit-1', grievanceId: 'grv-own' }];
    vi.mocked(auditService.getAuditLogsForUser).mockResolvedValueOnce(citizenLogs as any);

    const res = mockRes();
    await listAuditLogs(baseReq(), res, mockNext);

    // The service was called with the authenticated user's context only.
    expect(auditService.getAuditLogsForUser).toHaveBeenCalledWith({
      userId: 'citizen-1',
      role: 'CITIZEN',
      departmentId: null,
    });
    expect(res.json).toHaveBeenCalledWith({ auditLogs: citizenLogs });
  });

  it('returns only department-scoped audit logs for officer (prevents cross-department IDOR)', async () => {
    const deptLogs = [{ id: 'audit-2', grievanceId: 'grv-dept' }];
    vi.mocked(auditService.getAuditLogsForUser).mockResolvedValueOnce(deptLogs as any);

    const res = mockRes();
    await listAuditLogs(baseReq({ userId: 'officer-1', role: 'OFFICER', departmentId: 'dept-1' }), res, mockNext);

    expect(auditService.getAuditLogsForUser).toHaveBeenCalledWith({
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });
    expect(res.json).toHaveBeenCalledWith({ auditLogs: deptLogs });
  });

  it('returns empty array for officer without departmentId (no unrestricted query)', async () => {
    vi.mocked(auditService.getAuditLogsForUser).mockResolvedValueOnce([]);

    const res = mockRes();
    await listAuditLogs(baseReq({ userId: 'officer-no-dept', role: 'OFFICER', departmentId: null }), res, mockNext);

    expect(auditService.getAuditLogsForUser).toHaveBeenCalledWith({
      userId: 'officer-no-dept',
      role: 'OFFICER',
      departmentId: null,
    });
    expect(res.json).toHaveBeenCalledWith({ auditLogs: [] });
  });

  it('applies action filter via exact string matching', async () => {
    const logs = [
      { id: 'audit-1', action: 'CREATE_GRIEVANCE' },
      { id: 'audit-2', action: 'UPDATE_STATUS' },
      { id: 'audit-3', action: 'CREATE_GRIEVANCE' },
    ];
    vi.mocked(auditService.getAuditLogsForUser).mockResolvedValueOnce(logs as any);

    const res = mockRes();
    const req = baseReq();
    (req as any).query = { action: 'CREATE_GRIEVANCE' };
    await listAuditLogs(req, res, mockNext);

    expect(res.json).toHaveBeenCalledWith({
      auditLogs: [
        { id: 'audit-1', action: 'CREATE_GRIEVANCE' },
        { id: 'audit-3', action: 'CREATE_GRIEVANCE' },
      ],
    });
  });

  it('SUPER_ADMIN receives unrestricted results', async () => {
    const allLogs = [{ id: 'audit-1' }, { id: 'audit-2' }];
    vi.mocked(auditService.getAuditLogsForUser).mockResolvedValueOnce(allLogs as any);

    const res = mockRes();
    await listAuditLogs(baseReq({ userId: 'admin-1', role: 'SUPER_ADMIN', departmentId: null }), res, mockNext);

    expect(auditService.getAuditLogsForUser).toHaveBeenCalledWith({
      userId: 'admin-1',
      role: 'SUPER_ADMIN',
      departmentId: null,
    });
    expect(res.json).toHaveBeenCalledWith({ auditLogs: allLogs });
  });
});

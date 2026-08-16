import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccessGrievanceSubResource } from './subresource-auth.service.js';
import { prisma } from './prisma.service.js';

// Mock Prisma
vi.mock('./prisma.service.js', () => ({
  prisma: {
    grievance: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Sub-Resource Authorization Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows SUPER_ADMIN to access any sub-resource', async () => {
    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'admin-1',
      role: 'SUPER_ADMIN',
      departmentId: null,
    });

    expect(allowed).toBe(true);
    expect(prisma.grievance.findUnique).not.toHaveBeenCalled();
  });

  it('allows CITIZEN to access their own grievance sub-resource', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-1',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'citizen-1',
      role: 'CITIZEN',
      departmentId: null,
    });

    expect(allowed).toBe(true);
  });

  it('denies CITIZEN access to someone else’s grievance sub-resource', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'citizen-1',
      role: 'CITIZEN',
      departmentId: null,
    });

    expect(allowed).toBe(false);
  });

  it('allows OFFICER to access a grievance in their department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });

    expect(allowed).toBe(true);
  });

  it('denies OFFICER access to a grievance in another department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-2',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });

    expect(allowed).toBe(false);
  });

  it('denies OFFICER access when the officer has no department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: null,
    });

    expect(allowed).toBe(false);
  });

  it('allows DEPARTMENT_ADMIN access to a grievance in their department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'dept-admin-1',
      role: 'DEPARTMENT_ADMIN',
      departmentId: 'dept-1',
    });

    expect(allowed).toBe(true);
  });

  it('denies DEPARTMENT_ADMIN access to a grievance in another department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-2',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'dept-admin-1',
      role: 'DEPARTMENT_ADMIN',
      departmentId: 'dept-1',
    });

    expect(allowed).toBe(false);
  });

  it('denies DEPARTMENT_ADMIN access when the admin has no department', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'dept-admin-1',
      role: 'DEPARTMENT_ADMIN',
      departmentId: null,
    });

    expect(allowed).toBe(false);
  });

  it('denies access to a nonexistent grievance for non-SUPER_ADMIN roles', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce(null);

    const allowed = await canAccessGrievanceSubResource('missing', {
      userId: 'officer-1',
      role: 'OFFICER',
      departmentId: 'dept-1',
    });

    expect(allowed).toBe(false);
  });

  it('returns false for unknown roles', async () => {
    vi.mocked(prisma.grievance.findUnique).mockResolvedValueOnce({
      citizenId: 'citizen-2',
      departmentId: 'dept-1',
    } as any);

    const allowed = await canAccessGrievanceSubResource('grv-123', {
      userId: 'user-1',
      role: 'UNKNOWN_ROLE',
      departmentId: null,
    });

    expect(allowed).toBe(false);
  });
});
import { prisma } from './prisma.service.js';
import { createAuditLog } from './audit.service.js';

interface FindGrievancesParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  departmentId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  user: {
    userId: string;
    role: string;
    departmentId: string | null;
  };
}

export async function findGrievances(params: FindGrievancesParams) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  // 1. RBAC & Scope Enforcement at the query level
  if (params.user.role === 'CITIZEN') {
    whereClause.citizenId = params.user.userId;
  } else if (params.user.role === 'OFFICER' || params.user.role === 'DEPARTMENT_ADMIN') {
    if (!params.user.departmentId) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }
    whereClause.departmentId = params.user.departmentId;
  }

  // 2. Filters
  if (params.status) whereClause.status = params.status;
  if (params.priority) whereClause.priority = params.priority;
  if (params.category) whereClause.category = params.category;
  if (params.departmentId && params.user.role === 'SUPER_ADMIN') {
    whereClause.departmentId = params.departmentId;
  }

  if (params.search) {
    whereClause.OR = [
      { category: { contains: params.search, mode: 'insensitive' } },
      { id: { contains: params.search, mode: 'insensitive' } },
      { title: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  const [data, total] = await Promise.all([
    prisma.grievance.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        assignments: true,
        aiClassification: true,
        sla: true,
      },
    }),
    prisma.grievance.count({ where: whereClause }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createGrievance(data: {
  citizenId: string;
  title: string;
  description: string;
  departmentId?: string;
  category?: string;
  priority?: string;
}) {
  // Generate a unique ticket ID (e.g., TCK-timestamp-random)
  const ticketId = `TCK-${Date.now().toString().slice(-6)}`;

  const grievance = await prisma.grievance.create({
    data: {
      ticketId,
      title: data.title,
      description: data.description,
      citizenId: data.citizenId,
      departmentId: data.departmentId || null,
      category: data.category || null,
      priority: (data.priority || 'MEDIUM') as any,
      status: 'SUBMITTED',
    },
  });

  await createAuditLog({
    userId: data.citizenId,
    grievanceId: grievance.id,
    action: 'GRIEVANCE_CREATED',
    newValue: grievance.status,
  });

  return grievance;
}
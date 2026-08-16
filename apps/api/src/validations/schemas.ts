import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name is required'),
    // Note: Public registration strictly ignores role/department per point #3
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    departmentId: z.string().optional(),
  }),
});

export const updateGrievanceStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'REOPENED', 'ESCALATED']),
    comment: z.string().optional(),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Comment message cannot be empty'),
    isInternal: z.boolean().optional(),
  }),
});

export const createAssignmentSchema = z.object({
  body: z.object({
    officerId: z.string().min(1, 'Officer ID is required'),
    departmentId: z.string().min(1, 'Department ID is required'),
    reason: z.string().optional(),
  }),
});

export const createFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().optional(),
  }),
});

export const createEscalationSchema = z.object({
  body: z.object({
    level: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADMIN']),
    reason: z.string().min(3, 'Escalation reason is required'),
  }),
});
import { z } from 'zod';

export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    category: z.string().min(1, 'Category is required'),
    // Fixed: Changed 'URGENT' to 'CRITICAL' to match Prisma enum
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    // Fixed: Changed .uuid() to .cuid() to match Prisma CUID IDs
    departmentId: z.string().cuid('Invalid department ID format').optional(),
    isAnonymous: z.boolean().optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateGrievanceStatusSchema = z.object({
  params: z.object({
    // Fixed: Changed .uuid() to .cuid()
    id: z.string().cuid('Invalid grievance ID format'),
  }),
  body: z.object({
    // Note: Ensure these statuses match your exact Prisma GrievanceStatus enum. 
    // If 'UNDER_REVIEW' is not in Prisma, remove it from this enum list.
    status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'REOPENED', 'ESCALATED']),
    comment: z.string().optional(),
  }),
});

export const assignGrievanceSchema = z.object({
  params: z.object({
    // Fixed: Changed .uuid() to .cuid()
    id: z.string().cuid('Invalid grievance ID format'),
  }),
  body: z.object({
    // Fixed: Changed .uuid() to .cuid()
    officerId: z.string().cuid('Invalid officer ID format'),
    departmentId: z.string().cuid('Invalid department ID format'),
    reason: z.string().optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    // Fixed: Changed .uuid() to .cuid()
    id: z.string().cuid('Invalid grievance ID format'),
  }),
  body: z.object({
    message: z.string().min(1, 'Comment message cannot be empty'),
    isInternal: z.boolean().optional(),
  }),
});

export const addFeedbackSchema = z.object({
  params: z.object({
    // Fixed: Changed .uuid() to .cuid()
    id: z.string().cuid('Invalid grievance ID format'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    // Note: Prisma feedback model expects 'comment' field, which is correctly matched here!
    comment: z.string().optional(),
  }),
});
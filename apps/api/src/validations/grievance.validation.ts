import { z } from "zod";

// Prisma models use cuid() primary keys (e.g. cmsrzow3w000azgft4wvilxuy).
// All ID validations must accept CUIDs, not UUIDs.

export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    category: z.string().min(1, "Category is required"),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .optional(),
    departmentId: z.cuid("Invalid department ID format").optional(),
    isAnonymous: z.boolean().optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateGrievanceStatusSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    status: z.enum([
      "SUBMITTED",
      "AI_CLASSIFIED",
      "ASSIGNED",
      "IN_PROGRESS",
      "ESCALATED",
      "RESOLVED",
      "REJECTED",
      "REOPENED",
    ]),
    comment: z.string().optional(),
  }),
});

export const assignGrievanceSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    officerId: z.cuid("Invalid officer ID format"),
    // The controller derives the assignment department from the grievance
    // itself, so a client-supplied departmentId is not required.
    departmentId: z.cuid("Invalid department ID format").optional(),
    reason: z.string().optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    message: z
      .string()
      .min(1, "Comment message cannot be empty")
      .max(2000, "Comment must be at most 2000 characters"),
    isInternal: z.boolean().optional(),
  }),
});

export const grievanceCommentsQuerySchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const addFeedbackSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z.string().optional(),
  }),
});

export const escalateGrievanceSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    level: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "ADMIN"]),
    reason: z.string().min(3, "Escalation reason must be at least 3 characters long"),
  }),
});

export const grievanceIdParamSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
});

export const attachmentDownloadSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
    attachmentId: z.cuid("Invalid attachment ID format"),
  }),
});

export const updateGrievanceSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .optional(),
    category: z.string().min(1, "Category is required").optional(),
    departmentId: z.cuid("Invalid department ID format").optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    address: z.string().optional(),
  }),
});

export const reopenGrievanceSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid grievance ID format"),
  }),
  body: z.object({
    reason: z.string().max(1000).optional(),
  }),
});

export const listGrievancesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const analyzeGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    category: z.string().min(1).optional(),
  }),
});

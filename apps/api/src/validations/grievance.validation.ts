import { z } from "zod";

export const createGrievanceSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    category: z.string().min(1, "Category is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    departmentId: z.string().uuid("Invalid department ID format").optional(),
    isAnonymous: z.boolean().optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateGrievanceStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid grievance ID format"),
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
    id: z.string().uuid("Invalid grievance ID format"),
  }),
  body: z.object({
    officerId: z.string().uuid("Invalid officer ID format"),
    departmentId: z.string().uuid("Invalid department ID format"),
    reason: z.string().optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid grievance ID format"),
  }),
  body: z.object({
    message: z.string().min(1, "Comment message cannot be empty"),
    isInternal: z.boolean().optional(),
  }),
});

export const addFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid grievance ID format"),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    comment: z.string().optional(),
  }),
});

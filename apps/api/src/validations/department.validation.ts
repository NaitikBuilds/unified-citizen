import { z } from "zod";

// Prisma models use cuid() primary keys.

export const departmentIdParamSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid department ID format"),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Department name is required").max(100),
    code: z.string().min(1).max(20).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid department ID format"),
  }),
  body: z
    .object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).nullable().optional(),
    })
    .refine((data) => data.name !== undefined || data.description !== undefined, {
      message: "At least one of name or description is required",
    }),
});

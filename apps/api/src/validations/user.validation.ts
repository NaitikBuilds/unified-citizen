import { z } from "zod";

// Prisma models use cuid() primary keys.

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").max(100),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid user ID format"),
  }),
});

export const updateUserRoleOrDeptSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid user ID format"),
  }),
  body: z
    .object({
      role: z
        .enum(["CITIZEN", "OFFICER", "DEPARTMENT_ADMIN", "SUPER_ADMIN"])
        .optional(),
      departmentId: z
        .union([z.cuid("Invalid department ID format"), z.null()])
        .optional(),
    })
    .refine(
      (data) => data.role !== undefined || data.departmentId !== undefined,
      {
        message: "At least one of role or departmentId is required",
      },
    ),
});

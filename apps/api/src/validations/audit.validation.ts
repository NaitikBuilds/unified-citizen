import { z } from "zod";

/**
 * Audit read validation schemas.
 *
 * NOTE: grievance param validation uses a bounded non-empty string rather than
 * `z.string().uuid()`. Prisma primary keys are `@default(cuid())` (see
 * prisma/schema.prisma), so UUID validation would reject every real grievance
 * id — the existing write-route schemas carry that latent mismatch. Read
 * routes (e.g. GET /grievances/:id) perform no param validation at all; a
 * bounded string keeps malformed input rejected while accepting real ids.
 */
export const getAuditLogsByGrievanceSchema = z.object({
  params: z.object({
    grievanceId: z
      .string()
      .min(1, "Grievance ID is required")
      .max(64, "Invalid grievance ID format"),
  }),
});

export const listAuditLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    action: z.string().min(1).max(128).optional(),
    grievanceId: z.string().min(1).max(64).optional(),
  }),
});

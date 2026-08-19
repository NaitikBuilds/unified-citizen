import { z } from "zod";

export const analyticsQuerySchema = z.object({
  query: z
    .object({
      departmentId: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>["query"];

import { z } from "zod";

export const aiClassificationSchema = z.object({
  category: z.string().min(1),
  department: z.string().min(1),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),

  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),

  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"]),

  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  explanation: z.string().min(1),
});

export type AIClassificationOutput = z.infer<typeof aiClassificationSchema>;

import { z } from "zod";

export const spamDetectionSchema = z.object({
  isSpam: z.boolean(),

  spamScore: z.number().min(0).max(1),

  confidence: z.number().min(0).max(1),

  reason: z.string().min(1),
});

export type SpamDetectionOutput = z.infer<typeof spamDetectionSchema>;

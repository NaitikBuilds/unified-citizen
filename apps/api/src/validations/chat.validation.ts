import { z } from "zod";

export const chatMessageSchema = z.object({
  body: z.object({
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .max(2000, "Message must be at most 2000 characters"),
  }),
});

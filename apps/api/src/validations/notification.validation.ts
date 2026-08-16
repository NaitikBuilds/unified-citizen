import { z } from "zod";

// Prisma models use cuid() primary keys.
export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.cuid("Invalid notification ID format"),
  }),
});

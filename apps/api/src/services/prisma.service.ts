import { PrismaClient } from '../generated/prisma/client.js';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new (PrismaClient as any)();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
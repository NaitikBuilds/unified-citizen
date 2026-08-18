import "dotenv/config";
import { prisma } from "./../services/prisma.service.js";

const grievances = await prisma.grievance.findMany({
  where: {
    citizenId: "cmsy9fix40000tcmqzkwxqzzl",
  },
  select: {
    ticketId: true,
    title: true,
    category: true,
    status: true,
    priority: true,
    department: {
      select: {
        name: true,
        code: true,
      },
    },
    createdAt: true,
    resolvedAt: true,
  },
});

console.log(JSON.stringify(grievances, null, 2));

await prisma.$disconnect();

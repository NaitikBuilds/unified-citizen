import { prisma } from "../../services/prisma.service.js";

export async function getCitizenContext(citizenId: string): Promise<string> {
  const grievances = await prisma.grievance.findMany({
    where: {
      citizenId,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  if (grievances.length === 0) {
    return "The citizen has no grievances recorded in the system.";
  }

  return grievances
    .map(
      (grievance) => `
Ticket ID: ${grievance.ticketId}
Title: ${grievance.title}
Category: ${grievance.category ?? "Not specified"}
Status: ${grievance.status}
Priority: ${grievance.priority}
Department: ${grievance.department?.name ?? "Not assigned"} (${grievance.department?.code ?? "N/A"})
Created: ${grievance.createdAt.toISOString()}
Resolved: ${grievance.resolvedAt?.toISOString() ?? "Not resolved"}
`,
    )
    .join("\n---\n");
}

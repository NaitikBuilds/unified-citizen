import { prisma } from "./prisma.service.js";

interface UserContext {
  userId: string;
  role: string;
  departmentId: string | null;
}

export async function canAccessGrievanceSubResource(
  grievanceId: string,
  user: UserContext,
): Promise<boolean> {
  // SUPER_ADMIN has system-wide access and requires no database lookup.
  if (user.role === "SUPER_ADMIN") {
    return true;
  }

  const grievance = await prisma.grievance.findUnique({
    where: { id: grievanceId },
    select: {
      citizenId: true,
      departmentId: true,
    },
  });

  if (!grievance) {
    return false;
  }

  if (user.role === "CITIZEN") {
    return grievance.citizenId === user.userId;
  }

  if (user.role === "OFFICER" || user.role === "DEPARTMENT_ADMIN") {
    return (
      user.departmentId !== null &&
      grievance.departmentId !== null &&
      grievance.departmentId === user.departmentId
    );
  }

  return false;
}

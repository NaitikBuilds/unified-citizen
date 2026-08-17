import { GrievanceStatus } from "../generated/prisma/client.js";

const allowedTransitions: Record<GrievanceStatus, GrievanceStatus[]> = {
  SUBMITTED: ["AI_CLASSIFIED", "ASSIGNED", "IN_PROGRESS"],
  AI_CLASSIFIED: ["ASSIGNED", "IN_PROGRESS", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED", "ESCALATED"],
  ESCALATED: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["REOPENED"],
  REJECTED: [],
  REOPENED: ["IN_PROGRESS"],
};

export function canTransitionGrievanceStatus(
  currentStatus: GrievanceStatus,
  nextStatus: GrievanceStatus,
): boolean {
  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

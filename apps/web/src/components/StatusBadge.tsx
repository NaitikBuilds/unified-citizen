import type { GrievanceStatus } from "../types";

const statusConfig: Record<GrievanceStatus, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "badge-info" },
  AI_CLASSIFIED: { label: "AI Classified", className: "badge-accent" },
  ASSIGNED: { label: "Assigned", className: "badge-primary" },
  IN_PROGRESS: { label: "In Progress", className: "badge-warning" },
  ESCALATED: { label: "Escalated", className: "badge-error" },
  RESOLVED: { label: "Resolved", className: "badge-success" },
  REJECTED: { label: "Rejected", className: "badge-error" },
  REOPENED: { label: "Reopened", className: "badge-warning" },
};

export default function StatusBadge({ status }: { status: GrievanceStatus }) {
  const config = statusConfig[status] || { label: status, className: "badge-ghost" };
  return <span className={`badge ${config.className} badge-lg`}>{config.label}</span>;
}

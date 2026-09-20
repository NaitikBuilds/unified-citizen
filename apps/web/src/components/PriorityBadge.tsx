import type { GrievancePriority } from "../types";

const priorityConfig: Record<GrievancePriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "badge-success" },
  MEDIUM: { label: "Medium", className: "badge-warning" },
  HIGH: { label: "High", className: "badge-error" },
  CRITICAL: { label: "Critical", className: "badge-error badge-outline" },
};

export default function PriorityBadge({ priority }: { priority: GrievancePriority }) {
  const config = priorityConfig[priority] || { label: priority, className: "badge-ghost" };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

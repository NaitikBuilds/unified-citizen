import type { GrievanceStatus } from "../types";

// Vivid status colors: bright text shade, 18% tint background and a
// matching border so every status reads clearly as a colored chip.
const statusConfig: Record<
  GrievanceStatus,
  { label: string; color: string }
> = {
  SUBMITTED: { label: "Submitted", color: "#60a5fa" },   // blue
  AI_CLASSIFIED: { label: "AI Classified", color: "#a78bfa" }, // violet
  ASSIGNED: { label: "Assigned", color: "#22d3ee" },    // cyan
  IN_PROGRESS: { label: "In Progress", color: "#fbbf24" }, // amber
  ESCALATED: { label: "Escalated", color: "#f87171" },  // red
  RESOLVED: { label: "Resolved", color: "#4ade80" },    // green
  REJECTED: { label: "Rejected", color: "#fb7185" },    // rose
  REOPENED: { label: "Reopened", color: "#fb923c" },    // orange
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StatusBadge({ status }: { status: GrievanceStatus }) {
  const config = statusConfig[status] || {
    label: status,
    color: "#9ca3af",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-transform duration-150 hover:scale-105"
      style={{
        color: config.color,
        background: hexToRgba(config.color, 0.16),
        border: `1px solid ${hexToRgba(config.color, 0.4)}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: config.color,
          boxShadow: `0 0 6px ${hexToRgba(config.color, 0.8)}`,
        }}
      />
      {config.label}
    </span>
  );
}

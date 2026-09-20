import type { GrievancePriority } from "../types";

const priorityConfig: Record<GrievancePriority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "#4ade80" },      // green
  MEDIUM: { label: "Medium", color: "#facc15" }, // yellow
  HIGH: { label: "High", color: "#fb923c" },    // orange
  CRITICAL: { label: "Critical", color: "#f87171" }, // red
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function PriorityBadge({ priority }: { priority: GrievancePriority }) {
  const config = priorityConfig[priority] || {
    label: priority,
    color: "#9ca3af",
  };
  const isCritical = priority === "CRITICAL";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-transform duration-150 hover:scale-105 ${isCritical ? "animate-pulse" : ""}`}
      style={{
        color: config.color,
        background: hexToRgba(config.color, isCritical ? 0.2 : 0.16),
        border: `1px solid ${hexToRgba(config.color, isCritical ? 0.55 : 0.4)}`,
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

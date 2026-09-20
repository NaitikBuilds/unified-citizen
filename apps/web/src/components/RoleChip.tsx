import type { UserRole } from "../types";
import Chip from "./Chip";

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  CITIZEN: { label: "Citizen", color: "#60a5fa" },          // blue
  OFFICER: { label: "Officer", color: "#22d3ee" },          // cyan
  DEPARTMENT_ADMIN: { label: "Dept Admin", color: "#a78bfa" }, // violet
  SUPER_ADMIN: { label: "Super Admin", color: "#fbbf24" },  // amber
};

export default function RoleChip({ role }: { role: UserRole }) {
  const config = ROLE_CONFIG[role] || { label: role, color: "#9ca3af" };
  return <Chip label={config.label} color={config.color} />;
}

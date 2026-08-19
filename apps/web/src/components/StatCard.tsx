import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ icon, label, value, color = "primary" }: StatCardProps) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl bg-${color}/10 p-3 text-${color}`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold">{value}</div>
            <div className="text-sm text-base-content/60">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

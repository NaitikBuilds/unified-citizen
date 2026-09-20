import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl animate-fade-up"
      style={{ background: "#111", border: "1px dashed rgba(255,255,255,0.12)" }}
    >
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-grid-pattern"
          style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-gray-500">{icon}</span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1.5 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

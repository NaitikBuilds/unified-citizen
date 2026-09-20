import { AlertCircle } from "lucide-react";

export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-fade-up"
      style={{
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.25)",
      }}
    >
      <AlertCircle className="h-5 w-5 shrink-0" style={{ color: "#f87171" }} />
      <span className="text-sm font-medium" style={{ color: "#fca5a5" }}>
        {message}
      </span>
    </div>
  );
}

import { AlertCircle } from "lucide-react";

export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="alert alert-error">
      <AlertCircle className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}

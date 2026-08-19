export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-sm text-base-content/60">{text}</p>
    </div>
  );
}

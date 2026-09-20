export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-up">
      <div className="relative w-10 h-10">
        <span className="absolute inset-0 rounded-full border-2 border-white/10" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
      </div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

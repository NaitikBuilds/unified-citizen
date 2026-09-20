// Generic colored chip used by CategoryChip, RoleChip and department tags.

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FALLBACK_PALETTE = ["#94a3b8", "#7dd3fc", "#c4b5fd", "#fda4af", "#86efac", "#fcd34d"];

/** Stable pseudo-random palette color for an arbitrary string. */
export function stableColorFor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

interface ChipProps {
  label: string;
  color: string;
  withDot?: boolean;
}

export default function Chip({ label, color, withDot = true }: ChipProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-transform duration-150 hover:scale-105"
      style={{
        color,
        background: hexToRgba(color, 0.12),
        border: `1px solid ${hexToRgba(color, 0.3)}`,
      }}
    >
      {withDot && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}

import Chip, { stableColorFor } from "./Chip";

// Known civic categories get intuitive hues; anything else is hashed into a
// stable palette entry so the same category always renders the same color.
const CATEGORY_COLORS: Array<{ match: RegExp; color: string }> = [
  { match: /road|infrastructur|pothole|transport/i, color: "#fb923c" },   // orange
  { match: /water|drainage|sewage|pipe/i, color: "#22d3ee" },             // cyan
  { match: /electric|power|streetlight|light/i, color: "#facc15" },       // yellow
  { match: /sanitation|waste|garbage|clean/i, color: "#a3e635" },         // lime
  { match: /safety|security|police/i, color: "#f87171" },                 // red
  { match: /health|hospital|medical/i, color: "#fb7185" },                // rose
  { match: /education|school|college/i, color: "#a78bfa" },               // violet
  { match: /environment|park|tree|pollut/i, color: "#34d399" },           // emerald
  { match: /housing|property|building/i, color: "#fbbf24" },              // amber
  { match: /corrupt/i, color: "#e879f9" },                                // fuchsia
];

function colorFor(category: string): string {
  for (const entry of CATEGORY_COLORS) {
    if (entry.match.test(category)) return entry.color;
  }
  return stableColorFor(category);
}

interface CategoryChipProps {
  category?: string | null;
  fallback?: string;
}

export default function CategoryChip({ category, fallback = "—" }: CategoryChipProps) {
  if (!category) {
    return <span className="text-xs text-gray-600">{fallback}</span>;
  }
  return <Chip label={category} color={colorFor(category)} />;
}

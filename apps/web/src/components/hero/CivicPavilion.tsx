/**
 * Civic destination — a modern civic pavilion that anchors the settled
 * frame: podium, glazed hall with vertical fins, portico, wings and a
 * warm-lit entrance. Purely decorative (aria-hidden).
 */
export function CivicPavilion() {
  return (
    <svg
      viewBox="0 0 1000 560"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="pavilion-hall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#101b30" />
          <stop offset="1" stopColor="#0a1322" />
        </linearGradient>
        <linearGradient id="pavilion-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#18294a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0d1830" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* plaza + road */}
      <rect x="0" y="480" width="1000" height="80" fill="#05080f" />
      <rect x="0" y="516" width="1000" height="3" fill="#1b2a45" opacity="0.6" />

      {/* steps */}
      <rect x="280" y="452" width="440" height="28" rx="2" fill="#0e182b" />
      <rect x="320" y="432" width="360" height="20" rx="2" fill="#12203a" />

      {/* podium */}
      <rect x="180" y="404" width="640" height="28" fill="#0d1626" />

      {/* wings */}
      <rect x="70" y="300" width="130" height="132" fill="#0c1424" />
      <rect x="800" y="300" width="130" height="132" fill="#0c1424" />
      {[86, 118, 150].map((x) => (
        <rect key={x} x={x} y="318" width="8" height="16" rx="2" fill="#f4b63c" opacity="0.35" />
      ))}
      {[816, 848, 880].map((x) => (
        <rect key={x} x={x} y="318" width="8" height="16" rx="2" fill="#f4b63c" opacity="0.35" />
      ))}

      {/* roof slab */}
      <rect x="190" y="148" width="620" height="18" rx="2" fill="#111c33" />

      {/* glazed hall */}
      <rect x="240" y="166" width="520" height="238" rx="4" fill="url(#pavilion-hall)" />
      {/* vertical fins */}
      {Array.from({ length: 11 }, (_, i) => 258 + i * 48).map((x) => (
        <rect key={x} x={x} y="180" width="10" height="210" fill="#16243f" />
      ))}
      {/* warm base light */}
      <rect x="240" y="366" width="520" height="26" fill="#f4b63c" opacity="0.16" />

      {/* portico */}
      <rect x="220" y="232" width="560" height="20" rx="2" fill="#13213c" />
      {Array.from({ length: 9 }, (_, i) => 250 + i * 62).map((x) => (
        <rect key={x} x={x} y="252" width="12" height="152" fill="#0e1a30" />
      ))}

      {/* entrance */}
      <rect x="466" y="340" width="68" height="64" rx="3" fill="#67e8f9" opacity="0.28" />
      <rect x="478" y="352" width="44" height="40" rx="2" fill="#67e8f9" opacity="0.5" />

      {/* civic mark */}
      <circle cx="500" cy="282" r="20" fill="none" stroke="#67e8f9" strokeWidth="2" opacity="0.85" />
      <circle cx="500" cy="282" r="7" fill="#67e8f9" opacity="0.9" />
    </svg>
  )
}

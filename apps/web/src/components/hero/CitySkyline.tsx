interface CitySkylineProps {
  className?: string
}

interface Building {
  x: number
  w: number
  h: number
  lit?: boolean
}

/** Shared dark city silhouette with lit windows, used by hero + scroll story. */
const BUILDINGS: Building[] = [
  { x: 30, w: 80, h: 110 },
  { x: 120, w: 120, h: 190 },
  { x: 250, w: 70, h: 140 },
  { x: 330, w: 110, h: 250, lit: true },
  { x: 450, w: 140, h: 165 },
  { x: 600, w: 80, h: 220, lit: true },
  { x: 690, w: 115, h: 135 },
  { x: 815, w: 100, h: 280, lit: true },
  { x: 925, w: 145, h: 200 },
  { x: 1080, w: 85, h: 245, lit: true },
  { x: 1175, w: 115, h: 155 },
  { x: 1300, w: 70, h: 105 },
]

export function CitySkyline({ className }: CitySkylineProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax slice"
      role="presentation"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="1440" height="360" fill="transparent" />
      {BUILDINGS.map((b, i) => {
        const windows: Array<{ x: number; y: number }> = []
        if (b.lit) {
          const cols = Math.floor((b.w - 24) / 20)
          const rows = Math.floor((b.h - 30) / 30)
          for (let c = 0; c < cols; c += 1) {
            for (let r = 0; r < rows; r += 1) {
              windows.push({ x: b.x + 14 + c * 20, y: 360 - b.h + 18 + r * 30 })
            }
          }
        }
        return (
          <g key={i}>
            <rect
              x={b.x}
              y={360 - b.h}
              width={b.w}
              height={b.h}
              fill={i % 3 === 0 ? '#0d1729' : '#0a1120'}
            />
            {windows.map((w, wi) => (
              <rect
                key={wi}
                x={w.x}
                y={w.y}
                width="9"
                height="12"
                rx="1.5"
                fill="#33547f"
                opacity={wi % 5 === 0 ? 0.85 : 0.45}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

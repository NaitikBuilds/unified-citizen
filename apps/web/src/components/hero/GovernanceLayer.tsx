/**
 * Governance-layer reveal: after the camera settles, the civic destination
 * is overlaid with a living system map — CITIZEN → AI → DEPARTMENTS →
 * OFFICER → SLA → RESOLUTION. Connections draw in sequence; every node is
 * semantic (no decorative scatter). Reduced motion shows the full map
 * statically (handled in CSS).
 */

interface GovernanceNode {
  id: string
  label: string
  x: number
  y: number
  delay: number
  cursor?: string
}

const NODES: GovernanceNode[] = [
  { id: 'citizen', label: 'CITIZEN', x: 600, y: 82, delay: 0.4 },
  { id: 'ai', label: 'AI ENGINE', x: 600, y: 212, delay: 0.9 },
  { id: 'pwd', label: 'PWD', x: 402, y: 352, delay: 1.4, cursor: 'DEPARTMENT' },
  { id: 'water', label: 'WATER', x: 600, y: 352, delay: 1.6, cursor: 'DEPARTMENT' },
  { id: 'health', label: 'HEALTH', x: 798, y: 352, delay: 1.8, cursor: 'DEPARTMENT' },
  { id: 'officer', label: 'OFFICER', x: 600, y: 490, delay: 2.3 },
  { id: 'sla', label: 'SLA', x: 600, y: 592, delay: 2.8 },
  { id: 'resolution', label: 'RESOLUTION', x: 600, y: 668, delay: 3.3, cursor: 'OPEN CASE' },
]

const EDGES: Array<[string, string, number]> = [
  ['citizen', 'ai', 0.5],
  ['ai', 'pwd', 1.1],
  ['ai', 'water', 1.3],
  ['ai', 'health', 1.5],
  ['pwd', 'officer', 2.0],
  ['water', 'officer', 2.2],
  ['health', 'officer', 2.4],
  ['officer', 'sla', 2.9],
  ['sla', 'resolution', 3.4],
]

const nodeById = new Map<string, GovernanceNode>(NODES.map((n) => [n.id, n]))

interface GovernanceLayerProps {
  /** True once the camera has settled — triggers the reveal. */
  active: boolean
}

export function GovernanceLayer({ active }: GovernanceLayerProps) {
  if (!active) return null
  return (
    <div className="scene-governance" aria-hidden="true">
      <svg
        className="governance-svg"
        viewBox="0 0 1200 740"
        role="presentation"
        focusable="false"
      >
        <defs>
          <pattern id="gov-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="rgba(103, 232, 249, 0.07)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="1200" height="740" fill="url(#gov-grid)" />

        {EDGES.map(([from, to, delay], i) => {
          const a = nodeById.get(from)
          const b = nodeById.get(to)
          if (!a || !b) return null
          const mid = 0.5
          const cx = a.x + (b.x - a.x) * mid
          const cy = a.y + (b.y - a.y) * mid - 30
          return (
            <path
              key={i}
              className="gov-link"
              style={{ animationDelay: `${delay}s` }}
              d={`M ${a.x} ${a.y + 34} C ${cx} ${cy}, ${cx} ${cy}, ${b.x} ${b.y - 34}`}
              pathLength={1}
              fill="none"
              stroke="rgba(94, 167, 255, 0.5)"
              strokeWidth="1.5"
            />
          )
        })}

        {NODES.map((n) => (
          <g
            key={n.id}
            className="gov-node"
            style={{ animationDelay: `${n.delay}s` }}
            data-cursor-label={n.cursor}
          >
            <circle cx={n.x} cy={n.y} r="34" className="gov-node-ring" fill="none" stroke="rgba(103, 232, 249, 0.5)" strokeWidth="1.5" />
            <circle cx={n.x} cy={n.y} r="22" fill="#0a1220" stroke="rgba(103, 232, 249, 0.9)" strokeWidth="1.5" />
            <circle cx={n.x} cy={n.y} r="5" fill="#67e8f9" />
            <text
              x={n.x}
              y={n.y + 46}
              textAnchor="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="13"
              letterSpacing="2.5"
              fill="#c9d6ea"
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* system status line */}
        <g>
          <text
            x="26"
            y="40"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="12"
            letterSpacing="3"
            fill="rgba(103, 232, 249, 0.75)"
          >
            SYSTEM ONLINE
          </text>
          <text
            x="150"
            y="40"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="12"
            fill="#67e8f9"
            className="gov-blink"
          >
            _
          </text>
        </g>
      </svg>
    </div>
  )
}

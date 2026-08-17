export interface SystemStatusProps {
  label: string
}

/** Mono system readout pill with a status dot (light surface voice). */
export function SystemStatus({ label }: SystemStatusProps) {
  return (
    <span className="ucg-readout">
      <span className="ucg-readout-dot" aria-hidden="true" />
      {label}
    </span>
  )
}

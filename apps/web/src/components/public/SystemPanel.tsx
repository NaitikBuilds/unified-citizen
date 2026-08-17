import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

export interface SystemPanelProps {
  eyebrow?: string
  title: string
  description?: string
  /** Mono readout pill, e.g. "AI ROUTING · HUMAN REVIEWED". */
  readout?: string
  children?: ReactNode
  className?: string
}

/**
 * Midnight digital-intelligence panel — reserved for system-level sections
 * (AI classification, SLA, trust/security). Never used as a page background.
 */
export function SystemPanel({
  eyebrow,
  title,
  description,
  readout,
  children,
  className,
}: SystemPanelProps) {
  return (
    <Reveal className={className}>
      <div className="system-panel">
        <div className="system-panel-inner p-8 sm:p-10 lg:p-12">
          {eyebrow && (
            <p className="eyebrow text-ucg-signal">{eyebrow}</p>
          )}
          <h2 className="system-title mt-4">{title}</h2>
          {description && <p className="system-desc max-w-2xl">{description}</p>}
          {children}
          {readout && (
            <div className="mt-7">
              <span className="system-readout">
                <span className="dot" aria-hidden="true" />
                {readout}
              </span>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}

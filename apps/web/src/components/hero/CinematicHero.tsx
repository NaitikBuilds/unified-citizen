import { useCallback, useState } from 'react'
import { cn } from '../../utils/cn'
import { CivicCursor } from '../motion/CivicCursor'
import { CivicScene } from './CivicScene'
import { GovernanceLayer } from './GovernanceLayer'
import { HeroContent } from './HeroContent'

/**
 * Full-viewport cinematic hero: camera pass (Earth → clouds → city → civic
 * destination), then the governance-layer reveal and editorial hero copy.
 *
 * Business content below the fold is untouched — this section only changes
 * presentation.
 */
export function CinematicHero() {
  const [settled, setSettled] = useState(false)

  const handleSettled = useCallback(() => setSettled(true), [])

  return (
    <section
      className={cn('civic-scene', settled && 'is-settled')}
      aria-label="Unified Citizen — from complaint to resolution"
    >
      <CivicScene onSettled={handleSettled} />
      <GovernanceLayer active={settled} />
      <HeroContent />
      <CivicCursor />
    </section>
  )
}

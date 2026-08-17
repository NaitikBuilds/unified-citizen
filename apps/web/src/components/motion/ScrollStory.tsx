import { useRef } from 'react'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { CitySkyline } from '../hero/CitySkyline'
import { CivicCursor } from './CivicCursor'
import { cn } from '../../utils/cn'

interface StoryStage {
  title: string
  copy: string
}

const STAGES: StoryStage[] = [
  {
    title: 'See your city',
    copy: 'Every complaint enters the civic grid — visible, owned and accountable from the first moment.',
  },
  {
    title: 'Report an issue',
    copy: 'Describe the problem, pin the location and submit. Your grievance joins the city\u2019s live register.',
  },
  {
    title: 'AI assists routing',
    copy: 'The engine reads the complaint, suggests a category and routes it to the right department for human review.',
  },
  {
    title: 'Departments take ownership',
    copy: 'Public Works, Water, Health and their peers receive the case and assign an officer on the ground.',
  },
  {
    title: 'Service levels stay visible',
    copy: 'Every step is tracked against a service-level agreement — response times and deadlines you can see.',
  },
  {
    title: 'Resolution returns to the citizen',
    copy: 'The officer closes the loop, the city records the outcome, and you know exactly how it was resolved.',
  },
]

const NODE_LABELS = ['CITIZEN', 'AI', 'DEPARTMENTS', 'OFFICERS', 'SLA', 'RESOLUTION']

/**
 * Pinned scroll storytelling: one normalized 0→1 scroll controller drives all
 * six governance stages (spine fill, node activation, stage copy, HUD).
 * Reduced motion renders the complete static diagram with every stage visible.
 */
export function ScrollStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(sectionRef)
  const reduced = usePrefersReducedMotion()

  const stageIndex = reduced ? 5 : Math.min(5, Math.floor(progress * 6))
  const lineFill = (stageIndex / 5) * 100

  return (
    <section ref={sectionRef} className="civic-story" aria-label="How the governance system works">
      <div className="civic-story-pin">
        <div className="story-grid-bg" aria-hidden="true" />
        <div className="story-skyline" aria-hidden="true">
          <CitySkyline />
        </div>

        <div className="story-content">
          <ol className="story-spine" aria-label="System journey">
            <span className="story-spine-line" aria-hidden="true">
              <span
                className="story-spine-line-fill"
                style={{ transform: `scaleY(${lineFill / 100})` }}
              />
            </span>
            {NODE_LABELS.map((label, i) => (
              <li
                key={label}
                className={cn(
                  'story-node',
                  reduced ? 'is-done' : i < stageIndex ? 'is-done' : i === stageIndex ? 'is-active' : '',
                )}
              >
                <span className="story-node-dot" aria-hidden="true" />
                <span className="story-node-label">{label}</span>
                <span className="story-node-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ol>

          <div className="story-text">
            {STAGES.map((stage, i) => (
              <div
                key={stage.title}
                className={cn(
                  'story-stage',
                  reduced || i === stageIndex ? 'is-visible' : '',
                )}
              >
                <h2>{stage.title}</h2>
                <p>{stage.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="story-hud" aria-hidden="true">
          <span>SYSTEM FLOW</span>
          <span className="story-hud-bar">
            <span style={{ transform: `scaleX(${reduced ? 1 : progress})` }} />
          </span>
          <span>
            {String(stageIndex + 1).padStart(2, '0')} / 06
          </span>
        </div>

        <CivicCursor />
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/**
 * One coherent scroll controller for a pinned (sticky) section.
 *
 * Normalizes the scroll position of a tall section into 0 → 1 progress
 * measured against the pinned travel distance (section height − viewport).
 * All visual stages inside the section derive from this single value — no
 * scattered scroll listeners.
 *
 * The scroll/resize handlers are rAF-throttled so the controller never does
 * layout work more than once per frame.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0

    const update = (): void => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const travel = Math.max(rect.height - vh, 0)
      const scrolled = Math.min(Math.max(-rect.top, 0), travel)
      setProgress(travel > 0 ? scrolled / travel : 1)
    }

    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])

  return progress
}

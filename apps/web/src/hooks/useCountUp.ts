import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Animates a number from 0 (or `from`) to `target` with an ease-out curve.
 * Respects `prefers-reduced-motion: reduce` — when set, the value appears
 * instantly. Used for dashboard counters; motion communicates data change
 * only, never decoratively.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }

    const start = performance.now()
    const from = 0

    const tick = (now: number): void => {
      const progress = Math.min(1, (now - start) / durationMs)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, durationMs])

  return value
}

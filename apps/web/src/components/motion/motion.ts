/**
 * Shared motion math for the cinematic system.
 *
 * One timeline controller drives the whole Earth → cloud → city camera pass;
 * easing here is the only place camera curves are defined.
 */

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))

/** Ease-out cubic — used for entrances and counter-like motion. */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3)

/** Ease-in cubic — used for the accelerating dive through the clouds. */
export const easeIn = (t: number): number => t * t * t

/** Ease-in-out cubic — used for the settle. */
export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Normalizes p into the [start, end] window as an eased 0..1 value.
 * Returns 0 before the window, 1 after it.
 */
export const windowEase = (
  p: number,
  start: number,
  end: number,
  ease: (t: number) => number = easeOut,
): number => ease(clamp01((p - start) / (end - start)))

/** Linear interpolation between two values by eased progress. */
export const mix = (
  p: number,
  a: number,
  b: number,
  ease: (t: number) => number = easeOut,
): number => a + (b - a) * ease(clamp01(p))

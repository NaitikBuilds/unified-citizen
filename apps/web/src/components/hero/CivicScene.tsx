import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { easeIn, mix, windowEase } from '../motion/motion'
import { CitySkyline } from './CitySkyline'
import { CivicPavilion } from './CivicPavilion'

/**
 * Camera timeline length — slow approach, acceleration, cloud dive, settle.
 */
const DURATION = 9000

interface CivicSceneProps {
  /** Called once the camera has settled (or immediately under reduced motion). */
  onSettled: () => void
}

/**
 * The cinematic Earth → atmosphere → clouds → city → civic destination pass.
 *
 * One rAF controller drives every layer through a single 0→1 progress value;
 * easing lives in `motion.ts`. The pass runs once on mount, pauses when the
 * scene leaves the viewport, and is skipped entirely under reduced motion
 * (settled frame + all content shown statically). DOM writes only — no React
 * state per frame.
 */
export function CivicScene({ onSettled }: CivicSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const onSettledRef = useRef(onSettled)

  useEffect(() => {
    onSettledRef.current = onSettled
  }, [onSettled])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const q = (sel: string): HTMLElement | null =>
      root.querySelector<HTMLElement>(sel)

    const starsFar = q('.scene-stars-far')
    const stars = q('.scene-stars')
    const earth = q('.scene-earth')
    const atmo = q('.earth-atmo')
    const clouds = q('.scene-clouds')
    const city = q('.scene-city')
    const arch = q('.scene-arch')

    const earthScale = (p: number): number => {
      if (p < 0.42) return mix(p / 0.42, 0.14, 0.55)
      if (p < 0.62) return mix((p - 0.42) / 0.2, 0.55, 1.45, easeIn)
      return mix((p - 0.62) / 0.23, 1.45, 2.15, easeIn)
    }

    const applyFrame = (p: number): void => {
      // Stars drift down as the camera descends, then fade into the clouds.
      if (stars) {
        stars.style.opacity = String(1 - windowEase(p, 0.5, 0.78))
        stars.style.transform = `translate3d(0, ${mix(p, 0, -42)}px, 0)`
      }
      if (starsFar) {
        starsFar.style.opacity = String(1 - windowEase(p, 0.44, 0.72))
      }

      // Earth: slow far-away approach → accelerating dive → past camera.
      if (earth) {
        earth.style.transform = `scale(${earthScale(p)}) translateY(${mix(
          p,
          10,
          -7,
        )}vh)`
        earth.style.opacity = String(1 - windowEase(p, 0.64, 0.84))
      }
      if (atmo) {
        const glow =
          windowEase(p, 0.18, 0.38) * (1 - windowEase(p, 0.66, 0.84))
        atmo.style.opacity = String(glow)
      }

      // Clouds: fade in, grow past the camera, part to thin haze.
      if (clouds) {
        const inW = windowEase(p, 0.46, 0.6)
        const outW = 1 - windowEase(p, 0.88, 1)
        clouds.style.opacity = String(0.12 + inW * 0.88 * outW)
        clouds.style.transform = `scale(${mix(p, 0.6, 1.35)})`
        clouds.style.filter = `blur(${mix(p, 26, 7)}px)`
      }

      // City emerges as the clouds pass, blur clearing with the camera.
      if (city) {
        city.style.transform = `translate3d(0, ${mix(p, 100, 4)}%, 0)`
        city.style.opacity = String(windowEase(p, 0.66, 0.82))
        city.style.filter = `blur(${mix(p, 14, 0)}px)`
      }

      // Civic destination settles in front of the skyline.
      if (arch) {
        arch.style.opacity = String(windowEase(p, 0.82, 1))
        arch.style.transform = `translateX(-50%) translateY(${mix(
          p,
          46,
          0,
        )}px) scale(${mix(p, 0.96, 1)})`
      }
    }

    if (reduced) {
      applyFrame(1)
      onSettledRef.current()
      return
    }

    let raf = 0
    let start: number | null = null
    let finished = false
    let visible = true

    const tick = (t: number): void => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / DURATION)
      applyFrame(p)
      if (p >= 1) {
        finished = true
        onSettledRef.current()
        raf = 0
        return
      }
      if (visible) raf = requestAnimationFrame(tick)
      else raf = 0
    }

    const schedule = (): void => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible && !finished && raf === 0) schedule()
    })
    io.observe(root)

    schedule()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduced])

  return (
    <div ref={rootRef} className="scene-root" aria-hidden="true">
      <div className="scene-layer scene-stars-far" />
      <div className="scene-layer scene-stars" />
      <div className="scene-earth" style={{ transform: 'scale(0.14) translateY(10vh)' }}>
        <div className="earth-globe">
          <div className="earth-term" />
          <div className="earth-clouds" />
        </div>
      </div>
      <div className="earth-atmo" style={{ opacity: 0 }} />
      <div className="scene-layer scene-clouds">
        <span className="cloud cloud-a" />
        <span className="cloud cloud-b" />
        <span className="cloud cloud-c" />
        <span className="cloud cloud-d" />
      </div>
      <div className="scene-layer scene-city">
        <CitySkyline />
      </div>
      <div className="scene-arch">
        <CivicPavilion />
      </div>
      <div className="scene-vignette" />
    </div>
  )
}

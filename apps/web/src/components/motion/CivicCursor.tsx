import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

/**
 * Custom cursor for cinematic areas only.
 *
 * - Mounted inside a cinematic container (hero / scroll story).
 * - A small dot + ring follow the pointer with a gentle lerp.
 * - Hovering an interactive element expands the ring.
 * - Hovering an element with `data-cursor-label` shows that label
 *   (e.g. DEPARTMENT, OPEN CASE).
 *
 * Disabled entirely for: touch/coarse pointers, reduced motion, and whenever
 * the hosting cinematic container leaves the viewport (IntersectionObserver).
 * Native cursor is hidden via `.ucg-cursor-active` only inside the scoped
 * cinematic containers — forms, tables and dense UI keep the native cursor.
 */
export function CivicCursor() {
  const hostRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const host = hostRef.current
    if (!host) return

    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return

    let dot = dotRef.current
    let ring = ringRef.current
    let label = labelRef.current

    let raf = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y

    const root = document.documentElement
    let attached = false

    const enable = (): void => {
      if (attached) return
      attached = true
      root.classList.add('ucg-cursor-active')
      window.addEventListener('mousemove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
    }

    const disable = (): void => {
      if (!attached) return
      attached = false
      root.classList.remove('ucg-cursor-active')
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }

    const onMove = (e: MouseEvent): void => {
      tx = e.clientX
      ty = e.clientY
      const target = e.target as HTMLElement | null
      const labelled = target?.closest<HTMLElement>('[data-cursor-label]')
      const interactive = target?.closest<HTMLElement>(
        'a, button, [role="button"], [tabindex]',
      )

      if (label && labelled) {
        label.textContent = labelled.dataset.cursorLabel ?? ''
        host.classList.add('has-label')
      } else if (host) {
        host.classList.remove('has-label')
      }

      host?.classList.toggle('is-active', Boolean(interactive) || Boolean(labelled))
    }

    const loop = (): void => {
      x += (tx - x) * 0.2
      y += (ty - y) * 0.2
      if (dot) dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      if (ring) ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      // label positioned just right of the ring
      if (label) {
        label.style.transform = `translate(${x + 20}px, ${y}px) translateY(-50%)`
      }
      raf = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) enable()
        else {
          disable()
          if (dot) dot.style.transform = ''
          if (ring) ring.style.transform = ''
        }
      },
      { threshold: 0.05 },
    )
    io.observe(host)

    return () => {
      io.disconnect()
      disable()
      dot = null
      ring = null
      label = null
    }
  }, [reduced])

  if (reduced) return null

  return (
    <div ref={hostRef} className="civic-cursor" aria-hidden="true">
      <span ref={dotRef} className="civic-cursor-dot" />
      <span ref={ringRef} className="civic-cursor-ring" />
      <span ref={labelRef} className="civic-cursor-label" />
    </div>
  )
}

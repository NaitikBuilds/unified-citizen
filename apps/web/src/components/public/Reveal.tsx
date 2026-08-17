import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface RevealProps {
  children: ReactNode
  /** Optional stagger delay in ms. */
  delay?: number
  className?: string
}

/**
 * One-pass scroll reveal driven by a single IntersectionObserver per
 * element — no scroll listeners, no layout thrashing. transform/opacity
 * only; reduced motion shows everything statically (CSS).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('ucg-reveal', visible && 'is-revealed', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, Menu, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface PublicHeaderProps {
  /** Primary navigation links (desktop pill + mobile drawer). */
  nav?: ReactNode
  /** Right-side actions, e.g. Sign in / Register. */
  actions?: ReactNode
  /** dark = transparent over the cinematic hero until scrolled. */
  tone?: 'light' | 'dark'
}

/**
 * Floating pill navigation.
 *
 * Initial (dark tone, top of page): transparent, light text over the hero.
 * On scroll (or on light pages): morphs into a compact floating surface with
 * blur, border and shadow. Mobile gets an accessible drawer (Escape closes,
 * overlay click closes, background scroll locks, focus moves into the panel).
 */
export function PublicHeader({ nav, actions, tone = 'light' }: PublicHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let raf = 0
    const onScroll = (): void => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setScrolled(window.scrollY > 40)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const closeOnNav = (e: MouseEvent): void => {
    if ((e.target as Element).closest('a')) setOpen(false)
  }

  const compact = tone === 'light' || scrolled

  return (
    <header
      className={cn(
        'ucg-header',
        tone === 'dark' ? 'ucg-header-dark' : 'ucg-header-light',
        compact && 'is-compact',
        open && 'menu-open',
      )}
    >
      <div className="ucg-header-pill">
        <Link to="/" className="ucg-logo" aria-label="Unified Citizen — home">
          <span className="ucg-logo-mark">
            <Landmark className="size-4" aria-hidden="true" />
          </span>
          <span className="ucg-wordmark hidden sm:inline">Unified Citizen</span>
        </Link>

        {nav && (
          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            {nav}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {actions && (
            <div className="hidden items-center gap-1.5 md:flex">{actions}</div>
          )}
          <button
            type="button"
            className="ucg-icon-btn md:hidden"
            aria-expanded={open}
            aria-controls="ucg-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        className="ucg-mobile-overlay"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        id="ucg-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="ucg-mobile-drawer"
        inert={!open}
      >
        <div className="flex items-center justify-between">
          <span className="ucg-wordmark">Unified Citizen</span>
          <button
            ref={closeBtnRef}
            type="button"
            className="ucg-icon-btn"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {nav && (
          <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1" onClick={closeOnNav}>
            {nav}
          </nav>
        )}

        {actions && (
          <div
            className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4"
            onClick={closeOnNav}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

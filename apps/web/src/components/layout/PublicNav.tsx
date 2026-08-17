import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/departments', label: 'Departments' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
  { to: '/help', label: 'Help' },
]

/**
 * Public navigation link set — rendered inside the floating pill header.
 * Tone (light/dark header) is handled by the header's CSS.
 */
export function PublicNav() {
  return (
    <>
      {LINKS.map((link) => (
        <Link key={link.to} to={link.to} className="ucg-nav-link">
          {link.label}
        </Link>
      ))}
    </>
  )
}

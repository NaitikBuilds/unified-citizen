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

const linkClasses =
  'rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'

/** Primary navigation for the public landing pages. */
export function PublicNav() {
  return (
    <>
      {LINKS.map((link) => (
        <Link key={link.to} to={link.to} className={linkClasses}>
          {link.label}
        </Link>
      ))}
    </>
  )
}

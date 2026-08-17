import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Editorial hero copy — appears once the camera settles. Large negative
 * space, refined serif headline, minimal chrome. No invented statistics.
 */
export function HeroContent() {
  return (
    <div className="scene-hero-content">
      <p className="eyebrow hero-eyebrow">Unified Citizen</p>
      <h1 className="display-serif mt-5">From complaint to resolution.</h1>
      <p className="scene-hero-copy mt-5">
        A unified civic platform connecting citizens, departments and public
        services through transparent grievance management.
      </p>
      <div className="hero-ctas">
        <Link to="/auth/login" className="hero-cta-primary">
          Submit a Grievance
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link to="/how-it-works" className="hero-cta-secondary">
          Explore the System
        </Link>
      </div>
    </div>
  )
}

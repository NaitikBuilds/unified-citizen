import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const MODULES = ['CITIZENS', 'DEPARTMENTS', 'SERVICES', 'AI ENGINE']

/**
 * Branded initialization screen for the cinematic scene.
 *
 * ONLY for scene initialization / lazy-loading heavy visuals — normal API
 * requests use skeletons and the shared Spinner. Reduced motion shows all
 * modules online statically.
 */
export function CivicLoader() {
  usePrefersReducedMotion() // consumed via CSS; hook keeps the contract honest

  return (
    <div className="civic-loader" role="status" aria-live="polite">
      <p className="civic-loader-title">Unified Citizen</p>
      <p className="civic-loader-sub">SYSTEM INITIALIZING</p>
      <ul className="civic-loader-list" aria-label="System modules">
        {MODULES.map((module) => (
          <li key={module} className="civic-loader-row">
            <span>{module}</span>
            <span className="civic-loader-dot" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  )
}

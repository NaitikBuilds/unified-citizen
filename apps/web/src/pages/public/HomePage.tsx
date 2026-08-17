import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { CivicLoader } from '../../components/motion/CivicLoader'
import { landingServices, howItWorksSteps } from './landingContent'

// Cinematic scenes are lazy-loaded with the branded CivicLoader (scene
// initialization only — normal API requests keep using skeletons/spinners).
const CinematicHero = lazy(() =>
  import('../../components/hero/CinematicHero').then((m) => ({ default: m.CinematicHero })),
)
const ScrollStory = lazy(() =>
  import('../../components/motion/ScrollStory').then((m) => ({ default: m.ScrollStory })),
)

const STATS = [
  { value: '5,000+', label: 'Citizens served' },
  { value: '18 min', label: 'Average first response' },
  { value: '96%', label: 'SLA compliance' },
  { value: '24×7', label: 'Reporting available' },
]

export function HomePage() {
  return (
    <>
      {/* Cinematic hero — Earth → clouds → city → civic destination */}
      <Suspense fallback={<CivicLoader />}>
        <CinematicHero />
      </Suspense>

      {/* Pinned governance storytelling */}
      <Suspense fallback={<div className="h-[60vh] bg-ucg-midnight" aria-hidden="true" />}>
        <ScrollStory />
      </Suspense>

      {/* Stats — editorial numerals, restrained */}
      <section className="border-b border-slate-200 bg-ucg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-4 py-16 sm:px-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-editorial text-4xl font-semibold text-ucg-ink">
                {stat.value}
              </p>
              <p className="label-mono mt-3 text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — editorial numbered strip */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-ucg-blue">The journey</p>
          <h2 className="display-serif-sm mt-5 text-ucg-ink">How it works</h2>
          <p className="mt-4 text-slate-600">
            From submission to resolution — every grievance follows the same
            transparent journey, visible at each step.
          </p>
        </div>
        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorksSteps.map((item) => (
            <li key={item.step} className="border-t border-slate-300 pt-5">
              <p className="font-editorial text-5xl font-semibold text-slate-300">
                {item.step}
              </p>
              <h3 className="mt-4 font-semibold text-ucg-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
        <Link
          to="/how-it-works"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-ucg-blue hover:text-blue-700"
        >
          Learn more
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Service categories — quiet cards, hairline borders */}
      <section className="bg-ucg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow text-ucg-blue">What can you report?</p>
              <h2 className="display-serif-sm mt-5 text-ucg-ink">Every city service, one entry point</h2>
              <p className="mt-4 text-slate-600">
                Choose the category that matches your issue and we will route it
                to the right department.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ucg-blue hover:text-blue-700"
            >
              All services
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {landingServices.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.key}
                  className="group rounded-xl border border-slate-200 bg-ucg-paper p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_-24px_rgba(9,12,18,0.35)]"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-blue-600/10 text-ucg-blue transition-colors group-hover:bg-ucg-blue group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-editorial text-lg font-semibold text-ucg-ink">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA — dark civic panel */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-ucg-midnight px-6 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(120,150,200,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,200,0.08) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <p className="eyebrow justify-center text-ucg-signal">Your city, one platform</p>
            <h2 className="display-serif-sm mx-auto mt-5 max-w-2xl text-ucg-white">
              Ready to report a grievance?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-200/80">
              Create a free account or sign in to submit, track and resolve
              issues — with updates at every step.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ucg-white px-6 text-sm font-semibold text-ucg-ink transition-colors hover:bg-blue-50"
              >
                <CheckCircle2 className="size-4 text-ucg-blue" aria-hidden="true" />
                Create free account
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/30 px-6 text-sm font-semibold text-ucg-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

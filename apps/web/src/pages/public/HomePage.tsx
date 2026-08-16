import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Landmark } from 'lucide-react'
import { landingServices, howItWorksSteps } from './landingContent'

const STATS = [
  { value: '5,000+', label: 'Citizens served' },
  { value: '18 min', label: 'Average first response' },
  { value: '96%', label: 'SLA compliance' },
  { value: '24×7', label: 'Reporting available' },
]

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700">
              <Landmark className="size-3.5" aria-hidden="true" />
              One platform for every city service
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Report a problem. Track it. Get it resolved.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              Unified Citizen Governance connects you directly with the departments that
              keep your city running — roads, sanitation, water, electricity, health and
              transport — with transparent status and clear deadlines.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-base font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                Report a grievance
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-800 px-5 text-base font-medium text-slate-200 ring-1 ring-inset ring-slate-700 transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works teaser */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <p className="mt-3 text-slate-600">
            From submission to resolution — every grievance follows the same transparent
            journey.
          </p>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {howItWorksSteps.map((item) => (
            <li key={item.step} className="relative rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {item.step}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </li>
          ))}
        </ol>
        <Link
          to="/how-it-works"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Learn more
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Service categories */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900">What can you report?</h2>
              <p className="mt-3 text-slate-600">
                Choose the category that matches your issue and we will route it to the
                right department.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              All services
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {landingServices.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.key}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="size-5 text-blue-700" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-blue-600 px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold text-white">Ready to report a grievance?</h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Create a free account or sign in to submit, track and resolve issues — with
            updates at every step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth/register"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-base font-medium text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
              Create free account
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-700 px-5 text-base font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { landingServices } from './landingContent'

export function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Services</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          What can you report?
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Select the category that best matches your issue. Our system routes it to the
          responsible department automatically.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {landingServices.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.key}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-blue-100">
                <Icon className="size-6 text-blue-700" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{service.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {service.description}
              </p>
              <Link
                to="/auth/login"
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Report in this category
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )
        })}
      </div>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Not sure which department?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Describe the problem in your own words — our AI suggests the right category and
          department, and a human always reviews the decision.
        </p>
        <Link
          to="/how-it-works"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          See how classification works
        </Link>
      </div>
    </div>
  )
}

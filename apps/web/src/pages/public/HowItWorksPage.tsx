import { Link } from 'react-router-dom'
import { ArrowRight, Bot, CheckCircle2, Clock, MessageSquare, Star, UserCheck } from 'lucide-react'
import { howItWorksSteps } from './landingContent'

const STEP_ICONS = [CheckCircle2, Bot, UserCheck, MessageSquare, Star]

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">How it works</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          From report to resolution
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Five clear stages, tracked from start to finish with a service-level deadline at
          every step.
        </p>
      </div>

      <ol className="mt-12 space-y-6">
        {howItWorksSteps.map((item, index) => {
          const Icon = STEP_ICONS[index] ?? CheckCircle2
          return (
            <li
              key={item.step}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-start"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <Icon className="size-6 text-white" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Step {item.step}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Clock className="size-6 text-blue-600" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-slate-900">SLA deadlines</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Each grievance is bound by response and resolution deadlines set by its
            category and priority. If a deadline is at risk or missed, the case is
            escalated to senior officials automatically.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Bot className="size-6 text-blue-600" aria-hidden="true" />
          <h2 className="mt-3 font-semibold text-slate-900">AI with human review</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Artificial intelligence suggests the category, department and priority, and
            flags duplicates — but a human reviews every recommendation before it is final.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/auth/register"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-base font-medium text-white transition-colors hover:bg-blue-700"
        >
          Start now — it&apos;s free
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

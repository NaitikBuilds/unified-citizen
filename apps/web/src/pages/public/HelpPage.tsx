import { Link } from 'react-router-dom'
import { ArrowRight, FilePlus2, Search, ShieldAlert, Star, UserPlus } from 'lucide-react'

const HELP_SECTIONS = [
  {
    icon: UserPlus,
    title: 'Create an account',
    steps: [
      'Open the registration page and enter your name, email and a password of at least 6 characters.',
      'Use a valid email — it is how you receive updates about your grievances.',
      'Registration is instant and free; no verification step is required.',
    ],
  },
  {
    icon: FilePlus2,
    title: 'Submit a grievance',
    steps: [
      'Sign in and open Submit Grievance.',
      'Give your grievance a short title and a detailed description (at least 10 characters).',
      'Pick the category that matches your issue and add the location.',
      'Attach photos or documents as evidence — they help officers respond faster.',
      'Submit. The system will classify your grievance and route it to the right department.',
    ],
  },
  {
    icon: Search,
    title: 'Track a grievance',
    steps: [
      'Open My Grievances to see every grievance you have submitted.',
      'Each entry shows its status: Submitted, AI Classified, Assigned, In Progress, Resolved, or Escalated.',
      'Open a grievance to see officer comments, attachments, and its SLA deadline.',
      'You will also receive notifications when the status changes.',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Escalate or reopen',
    steps: [
      'If a grievance is not addressed within its SLA window, use Escalate to raise priority.',
      'Once resolved, if the issue is not actually fixed, use Reopen with a reason.',
      'Escalation alerts senior officials; reopening returns the case to the department.',
    ],
  },
  {
    icon: Star,
    title: 'Give feedback',
    steps: [
      'After a grievance is resolved, rate it from 1 to 5 and leave a comment.',
      'Feedback is tied to the grievance and submitted once.',
      'Your ratings help departments improve their service.',
    ],
  },
]

export function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Help</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          How to use the portal
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Step-by-step guides for the most common tasks. For anything else, the help desk is
          one call away.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        {HELP_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <section
              key={section.title}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                  <Icon className="size-5 text-blue-700" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              </div>
              <ol className="mt-4 space-y-2">
                {section.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )
        })}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to="/faq"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          Browse the FAQ
          <ArrowRight className="size-4 text-blue-600" aria-hidden="true" />
        </Link>
        <Link
          to="/contact"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          Contact the help desk
          <ArrowRight className="size-4 text-blue-600" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

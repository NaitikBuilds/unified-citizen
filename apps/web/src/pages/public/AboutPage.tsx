import { Eye, Globe, Handshake, ShieldCheck, Target } from 'lucide-react'

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Transparency',
    description:
      'Every grievance carries a visible status and a service-level deadline, so you always know where things stand.',
  },
  {
    icon: Eye,
    title: 'Accountability',
    description:
      'Departments and officers are assigned to every case, with escalations when deadlines are at risk.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description:
      'Report from any device — desktop, tablet or mobile — with a simple form that takes minutes.',
  },
  {
    icon: Handshake,
    title: 'Citizen first',
    description:
      'Feedback after every resolution shapes how departments prioritise and improve services.',
  },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">About</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          A single channel between citizens and their city
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Unified Citizen Governance is the city&apos;s digital grievance platform. It brings
          public works, sanitation, water, electricity, health and transport departments
          into one place, so a reported problem reaches the right team automatically and
          citizens can follow it from submission to resolution.
        </p>
        <p className="mt-4 leading-relaxed text-slate-600">
          Instead of visiting offices, making phone calls or waiting for updates, citizens
          can submit a grievance in minutes, attach photos as evidence, receive comments
          from the handling officer and rate the outcome. Built with artificial
          intelligence, the platform classifies each grievance, suggests the responsible
          department and flags likely duplicates — always leaving the final decision with
          people.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((principle) => {
          const Icon = principle.icon
          return (
            <div key={principle.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                <Icon className="size-5 text-blue-700" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-900">{principle.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {principle.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <ShieldCheck className="size-5 text-emerald-700" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Your privacy is protected</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Contact details are used only for resolving your grievance and are never shown
              publicly. Every action on the platform is audited, and departmental access is
              restricted by role — citizens see their own grievances, while staff only see
              what their department handles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

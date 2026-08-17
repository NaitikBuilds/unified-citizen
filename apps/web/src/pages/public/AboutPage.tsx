import { Eye, Globe, Handshake, ShieldCheck, Target } from 'lucide-react'
import {
  PageHero,
  PublicPage,
  Reveal,
  SectionHeader,
  SystemPanel,
} from '../../components/public'

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
    <PublicPage>
      <PageHero
        eyebrow="About"
        title="A single channel between citizens and their city"
        description="Unified Citizen Governance is the city's digital grievance platform. It brings public works, sanitation, water, electricity, health and transport departments into one place, so a reported problem reaches the right team automatically and citizens can follow it from submission to resolution."
      />

      {/* Mission lead */}
      <Reveal>
        <div className="mx-auto max-w-3xl pb-20">
          <p className="text-lg leading-relaxed text-slate-600">
            Instead of visiting offices, making phone calls or waiting for updates,
            citizens can submit a grievance in minutes, attach photos as evidence,
            receive comments from the handling officer and rate the outcome. Built with
            artificial intelligence, the platform classifies each grievance, suggests
            the responsible department and flags likely duplicates — always leaving the
            final decision with people.
          </p>
        </div>
      </Reveal>

      {/* Principles — four editorial civic blocks */}
      <section className="pb-20">
        <SectionHeader
          eyebrow="Principles"
          title="How the platform works for you"
          description="Four commitments shape every interaction on the civic grid."
        />
        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((principle, index) => {
            const Icon = principle.icon
            return (
              <Reveal key={principle.title} delay={index * 70}>
                <article className="editorial-block">
                  <p className="editorial-index">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <span className="civic-icon-chip mt-5">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-editorial text-xl font-semibold text-ucg-ink">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {principle.description}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Privacy — trust / security panel */}
      <section className="pb-20">
        <SystemPanel
          eyebrow="Trust"
          title="Your privacy is protected"
          description="Contact details are used only for resolving your grievance and are never shown publicly. Every action on the platform is audited, and departmental access is restricted by role — citizens see their own grievances, while staff only see what their department handles."
          readout="ROLE-BASED ACCESS · FULL AUDIT TRAIL"
          className="max-w-none"
        >
          <span className="civic-icon-chip mt-6">
            <ShieldCheck aria-hidden="true" />
          </span>
        </SystemPanel>
      </section>
    </PublicPage>
  )
}

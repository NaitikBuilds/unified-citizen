import { FilePlus2, Search, ShieldAlert, Star, UserPlus } from 'lucide-react'
import {
  CtaPanel,
  CivicPanel,
  PageHero,
  PublicPage,
  Reveal,
} from '../../components/public'

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
    <PublicPage size="md">
      <PageHero
        eyebrow="Help"
        title="How to use the portal"
        description="Step-by-step guides for the most common tasks. For anything else, the help desk is one call away."
      />

      {/* Editorial guide system */}
      <section className="pb-20">
        <div className="space-y-6">
          {HELP_SECTIONS.map((section, index) => {
            const Icon = section.icon
            return (
              <Reveal key={section.title} delay={Math.min(index * 40, 160)}>
                <CivicPanel>
                  <div className="flex items-center gap-3">
                    <span className="civic-icon-chip">
                      <Icon aria-hidden="true" />
                    </span>
                    <h2 className="font-editorial text-xl font-semibold text-ucg-ink">
                      {section.title}
                    </h2>
                    <span className="civic-mono-label ml-auto">
                      GUIDE {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <ol className="mt-6 space-y-4">
                    {section.steps.map((step, stepIndex) => (
                      <li key={step} className="flex gap-4">
                        <span className="editorial-index shrink-0 pt-0.5">
                          {String(stepIndex + 1).padStart(2, '0')}
                        </span>
                        <p className="leading-relaxed text-slate-600">{step}</p>
                      </li>
                    ))}
                  </ol>
                </CivicPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="pb-20">
        <CtaPanel
          tone="light"
          eyebrow="Next steps"
          title="More ways to get answers"
          description="Browse common questions or speak to the help desk directly."
          actions={[
            { to: '/faq', label: 'Browse the FAQ', secondary: true },
            { to: '/contact', label: 'Contact the help desk' },
          ]}
        />
      </section>
    </PublicPage>
  )
}

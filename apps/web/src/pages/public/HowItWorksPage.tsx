import { Bot, CheckCircle2, Clock, MessageSquare, Star, UserCheck } from 'lucide-react'
import { howItWorksSteps } from './landingContent'
import {
  CtaPanel,
  PageHero,
  PublicPage,
  Reveal,
  SystemPanel,
} from '../../components/public'

const STEP_ICONS = [CheckCircle2, Bot, UserCheck, MessageSquare, Star]

export function HowItWorksPage() {
  return (
    <PublicPage size="md">
      <PageHero
        eyebrow="How it works"
        title="From report to resolution"
        description="Five clear stages, tracked from start to finish with a service-level deadline at every step."
      />

      {/* Journey spine */}
      <section className="pb-20 pt-4">
        <ol className="journey">
          {howItWorksSteps.map((item, index) => {
            const Icon = STEP_ICONS[index] ?? CheckCircle2
            return (
              <Reveal key={item.step} delay={index * 50}>
                <li className="journey-step">
                  <span className="journey-rail" aria-hidden="true">
                    <span className="journey-dot" />
                  </span>
                  <div className="pt-1">
                    <div className="flex items-center gap-3">
                      <span className="civic-icon-chip">
                        <Icon aria-hidden="true" />
                      </span>
                      <p className="civic-mono-label">
                        Stage {String(item.step).padStart(2, '0')}
                      </p>
                    </div>
                    <h2 className="mt-3 font-editorial text-2xl font-semibold text-ucg-ink">
                      {item.title}
                    </h2>
                    <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </section>

      {/* System panels — SLA + human review */}
      <section className="pb-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SystemPanel
            eyebrow="Service levels"
            title="SLA deadlines"
            description="Each grievance is bound by response and resolution deadlines set by its category and priority. If a deadline is at risk or missed, the case is escalated to senior officials automatically."
            readout="SLA BOUND · AUTO-ESCALATION"
            className="h-full"
          >
            <span className="civic-icon-chip mt-6">
              <Clock aria-hidden="true" />
            </span>
          </SystemPanel>
          <SystemPanel
            eyebrow="Intelligence"
            title="AI with human review"
            description="Artificial intelligence suggests the category, department and priority, and flags duplicates — but a human reviews every recommendation before it is final."
            readout="HUMAN IN THE LOOP"
            className="h-full"
          >
            <span className="civic-icon-chip mt-6">
              <Bot aria-hidden="true" />
            </span>
          </SystemPanel>
        </div>
      </section>

      <section className="pb-20">
        <CtaPanel
          eyebrow="Get started"
          title="Start now — it's free"
          description="Create a free account and report your first grievance in minutes."
          actions={[{ to: '/auth/register', label: 'Create free account' }]}
        />
      </section>
    </PublicPage>
  )
}

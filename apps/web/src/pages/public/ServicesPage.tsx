import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { landingServices } from './landingContent'
import {
  CivicPanel,
  PageHero,
  PublicPage,
  Reveal,
  SystemPanel,
} from '../../components/public'

export function ServicesPage() {
  return (
    <PublicPage>
      <PageHero
        eyebrow="Services"
        title="What can you report?"
        description="Select the category that best matches your issue. Our system routes it to the responsible department automatically."
        meta="SIX CIVIC SERVICE LINES"
      />

      <section className="pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {landingServices.map((service, index) => {
            const Icon = service.icon
            return (
              <Reveal key={service.key} delay={index * 60}>
                <CivicPanel hover className="flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="civic-icon-chip">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="civic-mono-label">
                      SRV-{String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="mt-5 font-editorial text-xl font-semibold text-ucg-ink">
                    {service.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                  <Link
                    to="/auth/login"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ucg-blue hover:text-blue-700"
                  >
                    Report in this category
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </CivicPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* AI classification — midnight system panel */}
      <section className="pb-20">
        <SystemPanel
          eyebrow="AI routing"
          title="Not sure which department?"
          description="Describe the problem in your own words — our AI suggests the right category and department, and a human always reviews the decision."
          readout="AI SUGGESTION · HUMAN REVIEWED"
          className="max-w-none"
        >
          <Link to="/how-it-works" className="system-cta mt-7">
            See how classification works
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </SystemPanel>
      </section>
    </PublicPage>
  )
}

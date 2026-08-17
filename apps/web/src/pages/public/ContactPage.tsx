import { Clock, Mail, MapPin, Phone, Siren } from 'lucide-react'
import { contactDetails } from './landingContent'
import {
  CivicPanel,
  PageHero,
  PublicPage,
  Reveal,
  SystemPanel,
} from '../../components/public'

const ICONS = [MapPin, Phone, Mail, Siren] as const

const HOURS = [
  { day: 'Monday – Friday', time: '8:00 AM – 8:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 5:00 PM' },
  { day: 'Sunday', time: 'Closed (online 24×7)' },
]

export function ContactPage() {
  return (
    <PublicPage size="md">
      <PageHero
        eyebrow="Contact"
        title="Reach the city help desk"
        description="For questions about the portal, your grievance, or how to get help, the help desk is available six days a week."
        meta="HELP DESK · DIRECT CHANNELS"
      />

      {/* Help-desk command surface */}
      <section className="pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {contactDetails.map((detail, index) => {
            const Icon = ICONS[index] ?? MapPin
            const isEmergency = index === 3
            return (
              <Reveal key={detail.label} delay={index * 50}>
                <CivicPanel tone={isEmergency ? 'critical' : 'default'} hover className="h-full">
                  <div className="flex items-start justify-between">
                    <span className="civic-icon-chip">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="civic-mono-label">
                      CH-{String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {detail.label}
                  </h2>
                  <p className="mt-1.5 font-editorial text-xl font-semibold text-ucg-ink">
                    {detail.value}
                  </p>
                </CivicPanel>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Help desk hours — system panel */}
      <section className="pb-20">
        <SystemPanel
          eyebrow="Availability"
          title="Help desk hours"
          description="Grievance submission is available online 24×7 — you never need to wait for office hours to report an issue."
          readout="ONLINE REPORTING · 24×7"
          className="max-w-none"
        >
          <span className="civic-icon-chip mt-6">
            <Clock aria-hidden="true" />
          </span>
          <dl className="mt-7 grid max-w-xl gap-x-10 gap-y-3 sm:grid-cols-3">
            {HOURS.map((row) => (
              <div key={row.day} className="border-t border-white/10 pt-3">
                <dt className="civic-mono-label text-slate-400">{row.day}</dt>
                <dd className="mt-1.5 text-sm font-medium text-ucg-white">{row.time}</dd>
              </div>
            ))}
          </dl>
        </SystemPanel>
      </section>
    </PublicPage>
  )
}

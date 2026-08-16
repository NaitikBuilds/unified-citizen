import { Clock, Mail, MapPin, Phone, Siren } from 'lucide-react'
import { contactDetails } from './landingContent'

const ICONS = [MapPin, Phone, Mail, Siren] as const

export function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Contact</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Reach the city help desk
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          For questions about the portal, your grievance, or how to get help, the help desk
          is available six days a week.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {contactDetails.map((detail, index) => {
          const Icon = ICONS[index] ?? MapPin
          const isEmergency = index === 3
          return (
            <div
              key={detail.label}
              className={`rounded-xl border p-6 ${
                isEmergency ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            >
              <span
                className={`flex size-10 items-center justify-center rounded-lg ${
                  isEmergency ? 'bg-red-100' : 'bg-blue-100'
                }`}
              >
                <Icon
                  className={`size-5 ${isEmergency ? 'text-red-700' : 'text-blue-700'}`}
                  aria-hidden="true"
                />
              </span>
              <h2 className="mt-4 text-sm font-semibold text-slate-900">{detail.label}</h2>
              <p className={`mt-1 text-sm ${isEmergency ? 'text-red-800' : 'text-slate-600'}`}>
                {detail.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Clock className="size-5 text-blue-700" aria-hidden="true" />
          <h2 className="font-semibold text-slate-900">Help desk hours</h2>
        </div>
        <dl className="mt-4 grid max-w-md gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Monday – Friday</dt>
            <dd className="font-medium text-slate-800">8:00 AM – 8:00 PM</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Saturday</dt>
            <dd className="font-medium text-slate-800">9:00 AM – 5:00 PM</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Sunday</dt>
            <dd className="font-medium text-slate-800">Closed (online 24×7)</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-600">
          Grievance submission is available online 24×7 — you never need to wait for office
          hours to report an issue.
        </p>
      </div>
    </div>
  )
}

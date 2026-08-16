import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { landingFaqs } from './landingContent'

export function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-100">
          <HelpCircle className="size-6 text-blue-700" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Answers to the questions citizens ask most often.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {landingFaqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-slate-200 bg-white open:ring-1 open:ring-blue-600/20"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-slate-400 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-slate-100 p-6 text-center">
        <p className="text-sm text-slate-600">
          Still have questions? Visit the{' '}
          <Link to="/help" className="font-medium text-blue-600 hover:text-blue-700">
            Help centre
          </Link>{' '}
          or{' '}
          <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-700">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

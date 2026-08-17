import { landingFaqs } from './landingContent'
import {
  CtaPanel,
  PageHero,
  PublicPage,
  Reveal,
} from '../../components/public'

export function FaqPage() {
  return (
    <PublicPage size="sm">
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Answers to the questions citizens ask most often."
        align="center"
        meta="KNOWLEDGE BASE · 10 ENTRIES"
      />

      <section className="pb-20 pt-2">
        <div className="space-y-3">
          {landingFaqs.map((faq, index) => (
            <Reveal key={faq.question} delay={Math.min(index * 30, 150)}>
              <details className="faq-item civic-panel">
                <summary className="faq-summary">
                  <span className="civic-mono-label shrink-0">
                    Q{String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="faq-q">{faq.question}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-20">
        <CtaPanel
          tone="light"
          eyebrow="Still have questions?"
          title="The help desk is one step away"
          description="Browse the full Help centre or reach the city help desk directly."
          actions={[
            { to: '/help', label: 'Visit the Help centre', secondary: true },
            { to: '/contact', label: 'Contact us', secondary: true },
          ]}
        />
      </section>
    </PublicPage>
  )
}

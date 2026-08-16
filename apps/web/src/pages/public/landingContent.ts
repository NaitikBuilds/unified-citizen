import type { LucideIcon } from 'lucide-react'
import {
  Ambulance,
  Bus,
  Droplets,
  Recycle,
  Road,
  Zap,
} from 'lucide-react'

export interface LandingService {
  key: string
  title: string
  description: string
  icon: LucideIcon
}

export const landingServices: LandingService[] = [
  {
    key: 'road',
    title: 'Roads & Infrastructure',
    description:
      'Report potholes, broken footpaths, drainage issues and public infrastructure damage for repair.',
    icon: Road,
  },
  {
    key: 'sanitation',
    title: 'Sanitation & Waste',
    description:
      'Garbage not collected, missing bins, street cleanliness and waste management concerns.',
    icon: Recycle,
  },
  {
    key: 'water',
    title: 'Water Supply',
    description:
      'Leakages, supply interruptions, water quality concerns and billing issues.',
    icon: Droplets,
  },
  {
    key: 'electricity',
    title: 'Electricity & Street Lighting',
    description:
      'Power outages, voltage fluctuations, faulty street lights and electrical hazards.',
    icon: Zap,
  },
  {
    key: 'health',
    title: 'Public Health',
    description:
      'Hospital services, mosquito breeding, hygiene complaints and disease prevention.',
    icon: Ambulance,
  },
  {
    key: 'transport',
    title: 'Transport & Traffic',
    description:
      'Bus services, traffic signals, road permits and public transport concerns.',
    icon: Bus,
  },
]

export interface HowItWorksStep {
  step: string
  title: string
  description: string
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: '1',
    title: 'Submit your grievance',
    description:
      'Describe the issue, pick a category, add the location and attach photos. You can report from your phone in under two minutes.',
  },
  {
    step: '2',
    title: 'AI classification',
    description:
      'Our system reads your grievance, identifies the right department and suggests a priority — always available for human review.',
  },
  {
    step: '3',
    title: 'Officer assignment',
    description:
      'The department assigns an officer, who acknowledges your grievance and starts working on it.',
  },
  {
    step: '4',
    title: 'Resolution with updates',
    description:
      'You receive status updates at every stage, tracked against a service-level agreement (SLA) deadline.',
  },
  {
    step: '5',
    title: 'Feedback & rating',
    description:
      'Once resolved, rate your experience and leave a comment. Your feedback drives service improvement.',
  },
]

export interface FaqItem {
  question: string
  answer: string
}

export const landingFaqs: FaqItem[] = [
  {
    question: 'What is the Unified Citizen Governance portal?',
    answer:
      'It is a single platform where citizens can submit, track and resolve grievances across city departments — roads, sanitation, water, electricity, health and transport.',
  },
  {
    question: 'Do I need to register to report a grievance?',
    answer:
      'Yes. A registered account lets you track your grievance, receive updates, comment and give feedback. Registration is free and takes less than a minute.',
  },
  {
    question: 'How do I track my grievance?',
    answer:
      'Sign in and open My Grievances. Every grievance shows its current status — Submitted, AI Classified, Assigned, In Progress, Resolved — along with officer comments and the responsible department.',
  },
  {
    question: 'How long does resolution take?',
    answer:
      'Every grievance is bound by a service-level agreement (SLA) with response and resolution deadlines based on category and priority. The deadline is visible on the grievance details page.',
  },
  {
    question: 'What if my grievance is not addressed in time?',
    answer:
      'You can escalate a grievance if it is not acted on within the SLA window or the situation is urgent. Escalation raises priority and alerts senior officials.',
  },
  {
    question: 'What happens if my grievance is a duplicate?',
    answer:
      'When you submit, the system checks for similar existing grievances. If a match is found you will see a duplicate warning with a similarity score. You can still submit — it will be reviewed and linked if needed.',
  },
  {
    question: 'Can I give feedback after resolution?',
    answer:
      'Yes. Once a grievance is marked resolved you can rate it from 1 to 5 and leave a comment. Only one feedback entry is allowed per grievance.',
  },
  {
    question: 'Can I reopen a resolved grievance?',
    answer:
      'If the issue is not actually fixed, you can reopen a resolved grievance with a reason. It returns to the department as reopened.',
  },
  {
    question: 'Is the service free?',
    answer:
      'Yes. Submitting, tracking and escalating grievances is completely free for citizens.',
  },
  {
    question: 'Is my information private?',
    answer:
      'Your contact details are used only for the resolution of your grievance and are never displayed publicly.',
  },
]

export interface ContactDetail {
  label: string
  value: string
}

export const contactDetails: ContactDetail[] = [
  { label: 'City Help Desk', value: 'District Administrative Complex, Civic Centre Road' },
  { label: 'Phone', value: '1800-123-4567 (toll-free, 8 AM – 8 PM)' },
  { label: 'Email', value: 'helpdesk@unified.gov' },
  { label: 'Emergency (24×7)', value: 'Dial 100 for police, 101 for fire, 108 for ambulance' },
]

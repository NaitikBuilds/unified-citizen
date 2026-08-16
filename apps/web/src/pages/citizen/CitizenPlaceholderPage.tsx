import { ComingSoon } from '../../components/ui'

export interface CitizenPlaceholderPageProps {
  title: string
  phase: string
  description: string
}

/**
 * Temporary in-progress state for Citizen Portal routes implemented in
 * later steps (86 shell only wires navigation). Replaced by the real page
 * when its step lands.
 */
export function CitizenPlaceholderPage({
  title,
  phase,
  description,
}: CitizenPlaceholderPageProps) {
  return <ComingSoon title={title} phase={phase} description={description} />
}

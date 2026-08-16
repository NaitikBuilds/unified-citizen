import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  /** Route path the item navigates to (optional for items without a route yet). */
  href?: string
  icon?: LucideIcon
}

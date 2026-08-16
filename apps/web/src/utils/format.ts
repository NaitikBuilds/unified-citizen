/** Formats an ISO date string or Date into a readable date (e.g. "Aug 16, 2026"). */
export function formatDate(value?: string | Date | null): string {
  if (!value) {
    return '—'
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Formats an ISO date string or Date into date + time (e.g. "Aug 16, 2026, 10:00 AM"). */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) {
    return '—'
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Short relative time (e.g. "2h ago", "3d ago", "just now"). */
export function formatRelativeTime(value?: string | Date | null): string {
  if (!value) {
    return '—'
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const abs = Math.abs(seconds)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  if (abs < 60) {
    return 'just now'
  }
  const minutes = Math.round(seconds / 60)
  if (abs < 3600) {
    return rtf.format(minutes, 'minute')
  }
  const hours = Math.round(seconds / 3600)
  if (abs < 86400) {
    return rtf.format(hours, 'hour')
  }
  const days = Math.round(seconds / 86400)
  if (abs < 604800) {
    return rtf.format(days, 'day')
  }
  return formatDate(date)
}

/** Formats a number with a compact suffix (e.g. 1.2k, 3.4M). */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Formats a number as a percentage (e.g. 0.874 → "87.4%"). */
export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`
}

/** Formats hours as a duration (e.g. 36 → "1d 12h"). */
export function formatHours(hours: number): string {
  const wholeDays = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  if (wholeDays === 0) {
    return `${remainingHours}h`
  }
  return `${wholeDays}d ${remainingHours}h`
}

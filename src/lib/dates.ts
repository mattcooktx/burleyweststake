/**
 * Format a session date for display: "Sunday, April 19".
 *
 * Uses UTC to avoid the local-timezone day-shift bug — a YAML date
 * parsed in Mountain Time is midnight UTC, which displays as the previous
 * day if formatted in local time.
 */
export function formatSessionDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

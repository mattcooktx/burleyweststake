import { inlineEmphasis } from './inline'

/**
 * Render a talk/page title to HTML.
 *
 * Editors author titles with `*emphasis*` to mark which span should be
 * italic+gold (e.g. "The Lord's *Law of Witnesses*"). If no asterisks are
 * present, fall back to italicizing the last two words — matching what the
 * homepage and v4 prototype already do for hero headlines.
 */
export function renderTitleHtml(title: string): string {
  if (title.includes('*')) {
    return inlineEmphasis(title)
  }
  const words = title.trim().split(/\s+/)
  if (words.length < 2) return escapeHtml(title)
  const split = Math.max(words.length - 2, 0)
  const lead = words.slice(0, split).join(' ')
  const em = words.slice(split).join(' ')
  const leadPart = lead ? `${escapeHtml(lead)} ` : ''
  return `${leadPart}<em>${escapeHtml(em)}</em>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

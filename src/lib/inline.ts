/**
 * Tiny inline-emphasis helper for talk-body block text.
 *
 * Converts `**bold**` → <strong> and `*italic*` → <em>. Bold runs first so
 * the substitutions don't interfere. Everything else is HTML-escaped so
 * authored content can't inject markup.
 *
 * In quote-block contexts, the existing CSS turns <em> into a bold gold-
 * highlight (font-style: normal; weight 600; gradient background). In
 * other contexts <em> renders as the browser default italic.
 */
export function inlineEmphasis(text: string): string {
  const escaped = escapeHtml(text)
  return escaped
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
}

/** Split paragraphs on blank lines and emphasize each. Returns HTML string. */
export function paragraphsHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inlineEmphasis(p)}</p>`)
    .join('')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

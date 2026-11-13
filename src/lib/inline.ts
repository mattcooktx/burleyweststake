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
 *
 * Links: `[label](https://example.org)` becomes an <a> that opens in a new
 * tab. Only http(s) addresses are linked; anything else stays as typed.
 */
export function inlineEmphasis(text: string): string {
  // Lift links out first so emphasis markers are never applied inside a URL,
  // then drop them back in once the surrounding text has been emphasized.
  const links: string[] = []
  const withTokens = escapeHtml(text).replace(
    /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label: string, url: string) => {
      links.push(`<a href="${url}" target="_blank" rel="noopener">${emphasize(label)}</a>`)
      return `\uE000${links.length - 1}\uE000`
    },
  )
  return emphasize(withTokens).replace(/\uE000(\d+)\uE000/g, (_match, i: string) => links[Number(i)])
}

function emphasize(s: string): string {
  return s
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

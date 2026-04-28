/**
 * Tiny inline-emphasis helper for talk-body block text.
 *
 * Converts `*word*` to <em>word</em>. Escapes everything else so authored
 * content can't inject markup. Paragraph splits are handled by the caller
 * (split on blank-line, then run each paragraph through `inlineEmphasis`).
 */
export function inlineEmphasis(text: string): string {
  return escapeHtml(text).replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
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

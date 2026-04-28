/**
 * Pull a YouTube video ID out of whatever an editor pasted: a URL or a
 * full <iframe> embed blob.
 *
 * Returns the 11-character ID if found, else null. Supported inputs:
 *   - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   - https://youtu.be/dQw4w9WgXcQ
 *   - https://www.youtube.com/embed/dQw4w9WgXcQ
 *   - https://youtube.com/shorts/dQw4w9WgXcQ
 *   - <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?...">...</iframe>
 *   - bare ID: dQw4w9WgXcQ
 */
const ID_RE = /([a-zA-Z0-9_-]{11})/

export function extractYouTubeId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()

  // Try src="..." in an iframe blob first (most specific).
  const srcMatch = trimmed.match(
    /(?:src|href)=["'](?:https?:)?\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?:embed\/|watch\?v=|shorts\/|v\/)?([a-zA-Z0-9_-]{11})/,
  )
  if (srcMatch) return srcMatch[1]

  // Then try the input as a URL.
  const urlMatch = trimmed.match(
    /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?:embed\/|watch\?v=|shorts\/|v\/)?([a-zA-Z0-9_-]{11})/,
  )
  if (urlMatch) return urlMatch[1]

  // Bare ID fallback.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  // Last resort: any 11-char run that looks like an ID, but only if the
  // input is short (avoids false matches inside large blobs).
  if (trimmed.length < 30) {
    const m = trimmed.match(ID_RE)
    if (m) return m[1]
  }

  return null
}

/** YouTube's CDN poster image URL for a given video ID. */
export function youtubePosterUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
}

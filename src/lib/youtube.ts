/**
 * Extract the 11-character video ID from a YouTube URL.
 *
 * Accepts:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 *   - With or without protocol, www., and trailing query params.
 *
 * Returns null if no valid ID is found.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  )
  return m ? m[1] : null
}

/** Privacy-enhanced YouTube embed URL — no tracking cookies until play. */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

/** True if the URL points to a YouTube Short (vertical 9:16). */
export function isYouTubeShorts(url: string): boolean {
  return /\/shorts\//.test(url)
}

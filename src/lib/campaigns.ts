import { getCollection, type CollectionEntry } from 'astro:content'
import { formatSessionDate } from './dates'

export type Campaign = CollectionEntry<'campaigns'>
export type Category = CollectionEntry<'categories'>
export type Talk = CollectionEntry<'talks'>

// Vite glob picks up every PDF anywhere under src/content/. Built filenames
// are content-hashed (/_astro/<name>.<hash>.pdf) so this works in production.
const pdfUrls = import.meta.glob<string>('/src/content/**/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
})

/**
 * Resolve a markdown-relative PDF path (e.g. "./feast.pdf") to a built URL.
 * `entryDir` is the absolute-from-repo-root directory containing the markdown.
 */
function resolvePdfFromDir(entryDir: string, relativePath: string): string | undefined {
  const cleaned = relativePath.replace(/^\.\//, '')
  return pdfUrls[`${entryDir}/${cleaned}`]
}

/** Resolve a campaign-relative PDF path (legacy seed data still uses this). */
export function resolvePdfUrl(campaignId: string, relativePath: string): string | undefined {
  return resolvePdfFromDir(`/src/content/campaigns/${campaignId}`, relativePath)
}

/** Resolve a talk-relative PDF path. talkId = "<campaign-slug>/<talk-slug>". */
export function resolveTalkPdfUrl(talkId: string, relativePath: string): string | undefined {
  const campaignSlug = talkId.split('/')[0]
  return resolvePdfFromDir(`/src/content/talks/${campaignSlug}`, relativePath)
}

const isPublished = (c: Campaign) => !c.data.draft

export function isPlaceholder(c: Campaign, now: Date = new Date()): boolean {
  return new Date(c.data.start_date).getTime() > now.getTime()
}

export function formatDateRange(c: Campaign): string {
  if (isPlaceholder(c)) return 'Coming soon'
  // Editor-supplied label always wins (e.g., "April 18–19, 2026" — the
  // actual event dates rather than the homepage scheduling window).
  if (c.data.display_dates) return c.data.display_dates
  // Fallback: just month + year of the start_date so we don't leak the
  // schedule window. UTC parsing avoids local-tz day shifts.
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return fmt.format(new Date(c.data.start_date))
}

const startMs = (c: Campaign) => new Date(c.data.start_date).getTime()
// Missing end_date = "never ends". Returns +Infinity so range checks
// always pass on the upper bound.
const endMs = (c: Campaign) =>
  c.data.end_date ? new Date(c.data.end_date).getTime() : Number.POSITIVE_INFINITY

/**
 * Resolve the campaign that should drive the homepage today.
 *
 * Eligibility: only campaigns with `homepage: true` are ever considered
 * for the homepage rotation. This is an explicit opt-in — editing any
 * other campaign (Christmas, Holy Week, etc.) never affects the homepage
 * regardless of its dates.
 *
 * Among eligible campaigns: prefer one whose `start_date <= today <= end_date`,
 * else the most recently ended one, else null (homepage falls to evergreen).
 */
export async function getActiveCampaign(now: Date = new Date()): Promise<Campaign | null> {
  const all = (await getCollection('campaigns'))
    .filter(isPublished)
    .filter((c) => c.data.homepage === true)
  const today = now.getTime()

  const active = all
    .filter((c) => startMs(c) <= today && today <= endMs(c))
    .sort((a, b) => startMs(b) - startMs(a))
  if (active.length > 0) return active[0]

  // "Most recently ended" — campaigns with a real (finite) end_date in the
  // past. Open-ended campaigns (no end_date) never qualify here; they're
  // either currently active above or they fall through to null.
  const past = all
    .filter((c) => Number.isFinite(endMs(c)) && endMs(c) < today)
    .sort((a, b) => endMs(b) - endMs(a))
  if (past.length > 0) return past[0]

  return null
}

export async function getCampaignsByCategory(category: string): Promise<Campaign[]> {
  const all = (await getCollection('campaigns')).filter(isPublished)
  return all
    .filter((c) => c.data.category === category)
    .sort((a, b) => endMs(b) - endMs(a))
}

// ============================================================
// Talks
// ============================================================

export const SESSION_LABELS: Record<string, string> = {
  general: 'General Session',
  adult: 'Adult Session',
  leadership: 'Leadership Session',
  priesthood: 'Priesthood Leadership Meeting',
  youth: 'Youth Session',
  other: 'Other',
}

// Display order for sessions on the homepage and breadcrumb. Lower = earlier.
const SESSION_DISPLAY_ORDER: Record<string, number> = {
  general: 1,
  adult: 2,
  leadership: 3,
  priesthood: 4,
  youth: 5,
  other: 99,
}

const isPublishedTalk = (t: Talk) => !t.data.draft

/** All talks for a campaign, sorted by session then session_order within session. */
export async function getTalksForCampaign(campaignSlug: string): Promise<Talk[]> {
  const all = (await getCollection('talks')).filter(isPublishedTalk)
  return all
    .filter((t) => t.data.campaign === campaignSlug)
    .sort((a, b) => {
      const sa = SESSION_DISPLAY_ORDER[a.data.session] ?? 99
      const sb = SESSION_DISPLAY_ORDER[b.data.session] ?? 99
      if (sa !== sb) return sa - sb
      return a.data.session_order - b.data.session_order
    })
}

export interface SessionGroup {
  key: string
  label: string
  date: string
  order: number
  talks: Talk[]
}

/** Group talks by session, preserving session ordering. */
export function groupTalksBySession(talks: Talk[]): SessionGroup[] {
  const groups = new Map<string, SessionGroup>()
  for (const talk of talks) {
    const key = talk.data.session
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: SESSION_LABELS[key] ?? key,
        date: formatSessionDate(new Date(talk.data.session_date)),
        order: SESSION_DISPLAY_ORDER[key] ?? 99,
        talks: [],
      })
    }
    groups.get(key)!.talks.push(talk)
  }
  return [...groups.values()].sort((a, b) => a.order - b.order)
}

/** URL for a talk page. */
export function talkUrl(talk: Talk): string {
  // talk.id is "<campaign-slug>/<talk-slug>"; route is /campaigns/<c>/talks/<t>/.
  const [campaign, slug] = talk.id.split('/')
  return `/campaigns/${campaign}/talks/${slug}/`
}

// ============================================================
// Categories
// ============================================================

export interface CategoryWithCount extends Category {
  campaignCount: number
}

export async function getAllCategories(): Promise<CategoryWithCount[]> {
  const cats = await getCollection('categories')
  const allCampaigns = (await getCollection('campaigns')).filter(isPublished)
  return cats
    .map((cat) => ({
      ...cat,
      campaignCount: allCampaigns.filter((c) => c.data.category === cat.id).length,
    }))
    .sort((a, b) => a.data.display_order - b.data.display_order)
}

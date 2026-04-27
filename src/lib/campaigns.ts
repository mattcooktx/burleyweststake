import { getCollection, type CollectionEntry } from 'astro:content'

export type Campaign = CollectionEntry<'campaigns'>
export type Category = CollectionEntry<'categories'>

const pdfUrls = import.meta.glob<string>('/src/content/campaigns/**/pdfs/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
})

/**
 * Resolve a campaign-relative PDF path (e.g. "./pdfs/foo.pdf") to a built URL.
 * Returns undefined if the file doesn't exist in the bundle.
 */
export function resolvePdfUrl(campaignId: string, relativePath: string): string | undefined {
  const cleaned = relativePath.replace(/^\.\//, '')
  const fullPath = `/src/content/campaigns/${campaignId}/${cleaned}`
  return pdfUrls[fullPath]
}

/**
 * Best link for a talk: PDF if present, else external link_url, else undefined.
 */
export function resolveTalkLink(
  campaignId: string,
  talk: { pdf?: string; link_url?: string },
): string | undefined {
  if (talk.pdf) {
    const url = resolvePdfUrl(campaignId, talk.pdf)
    if (url) return url
  }
  return talk.link_url
}

const isPublished = (c: Campaign) => !c.data.draft

const startMs = (c: Campaign) => new Date(c.data.start_date).getTime()
const endMs = (c: Campaign) => new Date(c.data.end_date).getTime()

/**
 * Resolve the campaign that should drive the homepage today.
 *
 * Order of preference: an active campaign whose `start_date <= today <= end_date`,
 * else the most recently ended campaign, else null.
 */
export async function getActiveCampaign(now: Date = new Date()): Promise<Campaign | null> {
  const all = (await getCollection('campaigns')).filter(isPublished)
  const today = now.getTime()

  const active = all
    .filter((c) => startMs(c) <= today && today <= endMs(c))
    .sort((a, b) => startMs(b) - startMs(a))
  if (active.length > 0) return active[0]

  const past = all.filter((c) => endMs(c) < today).sort((a, b) => endMs(b) - endMs(a))
  if (past.length > 0) return past[0]

  return null
}

export async function getCampaignsByCategory(category: string): Promise<Campaign[]> {
  const all = (await getCollection('campaigns')).filter(isPublished)
  return all
    .filter((c) => c.data.category === category)
    .sort((a, b) => endMs(b) - endMs(a))
}

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

import { defineCollection, z } from 'astro:content'
import { glob, file } from 'astro/loaders'

const CATEGORY_KEYS = [
  'stake-conference',
  'holy-week',
  'christmas',
  'temple-celebration',
  'youth-conference',
  'other',
] as const

// ============================================================
// CMS-tolerant preprocess helpers
// ============================================================
// Decap CMS occasionally saves shapes that don't quite match what the
// schema expects: empty strings for cleared optional fields, null for
// cleared numbers, paths without a "./" prefix, ISO datetimes that the
// YAML parser then coerces into JS Dates. These helpers paper over
// those quirks centrally so every field doesn't need its own fix.

const emptyToUndef = (v: unknown) => (v === '' || v == null ? undefined : v)

const ensureRelativePrefix = (v: unknown) => {
  if (
    typeof v === 'string' &&
    v.length > 0 &&
    !v.startsWith('./') &&
    !v.startsWith('../') &&
    !v.startsWith('/') &&
    !/^https?:\/\//.test(v)
  ) {
    return `./${v}`
  }
  return v
}

const dateToIsoString = (v: unknown) =>
  v instanceof Date ? v.toISOString() : v

const campaigns = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/campaigns',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, '').replace(/\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      category: z.enum(CATEGORY_KEYS),
      start_date: z.coerce.date(),
      end_date: z.coerce.date(),
      hero_eyebrow: z.preprocess(emptyToUndef, z.string().optional()),
      hero_headline: z.string(),
      hero_subhead: z.preprocess(emptyToUndef, z.string().optional()),
      hero_image: z.preprocess(ensureRelativePrefix, image().optional()),
      hero_image_alt: z.preprocess(emptyToUndef, z.string().optional()),
      featured_scripture: z
        .object({
          text: z.string(),
          reference: z.string(),
        })
        .optional(),
      talks: z
        .array(
          z.object({
            session: z.string(),
            session_date: z.string(),
            session_order: z.number().int().nonnegative(),
            items: z.array(
              z.object({
                title: z.string(),
                speaker: z.string(),
                summary: z.string(),
                pdf: z.preprocess(
                  (v) => ensureRelativePrefix(emptyToUndef(v)),
                  z.string().optional(),
                ),
                link_url: z.preprocess(emptyToUndef, z.string().url().optional()),
                featured: z.boolean().default(false),
              }),
            ),
          }),
        )
        .default([]),
      photo_gallery: z
        .object({
          title: z.string().default('Photos from the Linger Longer'),
          meta: z.preprocess(emptyToUndef, z.string().optional()),
          photos: z.array(
            z.object({
              file: z.preprocess(ensureRelativePrefix, image()),
              alt: z.string(),
              featured_position: z.preprocess(
                emptyToUndef,
                z.number().int().min(1).max(4).optional(),
              ),
            }),
          ),
        })
        .optional(),
      social_post: z
        .object({
          platform: z.enum(['instagram', 'facebook']),
          post_url: z.string().url(),
          preview_image: z.preprocess(ensureRelativePrefix, image().optional()),
          caption: z.string(),
          // YAML may parse ISO-8601 datetimes as JS Date objects. Accept either
          // shape and normalize to an ISO string so downstream code is consistent.
          posted_at: z.preprocess(
            dateToIsoString,
            z.string(),
          ),
        })
        .optional(),
      draft: z.boolean().default(false),
    }),
})

const categories = defineCollection({
  loader: file('./src/content/categories.yaml'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      hero_image: image().optional(),
      display_order: z.number().int().nonnegative(),
    }),
})

export const collections = { campaigns, categories }

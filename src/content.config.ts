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
      hero_eyebrow: z.string().optional(),
      hero_headline: z.string(),
      hero_subhead: z.string().optional(),
      hero_image: image().optional(),
      hero_image_alt: z.string().optional(),
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
                pdf: z.string().optional(),
                link_url: z.string().url().optional(),
                featured: z.boolean().default(false),
              }),
            ),
          }),
        )
        .default([]),
      photo_gallery: z
        .object({
          title: z.string().default('Photos from the Linger Longer'),
          meta: z.string().optional(),
          photos: z.array(
            z.object({
              file: image(),
              alt: z.string(),
              featured_position: z.number().int().min(1).max(4).optional(),
            }),
          ),
        })
        .optional(),
      social_post: z
        .object({
          platform: z.enum(['instagram', 'facebook']),
          post_url: z.string().url(),
          preview_image: image().optional(),
          caption: z.string(),
          // YAML may parse ISO-8601 datetimes as JS Date objects. Accept either
          // and normalize to an ISO string so downstream code is consistent.
          posted_at: z
            .union([z.string(), z.date()])
            .transform((v) => (v instanceof Date ? v.toISOString() : v)),
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

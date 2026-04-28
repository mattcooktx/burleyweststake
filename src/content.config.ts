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

const coerceToString = (v: unknown) =>
  typeof v === 'number' || typeof v === 'boolean' ? String(v) : v

const coerceToOptionalString = (v: unknown) => {
  if (v === '' || v == null) return undefined
  return coerceToString(v)
}

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
      // Both dates optional now. start_date defaults to today (so a freshly-
      // created campaign goes live immediately). end_date can be omitted —
      // the active-campaign logic treats missing end_date as "never ends",
      // and the next campaign with a more recent start_date supersedes it.
      start_date: z.preprocess(
        (v) => (v === '' || v == null ? new Date() : v),
        z.coerce.date(),
      ),
      end_date: z.preprocess(
        (v) => (v === '' || v == null ? undefined : v),
        z.coerce.date().optional(),
      ),
      hero_eyebrow: z.preprocess(emptyToUndef, z.string().optional()),
      hero_headline: z.preprocess(emptyToUndef, z.string().optional()),
      hero_subhead: z.preprocess(emptyToUndef, z.string().optional()),
      hero_image: z.preprocess(ensureRelativePrefix, image().optional()),
      hero_image_alt: z.preprocess(emptyToUndef, z.string().optional()),
      featured_scripture: z
        .object({
          text: z.string(),
          reference: z.string(),
        })
        .optional(),
      // Talks moved to their own first-class collection (src/content/talks/).
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
      // Whether this campaign is eligible for the rotating homepage.
      // Defaults to false so editing any campaign in the CMS — even setting
      // its start_date to today by accident — never flips the homepage off
      // its current campaign. Flipping homepage to a new campaign is an
      // intentional one-click action.
      homepage: z.boolean().default(false),
      // Instagram's official "Embed" HTML blob, pasted as-is from the post's
      // three-dot menu. Rendered raw so the post looks how Instagram intends.
      instagram_embed_code: z.preprocess(emptyToUndef, z.string().optional()),
      // YouTube URL or full embed code; renders as a click-to-load tile
      // below the hero. Supports youtu.be/, youtube.com/watch?v=,
      // youtube.com/embed/, or a full <iframe ...> blob — extractor
      // pulls the 11-char video ID from any of them.
      video_embed: z.preprocess(emptyToUndef, z.string().optional()),
      video_caption: z.preprocess(emptyToUndef, z.string().optional()),
      draft: z.boolean().default(false),
    }),
})

// ============================================================
// TALKS — first-class collection (was: nested in campaign frontmatter)
// ============================================================

export const SESSION_KEYS = [
  'general',
  'adult',
  'leadership',
  'priesthood',
  'youth',
  'other',
] as const

const talks = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/talks',
    // ID format: "<campaign-slug>/<talk-slug>". Drives the URL
    // /campaigns/<campaign-slug>/talks/<talk-slug>/ and the campaign association.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: ({ image }) => {
    // Discriminated union of body block types. Each block's `type` literal
    // matches the discriminator the CMS list-with-types widget emits.
    const block = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('heading'),
        // Inline italic via *word*; rendered by BodyHeading.astro.
        text: z.string(),
      }),
      z.object({
        type: z.literal('area'),
        numeral: z.string(), // 'i.', 'ii.', 'iii.', 'iv.'
        text: z.string(),
      }),
      z.object({
        type: z.literal('subheading'),
        text: z.string(),
      }),
      z.object({
        type: z.literal('scripture'),
        reference: z.preprocess(coerceToString, z.string()),
        attribution: z.preprocess(coerceToOptionalString, z.string().optional()),
        text: z.string(), // paragraph breaks supported via blank lines
      }),
      z.object({
        type: z.literal('quote'),
        speaker: z.preprocess(coerceToString, z.string()),
        // Editors may type a bare year like "2017" which YAML parses as a
        // number; coerce to string so the schema stays happy.
        source: z.preprocess(coerceToOptionalString, z.string().optional()),
        text: z.string(), // *word* -> <em> with gold highlight via .quote-block CSS
      }),
      z.object({
        type: z.literal('graphic'),
        image: z.preprocess(ensureRelativePrefix, image()),
        alt: z.string(),
        caption: z.preprocess(emptyToUndef, z.string().optional()),
      }),
      z.object({
        type: z.literal('list'),
        intro: z.preprocess(emptyToUndef, z.string().optional()),
        items: z.array(
          z.union([
            z.string(),
            z.object({
              text: z.string(),
              nested: z.array(z.string()).optional(),
            }),
          ]),
        ),
      }),
      z.object({
        type: z.literal('ornament'),
      }),
    ])

    return z
      .object({
        title: z.string(),
        speaker: z.string(),
        speaker_role: z.preprocess(emptyToUndef, z.string().optional()),
        campaign: z.string(), // slug of the parent campaign (matches folder name)
        session: z.enum(SESSION_KEYS),
        session_date: z.string(), // human-readable, e.g., "Sunday, April 19"
        session_order: z.preprocess(emptyToUndef, z.number().int().default(99)),
        featured: z.boolean().default(false),
        teaser: z.string(), // 1-sentence summary for homepage card
        layout: z.enum(['rich', 'pdf']),
        pdf: z.preprocess(
          (v) => ensureRelativePrefix(emptyToUndef(v)),
          z.string().optional(),
        ),
        // Mode A (rich) only:
        hero_image: z.preprocess(ensureRelativePrefix, image().optional()),
        hero_image_alt: z.preprocess(emptyToUndef, z.string().optional()),
        body: z.array(block).optional(),
        // SEO/OG override:
        og_image: z.preprocess(ensureRelativePrefix, image().optional()),
        draft: z.boolean().default(false),
      })
      .refine((data) => (data.layout === 'pdf' ? !!data.pdf : true), {
        message: 'PDF-mode talks must have a `pdf` field',
        path: ['pdf'],
      })
      .refine(
        (data) => (data.layout === 'rich' ? !!data.body && data.body.length > 0 : true),
        { message: 'Rich-mode talks must have at least one body block', path: ['body'] },
      )
  },
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

export const collections = { campaigns, categories, talks }

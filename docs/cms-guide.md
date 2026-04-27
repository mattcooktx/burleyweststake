# Content editor guide — burleyweststake.com

Plain-English guide for stake leaders who edit the site. No coding, no terminal, no Git knowledge required.

## Logging in

1. Go to <https://burleyweststake.com/admin/>.
2. Click **Login**.
3. Sign in with the email address that received your invite. (If this is your first time, click the link in your invite email and set a password.)

If you can't sign in, ask Matt to re-send your invitation from the Netlify dashboard.

## What you'll see

- **Campaigns** — every stake conference, Holy Week, Christmas, etc. The site's main content.
- **Site Settings** — brand text, presidency, wards, contact info, resource links shown across the site.
- **Categories** — display names and descriptions for the Collections groupings.
- **Media** — images and PDFs you've uploaded. Each campaign has its own folder.

## Creating a new campaign

1. Click **Campaigns → New Campaign**.
2. Fill in:
   - **Title** — what visitors see (e.g., *October 2026 Stake Conference*).
   - **URL slug** — lowercase, hyphenated. This becomes the URL `/campaigns/<slug>/`. Don't include dates that might rot. Example: `october-2026-stake-conference`.
   - **Category** — pick one of the six.
   - **Start date / End date** — the homepage shows the campaign with a date range that includes today.
   - **Hero eyebrow / headline / subhead** — what the top of the page reads.
   - **Hero image** — drag and drop a temple photo or other lead image.
   - **Featured scripture** — optional. Renders as the italic quote band mid-page.
   - **Sessions & talks** — add one Session per meeting. For each Session, add talk **Items**:
     - Upload the **PDF** (preferred) or paste an **External link** (fallback).
     - Check **Featured talk?** for the prominent large card. Leave unchecked for the smaller cards.
   - **Photo gallery** — upload all your photos. For the four homepage tiles, set **Featured tile position** 1 (big tile, left) through 4 (small tiles, right) on the photos you want to highlight. Photos without a position appear only inside the lightbox.
   - **Instagram post** — optional. Paste the post URL and caption. If you skip the preview image, the styled scripture quote shows instead.
3. Click **Save**, then **Publish**.

## What happens after you save

1. Decap commits your changes to the GitHub repo automatically.
2. Netlify rebuilds the site (usually 30–60 seconds).
3. Your changes go live at <https://burleyweststake.com/>.

You can refresh the live site after about a minute to see the change. **Note:** the homepage's date-driven rotation only updates when someone saves in the CMS or the site is rebuilt — if a campaign is supposed to start today and nothing's been saved, it may not appear until the next save.

## Editing photos

- Photos are stored next to the campaign that owns them. The CMS handles the file paths automatically.
- You can drag and drop multiple photos at once into the **Photos** field.
- Provide a short, meaningful **Alt text** for each photo — it helps people using screen readers and improves search.
- The first **four** photos with a Featured tile position set become the homepage tiles. Everything else is gallery-only.

## Editing a talk's PDF

- Open the campaign, find the session and the talk item, click **Replace** on the PDF, upload the new file, then **Save**.
- The old PDF is removed from the live site automatically when the rebuild finishes.

## Editing site-wide settings

- **Site Settings** holds the brand block, presidency members, wards list, contact email, and the six homepage **Resource** tiles.
- Changes here ripple to every page.

## Marking a campaign as a draft

- On any campaign, check **Draft (hide from site)** if you want to work on it without it going live yet.
- Drafts don't render on the homepage or in Collections.

## Common gotchas

- **URL slugs are forever.** Once a campaign has been published, changing its slug breaks any links pointing at it. If you must change it, ask Matt to set up a redirect.
- **Image filenames don't matter** — Decap renames things with hashes for caching. Don't worry about pretty filenames.
- **Save often.** If you walk away without saving, your work in the form is gone.
- **Don't manually edit the GitHub repo.** Use the CMS. The CMS is just a friendly UI on top of the same files; mixing both can cause confusing merge conflicts.

## Help

- Site issues: contact Matt.
- Lost-password / login: contact Matt to re-send your invite from the Netlify dashboard.

# burleyweststake.com

The website for the Burley Idaho West Stake of The Church of Jesus Christ of Latter-day Saints.

Astro static site, content stored as Markdown, edited via Decap CMS, deployed to Netlify.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:4321/.

## Common commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server with hot reload |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run check` | Type-check the project (`astro check`) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the codebase with Prettier |

## Deployment

The `main` branch deploys automatically to Netlify on every push. Build settings live in `netlify.toml`.

- Production: https://burleyweststake.com (after Epic 8 cutover)
- Preview: every branch + PR gets its own preview URL on Netlify.

## Editing content

Stake leaders edit content at `https://burleyweststake.com/admin/`. Login is via Netlify Identity (invite-only). See `docs/cms-guide.md` (added in Epic 7) for the editor workflow.

## Project structure

```
src/
├── content/        Campaign markdown, site/categories YAML
├── layouts/        Page-level Astro layouts
├── components/     Reusable Astro components
├── lib/            Helpers (campaign queries, etc.)
├── pages/          Astro file-based routes
└── styles/         Global CSS

public/
├── admin/          Decap CMS (added in Epic 7)
├── favicon.svg
└── robots.txt
```

## Launching to burleyweststake.com

A one-time, careful sequence. Do this on a Saturday morning so DNS propagation finishes by Sunday.

### Pre-flight

1. Verify the Netlify-hosted version has all the real content.
2. Take a snapshot of the Squarespace site's URLs (check the stake newsletter and any printed flyers for deep links). Map any not already in `netlify.toml` / `public/_redirects` to a new URL.
3. Confirm `contact@burleyweststake.com` still forwards to your inbox.

### DNS cutover (Netlify dashboard)

1. **Site → Domain management → Add a custom domain** → enter `burleyweststake.com`.
2. Set canonical domain to **`burleyweststake.com`** (no www). Netlify auto-redirects `www.` to apex.
3. **HTTPS** → Verify Let's Encrypt cert provisions (1–5 minutes).
4. **At Squarespace registrar:** point the domain at Netlify. Two options:
   - **Easy path:** change nameservers to Netlify DNS (Netlify gives you 4 NS records).
   - **Targeted path:** keep DNS at Squarespace, add `A` `75.2.60.5` (Netlify) and `CNAME` `www → apex-loadbalancer.netlify.com`. Remove old A/CNAME records pointing at Squarespace.

### After cutover

1. Visit `https://burleyweststake.com` — confirm the new site loads.
2. Visit `https://www.burleyweststake.com` — confirm 301 to apex.
3. Visit `https://burleyweststake.com/templecelebration` — confirm 301 to `/collections/temple-celebration/`.
4. Lighthouse on the homepage. Targets: Perf ≥90 desktop, A11y ≥95, Best Practices ≥95, SEO ≥95.
5. Test login at `/admin/` with one of the editor accounts.
6. After a few days of confidence, **cancel the Squarespace subscription**.

### Optional: analytics

Recommended: Netlify Analytics ($9/month, server-side, no cookie banner). Plausible (~$9/month) is also fine.

## Source documents

The build spec, handoff packet, and visual prototype live one level up at the workspace root:

- `burley-stake-build-spec.md`
- `burley-stake-handoff-packet.md`
- `burley-stake-homepage-v4.html`

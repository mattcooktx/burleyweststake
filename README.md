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

## Source documents

The build spec, handoff packet, and visual prototype live one level up at the workspace root:

- `burley-stake-build-spec.md`
- `burley-stake-handoff-packet.md`
- `burley-stake-homepage-v4.html`

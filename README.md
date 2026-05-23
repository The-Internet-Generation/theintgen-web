# theintgen.com — TIG Web Ecosystem

Cloudflare Pages static site for The Internet Generation (TIG).

## Structure

```
/                     → Main brand portal (theintgen.com)
/tigital/             → Digital marketing knowledge hub (Notion CMS)
/tiggigs/             → Freelancer job board
/tigpods/             → Podcast homepage (placeholder)
/tigom/               → Open mic homepage (placeholder)
/public/assets/       → Shared logos and images
```

## Deployment

Connected to Cloudflare Pages via GitHub.

- **Branch:** `main`
- **Build command:** _(none — static HTML)_
- **Output directory:** `/` (root)

Push to `main` → auto-deploys in ~60 seconds.

## Notion CMS (Tigital)

The `/tigital/` section pulls blog posts, tools and guides from a Notion database.
See `/tigital/notion-config.js` (to be created) for the integration details.

## Local Preview

```bash
npx serve .
```

Then visit `http://localhost:3000`

---

© The Internet Generation · Chennai
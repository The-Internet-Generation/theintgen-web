# theintgen-web — CLAUDE.md
# The Internet Generation (TIG) — Main Repo (Single Source of Truth)

## What This Repo Is
The ONE repo for all TIG web properties. All subsites live as subfolders here.
- **GitHub:** `The-Internet-Generation/theintgen-web`
- **Local clone:** `/Users/jaytesh/Downloads/theintgen-web/`
- **Canonical local source (newest files):** `/Users/jaytesh/TIGLancers Website/`
- **CI/CD:** `.github/workflows/deploy.yml` → pushes to Cloudflare Pages project `theintgen-web`

## Repo Structure
```
theintgen-web/
├── index.html                    ← TIG ecosystem root / landing portal
├── _redirects                    ← Cloudflare Pages routing rules
├── .github/workflows/deploy.yml  ← GitHub Actions → CF Pages auto-deploy
├── public/assets/                ← logos
├── functions/                    ← CF Pages Functions (API routes)
├── tiggigs/                      ← TIG job board / freelance marketplace
│   ├── index.html
│   ├── dashboard.html
│   ├── team-dashboard.html
│   ├── client.html
│   └── [client logo PNGs]
├── tigital/index.html            ← Digital marketing library
├── tigom/index.html              ← Open mic events (Chennai)
└── tigpods/index.html            ← Podcast platform
```

## ⚠️ File Sync Status
Canonical latest versions live at `/Users/jaytesh/TIGLancers Website/`.
Run the sync command below before making changes to ensure you're on the newest code.

| File | Notes |
|---|---|
| `tiggigs/index.html` | Local may be newer — check before editing |
| `tiggigs/dashboard.html` | Local may be newer — check before editing |
| `tig-os.html` | Lives locally, not yet in repo |
| `tigpods.html` (full version) | Lives locally as `tigpods.html` |
| `tigpods-admin.html` | Lives locally, not yet in repo |

### Sync local → repo
```bash
cd /Users/jaytesh/Downloads/theintgen-web
cp "/Users/jaytesh/TIGLancers Website/index.html" tiggigs/index.html
cp "/Users/jaytesh/TIGLancers Website/dashboard.html" tiggigs/dashboard.html
cp "/Users/jaytesh/TIGLancers Website/team-dashboard.html" tiggigs/team-dashboard.html
cp "/Users/jaytesh/TIGLancers Website/tig-os.html" tiggigs/tig-os.html
cp "/Users/jaytesh/TIGLancers Website/tigpods.html" tigpods/tigpods-full.html
cp "/Users/jaytesh/TIGLancers Website/tigpods-admin.html" tigpods/admin.html
git add -A && git commit -m "sync: update from local source" && git push
```

## Live Architecture

### What's serving theintgen.com
```
User → theintgen.com → Cloudflare Pages (theintgen-web)
                        → deployed by GitHub Actions on push to main
```

## Database: Supabase
- **URL:** `https://snlcskmszhbipinffwpy.supabase.co`
- **Anon key:** publishable — safe for browser use (stored in env or inline in HTML)
- All HTML pages query Supabase directly from browser — no backend needed
- **108 total jobs**, 47 in June

### `jobs` table columns
`job_id`, `job_title`, `month`, `board_status`, `internal_deadline`, `publish_date`,
`description`, `copy`, `caption`, `brand_guidelines_url`, `reference_image_url`,
`submission_folder_url`, `file_format`, `production_category`, `complexity`

### `v_jobs` view
Same as `jobs` + `rate_auto` (computed: `base_rate × complexity_multiplier × deadline_multiplier`, capped per asset type). Used in `team-dashboard.html`.

## Deploy
```bash
# Just push — GitHub Actions handles the rest
git add -A && git commit -m "your message" && git push
# CI deploys to Cloudflare Pages project: theintgen-web
```

### Credentials (never commit)
- `CLOUDFLARE_API_TOKEN` — set in GitHub Actions secrets
- `CLOUDFLARE_ACCOUNT_ID` — set in GitHub Actions secrets

## Common Tasks

### Edit the job board
```bash
# Edit tiggigs/index.html or tiggigs/dashboard.html
git add -A && git commit -m "feat: ..." && git push
```

### Add a new subsite
Create a new folder (e.g. `tighq/`) with an `index.html`, push to main.

### Update _redirects routing
Edit `_redirects` — CF Pages reads this for path routing rules.

## Scattered Old Copies (IGNORE)
- `/Users/jaytesh/Desktop/TIG/TIGJobBoard-Deploy 13 may/`
- `/Users/jaytesh/Desktop/tiggigs devmode/`
- `/Users/jaytesh/TIGLancers Website/TIGJobBoard-Deploy/`
- Various `.zip` archives

## Legacy Repos (secondary — do not use as source of truth)
| Repo | Status |
|---|---|
| `The-Internet-Generation/tigital` | Separate standalone — may diverge |
| `The-Internet-Generation/tigpods` | Separate standalone — may diverge |
| `jaytesh-stack/tigos` | Old TigGigs — superseded by `tiggigs/` folder here |

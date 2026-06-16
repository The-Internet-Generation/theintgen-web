# theintgen-web — CLAUDE.md
# The Internet Generation (TIG) — Main Repo (Single Source of Truth)

## What This Repo Is
The ONE repo for all TIG web properties. All subsites live as subfolders here.
- **GitHub:** `The-Internet-Generation/theintgen-web`
- **Local clone:** `~/Documents/TIG/theintgen-web/`
- **Canonical local source (newest files):** `~/Documents/TIG/TIG Website files/`
- **CI/CD:** `.github/workflows/deploy.yml` → pushes to Cloudflare Pages project `theintgen-web`

## Mother Folder
All TIG codebases live under one parent:
```
~/Documents/TIG/
├── TIG Website files/      ← canonical working files (source of truth for edits)
├── theintgen-web/          ← THIS REPO — live site, all subsites
├── theintgen-os/           ← legacy Worker-based TIG OS (do not use as source of truth)
├── tigital/                ← standalone tigital repo
└── tigpods/                ← standalone tigpods repo
```

## Repo Structure
```
theintgen-web/
├── index.html                    ← TIG OS landing (responsive PC + mobile) — synced from local tig-os.html
├── _redirects                    ← Cloudflare Pages routing rules
├── .github/workflows/deploy.yml  ← GitHub Actions → CF Pages auto-deploy
├── public/assets/                ← logos
├── functions/                    ← CF Pages Functions (API routes)
├── m/
│   ├── index.html                ← Mobile portal (TIG OS phone UI)
│   └── icons/                    ← App icons (tigital, tigom, tigpods)
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
Canonical latest versions live at `~/Documents/TIG/TIG Website files/`.

### Sync local → repo
```bash
cd ~/Documents/TIG/theintgen-web
cp ~/Documents/TIG/TIG\ Website\ files/tig-os.html index.html
cp ~/Documents/TIG/TIG\ Website\ files/index.html tiggigs/index.html
cp ~/Documents/TIG/TIG\ Website\ files/dashboard.html tiggigs/dashboard.html
cp ~/Documents/TIG/TIG\ Website\ files/team-dashboard.html tiggigs/team-dashboard.html
git add -A && git commit -m "sync: update from local source" && git push
```

## Live Architecture
```
User → theintgen.com → Cloudflare Pages (theintgen-web)
                        → deployed by GitHub Actions on push to main
```

## Database: Supabase
- **URL:** `https://snlcskmszhbipinffwpy.supabase.co`
- **Anon key:** publishable — safe for browser use (stored in env or inline in HTML)
- All HTML pages query Supabase directly from browser — no backend needed

### `jobs` table columns
`job_id`, `job_title`, `month`, `board_status`, `internal_deadline`, `publish_date`,
`description`, `copy`, `caption`, `brand_guidelines_url`, `reference_image_url`,
`submission_folder_url`, `file_format`, `production_category`, `complexity`

### `v_jobs` view
Same as `jobs` + `rate_auto` (computed: `base_rate × complexity_multiplier × deadline_multiplier`). Used in `team-dashboard.html`.

## Deploy
```bash
git add -A && git commit -m "your message" && git push
```

### Credentials (never commit)
- `.env` at repo root (gitignored)
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`

## Common Tasks

### Edit the job board
Edit `tiggigs/index.html` or `tiggigs/dashboard.html`, then push.

### Add a new subsite
Create a new folder (e.g. `tighq/`) with an `index.html`, push to main.

### Update _redirects routing
Edit `_redirects` — CF Pages reads this for path routing rules.

## Other Repos (all under ~/Documents/TIG/)
| Repo | Local path | Notes |
|---|---|---|
| `The-Internet-Generation/theintgen-os` | `theintgen-os/` | Legacy Worker-based TIG OS |
| `The-Internet-Generation/tigital` | `tigital/` | Standalone tigital site |
| `The-Internet-Generation/tigpods` | `tigpods/` | Standalone tigpods site |
| `jaytesh-stack/tigos` | *(deleted)* | Old TigGigs — fully superseded |

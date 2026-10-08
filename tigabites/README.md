# Tigabites

The food & beverage marketing venture of TIG. Static HTML/CSS/JS, no build step.
Lives at `theintgen.com/tigabites`: copy this folder into `theintgen-web/` and push.

## Pages
| File | Menu label |
|---|---|
| `index.html` | Home (with a 5-second loading game: one of five, cycling per visit) |
| `first-bite.html` | First Bite: story, founder note, Kitchen Rules |
| `menu.html` | The Menu: services, packages, a la carte, FAQ |
| `work.html` | Clean Plates (`/tigabites/work`): menu board, sticky course bar, one row per show, Designs strip, case studies, brandfolio |
| `licked-clean-plates.html` | Retired; redirects to `work.html` |
| `kiss-the-chef.html` | Kiss the Chef?: order form → WhatsApp / email |

Nav, footer, munch rail, WhatsApp button, TIGOM radio and the offer pop-up are injected by
`assets/js/site.js` (edit `PAGES`, `TB.contact` and `TB.spotifyPlaylist` there).
Client logos live in `assets/img/logos/`.

## Clean Plates data and previews
- `assets/data/work-data.json` is the work page's only item source (copied from the `tigabites-website`
  skill). Add a post there and it shows up in the right row; counts update automatically.
- Course job lines and show hooks are the `COURSES` list at the bottom of `work.html`.
- Preview loops live at the repo root in `assets/tigabites/work/previews/<category>/<slug>.{webm,mp4,jpg}`
  (pages reach them via `../assets/tigabites/work/previews/`). Copy that folder into
  `theintgen-web/assets/tigabites/` along with this one. Regenerate with:
  `python3 ~/.claude/skills/tigabites-website/scripts/make_previews.py --out <repo>/assets/tigabites/work/previews`
- Missing previews show a purple chomper placeholder automatically.

## Handy URL flags
- `?drafts=1` outlines every placeholder in red with a note of what's needed
- `?loader=1` forces the loading game (it normally plays once per session on the home page)
- `?loader=1&game=0` … `game=4` picks a specific game: Snack Attack, Hop & Chomp, Lane Muncher, Whack-a-Snack, Power Pellet

## Still to fill (all marked `data-draft` in the HTML)
- TIGOM Spotify playlist link (`TB.spotifyPlaylist` in site.js)
- Tamil Paal case study details, Ramajeyam timeframe, brand categories in the brandfolio
- Package contents, budget ranges, lead inbox / form backend, consult booking link
- Founder video / voice-over, showreel

# Website Repo

11ty static site for `escapevelocity.consulting`. Deployed via GitHub Actions to a Caddy VM.

## Brand System Integration

The Brand Site at `/brand/` is **not** part of this repo. It's consumed from the separate **Brand System** repo via a git **submodule** at `_brand/`.

**Never edit anything under `_brand/`** — that's the brand repo. Edit there, push there, then bump the submodule pointer here.

### Layout

| Path | What | Notes |
|------|------|-------|
| `_brand/` | git submodule → brand repo, pinned to a commit | Don't edit. Don't commit changes inside. |
| `_brand/dist/site/` | Brand Distribution (built by `_brand/scripts/build-dist.sh`) | Must exist before `eleventy` runs. CI builds it. Locally use `npm run build:brand`. |
| `.gitmodules` | Submodule pin (path + URL) | The exact commit pinned lives in git itself, not in this file. |

### URL contract

The `.eleventy.js` passthroughs map the Brand Distribution into the website's output:

| Source (inside `_brand/dist/site/`) | Served at |
|-------------------------------------|-----------|
| `/*`           | `/brand/*`             |
| `/fonts/*`     | `/fonts/*`             |
| `/tokens.css`  | `/styles/tokens.css`   |

`/fonts/*` and `/styles/tokens.css` are served at the same paths the rest of the website already references (e.g. `styles/base.css` does `@import './tokens.css'` and `url(/fonts/space-grotesk.woff2)`). Don't change those references.

## Submodule commands

| Task | Command |
|------|---------|
| **Fresh clone of website** | `git clone --recurse-submodules <repo>` (or after a plain clone: `git submodule update --init --recursive`) |
| **Pull a brand update** | `git submodule update --remote _brand && git add _brand && git commit -m "bump brand"` then push |
| **Pin to a specific brand commit** | `cd _brand && git checkout <sha> && cd .. && git add _brand && git commit` |
| **See what brand commit is pinned** | `git submodule status` |
| **Rebuild brand dist locally** | `npm run build:brand` (or `cd _brand && npm ci && npm run build:dist`) |

## Local development

```
git clone --recurse-submodules <repo>
cd website
npm ci
npm run build:brand   # one-time; rerun whenever brand is bumped
npm run dev           # serve at http://localhost:3000/
```

If `/brand/` shows a 404, `_brand/dist/site/` doesn't exist — run `npm run build:brand`.

## CI

`.github/workflows/deploy.yml` triggers on push to `main`:
1. Checkout **with `submodules: recursive`** — without this, `_brand/` is empty and the build 404s `/brand/`.
2. `npm ci` (website deps)
3. `cd _brand && npm ci && npm run build:dist`
4. `npx @11ty/eleventy` (website build, which passes through the brand dist)
5. `gcloud compute scp _site/*` to the production VM

Whenever you bump the brand submodule pin, CI rebuilds dist from the new pin automatically. There is no need to commit `_brand/dist/`.

## Build configs

| File | When |
|------|------|
| `website/.eleventy.js` | Used by CI (`input: "."`, run from `website/`). |
| `business/.eleventy.js` | Used locally when developing from the parent dir (`input: "website"`). Mirrors the website config. Keep both in sync. |

## Pages

| Path | File | Purpose |
|------|------|---------|
| `/` | `index.njk` | Main landing page |
| `/quiz/` | `quiz/index.njk` + `scripts/quiz.js` | Digital-Check lead quiz |
| `/hi/` | `hi/index.njk` | Digital business card (no base layout/nav/tracking) |
| `/brand/` | _brand/dist/site/ (via submodule) | Brand Site — NOT in this repo |
| `/qr.png` | `qr.png` | Branded QR code → /hi/ |
| `/angebot/back-office-upgrade/` | `angebot/back-office-upgrade.njk` | Offer page |
| `/impressum/` | `impressum.njk` | Legal notice |
| `/datenschutz/` | `datenschutz.njk` | Privacy policy |

## Things that aren't here anymore

- `fonts/` — now served from `_brand/dist/site/fonts/` via passthrough. Deleted from this repo.
- `styles/tokens.css` — now served from `_brand/dist/site/tokens.css` via passthrough. Deleted from this repo.
- `brand/` — replaced by `_brand/` submodule. Deleted from this repo.

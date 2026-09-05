# flogal-websites — Claude Code rules

## What this is
Static multi-site public web presence, live in production on Vercel. Pure
HTML/CSS/JS, no build step, no dependencies.
Five sites, five Vercel projects: flogalhq -> flogalhq.com,
sales -> sales.flogalhq.com, carriers -> carriers.flogalhq.com,
properties -> properties.flogalhq.com, admin -> admin.flogalhq.com.
One push to main redeploys ALL FIVE projects — eyeball each after push.
This repo does NOT contain the apps platform (separate flogal-apps repo),
industrial/, rrtl/, or jd-hauling/.

## Serving model (load-bearing)
- sales/carriers/properties/admin projects are rooted at their sites/<name>
  folder. EXCEPTION: the flogalhq project is rooted at the REPO ROOT (root
  vercel.json rewrites / -> /sites/flogalhq/). Consequence: any new repo-root
  file or folder ships publicly on flogalhq.com unless listed in .vercelignore
  — adding one means updating .vercelignore in the SAME session.
- A site never references files outside its own folder. Pages use
  ../../shared/... paths that the browser clamps at the site root, so each
  site's LOCAL shared/ mirror is what actually serves. Mirrors are
  load-bearing; do not "clean them up".

## Shared assets (sync-script model — never hand-copy)
- Root shared/ is the single source of truth. Edit ROOT ONLY, then run
  `node scripts/sync-shared.mjs` to propagate to every sites/<site>/shared/
  mirror. Never hand-edit a mirror.
- `node scripts/check-shared-sync.mjs` byte-compares mirrors to root;
  RED = run the sync. Mirror-only extras are warnings, not failures.
- Never recreate, duplicate, or alter logos. Use existing shared/logos/ files.

## Hard rules
- NEVER run git add/commit/push (blocked by .claude/settings.json). Carlos
  reviews the diff and pushes manually.
- Do not touch _archive/ (blocked by settings).
- Do not create pages or links for rrtl, jd-hauling, or industrial sites.
  They do not exist yet; blocked until authority/compliance is confirmed.
- Do not change written copy beyond what link fixes and structural uniformity
  require. Public copy must never imply authority, licensing, or guarantees;
  entity/authority claims are STOP-AND-FLAG (adjudicated boundary lives in
  sites/CLAUDE.md).
- Fonts: Satoshi (self-hosted, shipped in shared/fonts/) + system-ui
  fallback; JetBrains Mono for data voice (stock #, VINs, stats). No paid
  fonts.

## Brand accents (backgrounds/structure stay uniform; accent varies)
flogalhq: tricolor symbol, white wordmark | sales: gold #C9A84C |
carriers: blue #4A90D9 | properties: green #4CAF7D |
admin: navy #0F172A + silver #94A3B8.
Per-site accent = ONE `:root{--accent:...}` override in the site's inline
<style>, placed AFTER the shared/css/tokens.css link so it wins. Never edit
brand.css for a single-site change. admin implements accent natively in
styles.css (role-based, JS-swapped) and does not link tokens.css.

## Page map (update this list when pages change)
flogalhq: index, about/ · sales: index (+ inventory.json) · properties: index
carriers: index, aggregate-hauling/, equipment-transport/, portal/ (mock
dashboard, ~27 inert buttons BY DESIGN), portal/login
admin: login (default route via rewrite), dashboard

## Verification loop (green = done; run after EVERY task)
`node scripts/check-links.mjs`        broken internal links/assets, empty
                                      hrefs, inert buttons, mailto/tel report
`node scripts/check-shared-sync.mjs`  mirror drift vs root shared/
Both must be GREEN. KNOWN GAP: check-links passes a reference that resolves
in EITHER serving context (clamped or repo-root), so it can miss
site-isolation escapes — eyeball isolation when adding cross-folder hrefs
(clamp fix queued).

## Deeper docs (read on demand, not auto-loaded)
- sites/CLAUDE.md — site isolation, entity separation in copy, inquiry-form
  source tags, tokens rules (auto-loads when working under sites/)
- docs/architecture/STRATEGY.md — durable architecture decisions + rejected
  alternatives; read before proposing structural changes
- README.md is STALE (May 2025, pre-restructure layout) — do not trust it
  for structure; trust this file.

## Output format when done
DONE
Files changed: [paths]
What changed: [bullets]
What to test: [bullets, per site]
Flags/SQL for Carlos: [only if any]
LESSONS: [only if any]
Next: Carlos reviews diff and pushes manually

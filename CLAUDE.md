# flogal-websites — Claude Code rules

## What this is
Static multi-site public web presence, live in production on Vercel.
Five sites, five Vercel projects, each rooted at its own sites/ folder:
flogalhq -> flogalhq.com, sales -> sales.flogalhq.com,
carriers -> carriers.flogalhq.com, properties -> properties.flogalhq.com,
admin -> admin.flogalhq.com.
This repo does NOT contain the maintenance app, apps/, industrial/, rrtl/,
or jd-hauling/ folders.

## Hard rules
- NEVER run git add, git commit, or git push (blocked by settings). Carlos pushes manually.
- Vercel serves each site from its sites/<name> folder only. A site can never
  reference files outside its own folder. Shared assets exist as local copies.
- When changing a shared asset or shared CSS: update root shared/ AND every
  affected site's local shared/ copy. Both, always.
- Do not recreate, duplicate, or alter logos. Use existing files in shared/logos/.
- Do not create pages or links for rrtl, jd-hauling, or industrial sites.
  They do not exist yet and are blocked until authority/compliance is confirmed.
- Do not change written content, headlines, or copy beyond what link fixes
  and structural uniformity require. No rewording, no new marketing copy.
- Public copy must never imply authority, licensing, or guarantees. If a link
  fix would require new copy with entity or service claims, stop and flag it.
- Do not touch _archive/ (blocked by settings).
- Satoshi (self-hosted) + system-ui fallback; JetBrains Mono for data voice
  (stock #, VINs, stats). No paid fonts. Amended 2026-07-09: Satoshi was
  already live in production and zero-cost (Fontshare OFL-equivalent
  license, files already shipped in shared/fonts/); ratified by Carlos,
  see ~/.claude/plans/model-fable-plan-glistening-aho.md §3.1.

## Brand accents (backgrounds/structure stay uniform; accent varies)
flogalhq: tricolor symbol, white wordmark
sales: gold #C9A84C | carriers: blue #4A90D9 | properties: green #4CAF7D
admin: navy #0F172A + silver #94A3B8

## Verification loop
This repo has no build step. The correction signal is the link checker:
`node scripts/check-links.mjs` (create it if missing). It must scan every
HTML file in sites/ and report: internal links to missing files, empty
hrefs (#, javascript:void), buttons with no handler or target, and
mailto:/tel: links. Zero broken internal links = green.

## Output format when done
DONE
Files changed: [paths]
What changed: [bullets]
What to test: [bullets, per site]
Flags for Carlos: [only if any]
Next: Carlos reviews diff and pushes manually
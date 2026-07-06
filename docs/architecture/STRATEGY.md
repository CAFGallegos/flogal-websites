# FLOGAL-WEBSITES — ARCHITECTURE STRATEGY BANK

Reference doc. NOT auto-loaded. Sessions read on demand. Purpose: preserve
durable reasoning about the multi-site architecture so no future session
re-derives it. Generated primarily by Fable 5 before 2026-07-07; maintained after.

Each section: OPEN QUESTION, DECISION, REASONING/tradeoffs, REJECTED ALTERNATIVES.

---

## 1. Shared-asset architecture at scale
OPEN QUESTION: Each site keeps a local shared/ copy because Vercel serves only
from site root, so any shared change must update BOTH root shared/ and every
site's local copy. This is a duplication footgun. Design the durable fix:
build-step sync, symlink strategy, monorepo package, or a shared CDN origin —
whichever holds at 8+ sites without breaking the per-site Vercel root model.

DECISION: Keep per-site local copies as the production model. Add a sync
script (`scripts/sync-shared.mjs`) that copies root `shared/` into every
`sites/<name>/shared/` from a per-site manifest, plus a drift check (checksum
compare, exit non-zero) that runs alongside `scripts/check-links.mjs`. Root
`shared/` is the single source of truth; site copies become generated output
that no session edits by hand.

REASONING:
- The dual-update rule has already failed in production terms: root `shared/`
  holds 62 files but all four full site copies hold 61 — `flogal-symbol-grey.png`
  (added to root Jul 2) was never propagated to `sites/*/shared/logos/`. Manual
  discipline demonstrably does not hold at 5 sites; it will not hold at 8+.
- The manifest matters because copies are intentionally NOT uniform:
  `sites/admin/shared/` carries a deliberate 17-file subset (fonts, favicons,
  two white logos), not the full 62. A naive "copy everything" sync would bloat
  admin; a manifest (`full` vs. explicit file list) preserves that.
- Every push redeploys all 5 Vercel projects anyway (no ignored-build-step is
  configured), so a sync that touches all site copies has zero extra deploy
  cost — the "5-projects-redeploy-on-one-push reality" argues FOR copy-sync,
  not against it.
- No build step exists in this repo (CLAUDE.md: the only signal is
  check-links), and the sync script keeps it that way: it is a repo-local
  Node script run in-session, same as check-links, not a CI/build dependency.
- Constraint that anchors everything: pages reference shared CSS as
  `../../shared/css/tokens.css` (e.g. sales/index.html line 7). In production
  the browser clamps `../../` at the domain root, so the request resolves to
  `/shared/...` INSIDE the site's Vercel root — i.e. the LOCAL copy is what
  actually serves. The local copies are load-bearing; any design that removes
  them changes production behavior.

REJECTED ALTERNATIVES:
- Symlinks (`sites/sales/shared -> ../../shared`): Vercel's static upload and
  git-on-Windows/WSL handling of symlinks are both unreliable, and a symlink
  is a site referencing files outside its root — the exact thing the isolation
  rule (sites/CLAUDE.md) forbids. Rejected.
- Shared CDN origin (assets.flogalhq.com as a 6th project): creates a runtime
  dependency of every entity's site on one origin, adds cache-invalidation
  ops, and puts cross-entity coupling on the request path. The repo's history
  (root vercel.json interception incidents 7c9ef41/616be8d/b9aed9d) shows
  cross-project routing is where this repo gets hurt. Rejected.
- Monorepo npm package / build-time bundling: requires introducing a build
  step to a repo whose doctrine and verification signal assume none. Rejected
  until a build step is justified on other grounds (see §4 threshold).
- Status quo ("update both, always" by hand): already drifted once with only
  5 sites and 62 files. Rejected by evidence.

## 2. check-links.mjs site-root clamping
OPEN QUESTION: The verification signal resolves ../ paths via filesystem rather
than clamping at site root — it can miss a site-isolation violation. Design the
clamp fix so the signal actually catches cross-site path escapes.

DECISION: Resolve hrefs in URL space, not filesystem space. For each link,
compute the page's path relative to its site root, resolve the href against it
with POSIX/URL semantics clamped at the site root (exactly what the browser +
Vercel do at the domain root), then check existence at
`sites/<site>/<clamped-path>`. Any href whose raw form escapes the site root
(`../` past root, or resolving into another site's folder) is additionally
reported as a new category `escapesSiteRoot` and counted in `totalBroken`
(exit 1), regardless of whether the clamped target exists.

REASONING:
- Current behavior (scripts/check-links.mjs lines 66–81): relative hrefs go
  through `path.resolve(fileDir, clean)` — pure filesystem resolution. So
  `../../shared/css/tokens.css` in sales/index.html is validated against ROOT
  `shared/`, but production serves the sales-local copy (browser clamps
  `../../` at sales.flogalhq.com's root, and the Vercel project root is
  sites/sales). The checker is green while validating the wrong file.
- This is not theoretical: `flogal-symbol-grey.png` exists in root shared/
  but in NO site copy. If any page referenced it via `../../shared/logos/...`,
  check-links would pass and production would 404. The clamp fix makes the
  checker validate the file that actually serves.
- Root-absolute hrefs are already clamped correctly
  (`path.join(siteDir, clean.slice(1))`, line 70) — only the relative branch
  needs the URL-space rewrite, so the change is small and localized.
- Making `escapesSiteRoot` a hard failure (not a warning) matches
  sites/CLAUDE.md: "treat any ../ as a BLOCKER anyway." The exit code is the
  correction signal (line 172 counts only brokenLinks + brokenAssets today);
  a category that doesn't move the exit code doesn't correct anything.

REJECTED ALTERNATIVES:
- Grep-ban all `../` in hrefs: every page today links
  `../../shared/css/tokens.css`, so this fails the whole repo until a mass
  HTML rewrite to root-absolute `/shared/...` paths lands. That rewrite is a
  reasonable future cleanup but must not be a precondition for fixing the
  signal. Rejected as the first move.
- Filesystem-resolve + reject anything outside the repo: still validates
  against root shared/ (wrong file) and still misses one site resolving into
  another site's folder. Rejected as insufficient.
- Report escapes as warning-only: warnings that don't flip the exit code
  don't stop a bad push; the signal must fail. Rejected.

## 3. Phase 5 sites architecture (rrtl / jd-hauling / industrial)
OPEN QUESTION: These are blocked until authority/DOT/MC/compliance language is
confirmed (Legal Counsel owns the copy). But the STRUCTURE can be designed now:
route trees, shared-token inheritance, inquiry source tagging (source='rrtl' /
'jd-hauling'), and how they slot into the existing 5-project Vercel model.

DECISION (COPY/authority claims -> Legal Counsel; structure only here):
Each new entity is a sibling folder + its own Vercel project, cloned from the
carriers pattern: `sites/rrtl/`, `sites/jd-hauling/`, `sites/industrial/`,
each with `index.html`, a local `shared/` copy populated by the §1 sync
manifest, one `--accent` override per §4, and an inquiry form posting to the
same Supabase `inquiries` table with `source` set to exactly the folder name
(`'rrtl'`, `'jd-hauling'`, `'industrial'`). No links from the existing five
sites until unblocked (CLAUDE.md hard rule). All copy ships as Legal-owned
placeholders; structure carries zero entity/authority claims.

REASONING:
- The sibling-folder-per-project model is the one thing in this repo proven
  in production five times over; new entities inherit it unchanged, so the
  Vercel model needs no modification to absorb three more projects.
- Entity separation is legal, not stylistic (sites/CLAUDE.md): RRTL and
  J&D Hauling are different legal entities from Flogal Carriers. A folder
  under an existing site would put one entity's pages under another entity's
  domain and project. Sibling folders keep the boundary physical.
- Source tagging: the existing convention is form-field `source` matching the
  site — `'sales'` (sales/index.html line ~931), `'hq'` (flogalhq),
  `'carriers'`, `'properties'` — inserted client-side into Supabase
  `inquiries` alongside `lead_source: 'website'`, `status: 'new'`. New sites
  follow the same single-field convention; no UTM machinery exists or is
  needed yet.
- STOP-AND-FLAG (Carlos decisions, architecture works under both answers):
  (a) DOMAINS — rrtl/jd-hauling as flogalhq.com subdomains vs. their own apex
  domains. As separate legal entities they may require separate apex domains;
  the folder/project structure is identical either way, only Vercel domain
  attachment differs. Do not attach domains without Carlos.
  (b) SUPABASE — whether the `inquiries` table constrains `source` values
  (check constraint/enum lives in flogal-apps' schema, not visible from this
  repo). Verify `'rrtl'`/`'jd-hauling'`/`'industrial'` are accepted BEFORE
  launching a form, else inserts fail silently client-side.
  (c) ACCENT COLORS for the three new brands — brand decision, not derivable.

REJECTED ALTERNATIVES:
- Subfolders of an existing site (e.g. sites/carriers/rrtl/): violates entity
  separation and the per-site Vercel root model. Rejected.
- One multi-tenant "brands" project with rewrites routing to three entities:
  re-creates the root-vercel.json interception failure mode that caused a
  production outage (b9aed9d restored root vercel.json after flogalhq.com
  went down). Rewrite-based multi-site routing is this repo's proven sharp
  edge. Rejected.
- Deferring structure until Legal clears copy: structure is copy-free; the
  folders, sync manifest entries, and source-tag conventions can be decided
  now so the legal unblock becomes a copy drop, not an architecture session.
  Rejected.

## 4. Design-token system across 5+ sites
OPEN QUESTION: tokens.css extends brand.css via @import with one --accent
override per site; admin keeps its native JS accent system. Does this scale to
8+ sites, and how do we keep brand consistency while allowing per-entity accent
without a build system? Where's the line before this needs tooling?

DECISION: The two-layer system (brand.css = all shared tokens; tokens.css =
thin @import + default `--accent`) scales to 8+ sites unchanged. Fix the one
structural wrinkle: per-site accent overrides currently live in inline
`<style>:root{--accent:...}</style>` blocks on each page (sales #C9A84C,
carriers #4A90D9, properties #4CAF7D; flogalhq takes the navy default). Once
§1's sync makes `sites/<name>/shared/` generated output, move each site's
override into ONE site-owned file outside shared/ (`sites/<name>/site.css`,
linked after tokens.css) so the sync never clobbers it and pages within a
site can't drift from each other. Admin stays as-is: standalone styles.css
plus the JS accent swap. The line before tooling: a build step becomes
justified only when sites need per-site VALUES beyond a single accent
(per-entity type scales, component-level theming) — i.e. when the override
stops being one custom property, not when site count grows.

REASONING:
- brand.css (root shared/css/) carries the full system — ~288 custom
  properties, 10 Satoshi @font-face rules — and is banned from per-site edits
  (sites/CLAUDE.md: "Never edit brand.css for a single-site change"). The
  accent is the ONLY sanctioned per-site variable, which is exactly why the
  system scales: adding a site costs one file with one rule.
- Inline per-page overrides are the current drift risk: flogalhq has two
  pages (index, about/) and Phase 5 adds multi-page sites; N pages × 1 inline
  block is N places for one accent to diverge. One site.css per site is one
  place. It also reconciles with §1: synced shared/ stays byte-identical to
  root, site identity lives outside it.
- Admin is a different kind of thing, not an inconsistency: its accent is
  runtime ROLE state — `setupUI()` in sites/admin/dashboard.html (lines
  ~506–514) sets `--accent` from an ACCENT map (holdings silver / sales gold /
  carriers blue / properties green) after login. That is per-user, per-session
  state and cannot be expressed as a static per-site token. Keep it native JS.
- FLAG for Carlos (doctrine vs. reality): repo CLAUDE.md says "Inter/system-ui
  only. No licensed fonts," but shared/css/brand.css ships 10 Satoshi
  @font-face rules and a JetBrains Mono CDN import (Fontshare/OFL licenses).
  One of the two is stale. Not resolved here — whichever is authoritative,
  the token architecture is unaffected.

REJECTED ALTERNATIVES:
- Build-time CSS generation (PostCSS/Sass per site): buys nothing while the
  per-site delta is one custom property, and breaks the no-build-step
  doctrine. Rejected until the stated threshold is crossed.
- Serving one canonical CSS from a shared origin: same cross-site runtime
  coupling rejected in §1, plus per-site accent would need query params or
  duplicated files anyway. Rejected.
- Migrating admin's JS accent into the static token system: loses the
  role-driven behavior (accent follows the logged-in user's role, not the
  site). Rejected.
- Per-page inline overrides forever (status quo): fine at 1-page sites,
  drift-prone the moment sites grow pages; already two multi-page sites.
  Rejected as the long-term form.

## 5. Static -> dynamic migration triggers
OPEN QUESTION: Sites are static today. Define the objective triggers that mean a
marketing site now needs a backend (forms beyond inquiry capture, gated content,
portals), and the migration path that doesn't break the Vercel-root model or
leak into flogal-apps' domain.

DECISION: Reframe: these sites are already client-dynamic — every form page
loads supabase-js from CDN and talks to project uzbpsppeihazicmngqqq with the
publishable key (inquiry inserts on all five sites, `inventory` reads on
sales, `auth.signInWithPassword` + role-gated dashboard on admin). The real
boundary is "publishable-key client-side Supabase under RLS" (stays here) vs.
"anything needing a secret, server-verified logic, or a service role" (goes
to flogal-apps or Supabase Edge Functions owned by flogal-apps). Objective
triggers that a feature has crossed the line: (1) it needs a credential
beyond the publishable key; (2) it needs server-side validation/rate
limiting/notification on submit (email-on-inquiry, spam control beyond RLS);
(3) it takes payments or file uploads; (4) it gates CONTENT on auth such that
RLS row filtering isn't sufficient (per-user documents, portals with private
data). Migration path when triggered: the endpoint/logic lands in flogal-apps;
the website keeps its static shell and calls the endpoint client-side. This
repo never gains a build step, server code, or secrets, and the per-site
Vercel root model is untouched because dynamism stays in fetch calls.

REASONING:
- The pattern already works in production: sales/index.html renders inventory
  from a Supabase `.select()` (with sites/sales/inventory.json as local data)
  and all five sites insert to `inquiries` client-side — proof that
  "static shell + RLS-scoped client calls" covers marketing-site needs
  without a backend in this repo.
- admin already sits exactly at the boundary: login + role-based UI reveal
  (`data-roles`, JS accent) is fine because RLS scopes the data; the moment a
  portal needs server-enforced logic (not just row filtering), trigger (4)
  fires and it belongs in flogal-apps.
- A portal shell already exists dormant in this repo:
  sites/carriers/portal/index.html — 27 buttons with no handler (check-links
  reports them all). When it's wired up, it is the first live test of these
  triggers: RLS-scoped reads keep it here; anything past that goes to
  flogal-apps per the path above.
- Keeping secrets out is structural, not preference: this repo's doctrine has
  no env handling, no build, and its only signal is a link checker — it has
  no way to verify server code. flogal-apps has tsc + build. Server logic in
  a repo that can't verify it is unverifiable by construction.
- STOP-AND-FLAG (Carlos decision, architecture holds under both): when a real
  customer portal arrives, does it live at admin.flogalhq.com (this repo's
  shell calling flogal-apps endpoints) or inside flogal-apps' own app
  surface? Both fit the model above; the choice is product/brand, not
  architecture. Do not pre-build either.
- NOTE on scope: Heidelberg agreement terms and payroll-provider choice
  appear nowhere in this repo (grep: zero hits for heidelberg/payroll) —
  those open questions belong to flogal-apps' strategy doc, and no decision
  here depends on them.

REJECTED ALTERNATIVES:
- Migrate sites to Next.js/SSR on Vercel: destroys the 5-project static-root
  model, adds a build step and a framework dependency to serve what is 95%
  static marketing content. Rejected.
- Vercel serverless functions inside this repo (api/ per site): puts secrets
  and server code in the repo with no typecheck/build signal, and blurs the
  flogal-apps boundary. Rejected.
- Moving all existing forms behind flogal-apps endpoints now: client-side
  insert with publishable key under RLS is working, attributable
  (source-tagged), and adequate; migrating without a trigger is unforced
  work and a new failure surface. Rejected.

---
MAINTENANCE: production incident or session LESSONS touching these -> update
here AND add the one-line hard rule to CLAUDE.md.

## 8. Standing guidance for future sessions
Candidate CLAUDE.md lines. Each grounded in this repo's actual code/history.

1. A `../` href only works in production by accident of browser URL clamping
   plus the local shared/ copy — validate and think in terms of
   `sites/<name>/` local files, never root `shared/` (check-links.mjs line 71
   currently resolves the wrong one).
2. Changing anything under root `shared/` means updating all five
   `sites/<name>/shared/` copies in the same session — the one time this was
   skipped, `flogal-symbol-grey.png` drifted out of every site copy.
3. `sites/admin/shared/` is a deliberate 17-file subset (fonts, favicons, two
   white logos), not an incomplete copy — never "fix" it to the full 62 files.
4. Root `vercel.json` is load-bearing for flogalhq.com (removing it caused
   the outage fixed in b9aed9d); never move, rename, or "clean it up."
5. Per-site identity is exactly one `--accent` override on top of the shared
   tokens.css -> brand.css chain; a change that needs editing brand.css for
   one site is the wrong change.
6. Admin's accent is runtime role state set by `setupUI()` in
   sites/admin/dashboard.html, not a brand token — leave it in JS.
7. An inquiry form's `source` value must exactly match the site it lives on
   ('sales', 'hq', 'carriers', 'properties') — a mismatch inserts fine and
   silently corrupts lead attribution in Supabase `inquiries`.
8. Only publishable-key, RLS-scoped client-side Supabase belongs in this
   repo; any feature needing a secret, service role, or server-side logic
   goes to flogal-apps.
9. New entities are sibling `sites/<name>/` folders with their own Vercel
   projects — never subfolders of an existing site, because RRTL, J&D
   Hauling, and the Flogal entities are separate legal entities.
10. `check-links.mjs` exits non-zero only on broken links/assets — the other
    categories it prints (empty hrefs, dead buttons, mailto/tel) still need a
    human read before DONE; green exit is necessary, not sufficient.

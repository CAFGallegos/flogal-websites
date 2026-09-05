# Shell drift audit — public marketing pages (2026-09-04)

**Scope.** The 7 public pages: `sites/flogalhq/index.html`, `sites/flogalhq/about/index.html`,
`sites/sales/index.html`, `sites/properties/index.html`, `sites/carriers/index.html`,
`sites/carriers/aggregate-hauling/index.html`, `sites/carriers/equipment-transport/index.html`.
Carriers portal and admin are out of scope (internal, intentionally different).

**Method.** Source read with `file:line` references, resolved through the token chain
(page inline `:root` → `shared/css/flogalhq-shell.css` (HQ) → `shared/css/brand.css`), plus a live
capture of every page on 2026-09-04 at 1440×900 and 390×844 (headless Chromium). Local `main` was
even with `origin/main`; nav labels, h1s, taglines and legal lines on the live pages matched the
source exactly, so **live == repo** — the drift below is structural, not a stale deploy.

**Decision context.** Carlos: the look is close to right; the problem is inconsistency. The fix
direction is "Direction A — Consolidated as-is": keep the current look, unify the anatomy. Copy
changes are **proposals for approval only**; nothing in §2 is applied.

**Severity.** `BUG` broken for users · `DRIFT` inconsistent between pages · `CLAIM-FLAG`
entity/authority/reach language, Legal owns it · `MECH` mechanical, no judgement needed.

---

## 0. Top findings

1. `BUG` **Placeholder phone numbers are live** on carriers, sales and properties (§2.1). Only HQ has a real number.
2. `BUG` **No navigation on phones** for `carriers/aggregate-hauling/` and `carriers/equipment-transport/` — no menu toggle, links hidden (§1.1).
3. `DRIFT` **Footer link labels promise sections that don't exist** ("Listings", "Yard Leasing", "Financing", "Trade-In") and **"Load Board" contradicts carriers' own "No load boards"** (§2.3).
4. `DRIFT` **Four header-CTA patterns, six hero scales, four button systems, four footer class families** for what is visibly one design (§1.1–1.4).
5. `DRIFT` **Legal name shipped two ways on every page**: footer `FLOGAL Holdings, LLC` vs JSON-LD `Flogal Holdings, LLC` (§2.2).
6. `DRIFT` Every page re-declares brand tokens inline; properties re-declares four with **different values** than `brand.css` (§1.6).
7. `MECH` JetBrains Mono is fetched from Fontshare on all 7 pages and **rendered on none** (`document.fonts` shows only Satoshi live) (§1.6).

---

## 1. Design drift

### 1.1 Header / nav

What is already consistent (keep): sticky 64px bar, `rgba(11,29,45,.94)` + `blur(12px) saturate(140%)`,
white wordmark `flogal-wordmark-only-white.png`, accent-coloured symbol at 30px, 14px/500 links at
78% white, hover white + underline offset 4px, 1440px container with 40px side padding.

| Page | Class | Links (order) | CTA slot | Division label | Bottom border |
|---|---|---|---|---|---|
| HQ index / about | `.nav` (shared shell) | Carriers · Sales · Properties · Apps · About · Contact | phone `(214) 702-1336` + outline "Request a Quote" | **none** | `rgba(255,255,255,.06)` |
| sales | `.sl-nav` | Home · Carriers · Properties · Inventory · Contact | solid gold "Request a Quote →" | "Sales" | `rgba(255,255,255,.06)` |
| properties | `.pr-nav` | Home · Carriers · Sales · What We Buy · Our Approach · Contact | ghost "Sign in" + solid green "List a property" | "Properties" | `rgba(255,255,255,.06)` |
| carriers ×3 | `.op-nav` | Home · Sales · Properties · About · Contact | outline "Partner Login" + solid blue "Request a Quote" | "Carriers" | **`#DDE3EC` solid** (`carriers/index.html:106`, light-scoped `--op-rule`) |

- `BUG` `carriers/aggregate-hauling/index.html:234` and `carriers/equipment-transport/index.html:226`
  have no `.op-nav-toggle` and no `.op-mobile-nav`; at 390px the link list is hidden by the ≤860 rule
  and nothing replaces it. Live check: `hasToggle:false, visibleNavLinks:0` on both. The hub
  (`carriers/index.html`) has the toggle.
- `DRIFT` Four CTA-slot patterns. HQ's primary action is an outline button (no filled primary in the
  header or hero), so HQ's call to action reads as secondary next to the three solid accent buttons.
- `DRIFT` Sibling-site order differs on every page (Carriers·Sales·Properties / Carriers·Properties /
  Carriers·Sales / Sales·Properties). "About" means the HQ page on HQ but a local section on carriers.
  "Apps" appears only on HQ. Sales and properties have no About at all.
- `DRIFT` HQ omits the division label the other three carry; the label is what tells a visitor which
  company they are on.
- `DRIFT` Carriers' nav border is a solid light grey on a dark bar (`#DDE3EC`) because `.op-nav` is not
  in the night-scope list (`carriers/index.html:64-74`); the other three use 6% white.
- `DRIFT` Link colour: `.78` white (HQ, sales), `.74` (properties, 13px), `.70` (carriers). Header
  inner gap 48/36/40/40.

### 1.2 Hero

| Page | Pattern | h1 (live, 1440) | Eyebrow | CTAs | Height |
|---|---|---|---|---|---|
| HQ index | photo + veils + 3 division cards + proof strip | 72px / **700** / −0.02em | plain uppercase silver, no rule | 1 outline | min 700 + cards |
| HQ about | photo + veils, "Scroll to explore" | 72px / **900** / −0.03em | `.hero-label` gold **with** dash rule | **none** | ~640 |
| sales | **no hero** — subtitle bar + 48px navy title on paper + 3 proof cards | 48px / 700 / −0.015em | none | none (nav only) | — |
| properties | gradient; right 58% reserved for a photo that **does not exist** | 76px / 700 / −0.025em | green with dash rule | 1 solid + 1 ghost | min 680 |
| carriers | gradient + animated glow + grid + 4-stat strip | **92px** / 700 / −0.03em | blue with dash rule | 1 solid + 1 ghost | pad 112/96 |
| carriers subpages | gradient + grid | 60px / 700 / −0.03em | blue with dash rule | 1 solid + 1 ghost | pad 112/96 |

- `DRIFT` Six h1 scales across seven pages; about is the only 900-weight display in the system.
- `DRIFT` The dash-rule eyebrow (22px rule + 12px/700/.14em uppercase) is used on 5 of 7 pages; HQ
  index (`.eyebrow`, `flogalhq/index.html:124`) and about (`.hero-label`) each use a different class
  for the same element.
- `DRIFT` `properties/index.html:104` `.pr-hero-photo` holds only a CSS fallback gradient; live, the
  right half of a 680px hero is empty. Either a photo is missing or the layout should not reserve
  58% for one. (Photo choice is Carlos's — flagged, not decided.)
- `DRIFT` HQ is the only site with photography; the three operating sites are gradient-only, which
  is the single biggest reason the subsites read as "templates" next to HQ.
- `DRIFT` Sales' gold `.sl-subtitle` bar (`sales/index.html:100`) is a one-off element no other site has.

### 1.3 Buttons

`brand.css:438-462` defines `.btn / .btn-primary / .btn-outline / .btn-ghost / .btn-inverse`. **No page
uses them.** HQ's `class="btn-outline"` (`flogalhq/index.html:382`) is a same-named local rule at
`:88-91` that overrides the shared one.

| Site | Primary | Padding | Font | Radius | Shadow |
|---|---|---|---|---|---|
| HQ | `.btn-outline` glass outline, white text | 11px 24px | 600 14px | 6px | none |
| HQ form | `.form-btn` solid navy, uppercase .1em | 14px 24px | 700 15px | 6px | inset + 2-layer |
| sales | `.sl-btn-gold` / `.sl-cta` solid gold, navy text | 10px 16px / 9px 18px | 700 13px | 6px | inset + 2-layer |
| properties | `.pr-cta-green` solid green, navy text | 9px 18px | 700 13px | 6px | inset + 2-layer |
| carriers | `.op-btn-blue` solid blue, navy text | 11px 20px | 700 14px .02em | 6px | inset + 2-layer |

- `DRIFT` Five paddings, three font sizes, two weights for "the primary button". Radius (6px) and the
  inset+2-layer shadow recipe are already shared by three sites — those are the values to keep.
- `DRIFT` Ghost/secondary: HQ `rgba(168,184,200,.4)` border; properties `rgba(255,255,255,.28)`;
  carriers `.28`; sales ghost is white-filled with `#B7C0CC` border (light context).

### 1.4 Footer

Already consistent (keep): `#050A12` ground, 4px accent bar (tricolor gradient on HQ, solid accent
elsewhere), 260px brand column + 4 link columns (`grid 260px 1fr; gap 56px`), symbol 32px +
wordmark 20px @ .9, tagline 14px/.55 white/max 220px, five 18px social icons (inert, by design),
mono 11px bottom row with the domain strip, legal line and "Staff Login".

| Page | Class | Col heading | Link colour | Top-row border | Domains markup |
|---|---|---|---|---|---|
| HQ | `.footer` | 10px **#FFF** | `.48` white | none (border on bottom row) | one span, no rule |
| sales | `.sl-footer` | 10px **.35 white** | `.55` | on top row | `.sl-footer-domains` |
| properties | `.pr-footer` | **11px #FFF** | `.62` | none (border on meta row, full width) | 4 spans + `.pr-footer-dot` |
| carriers | `.op-footer` | 10px .35 white | `.55` | on top row + extra `#25344A` border on shell | `.op-footer-domains` |

- `DRIFT` Three heading treatments, three link greys, two border placements, four domain-strip
  implementations for byte-identical content.
- `DRIFT` Sales' "Equipment" column has one link where every other column has three
  (`sales/index.html:611`) — visibly lopsided live.
- `DRIFT` Properties' legal row is a sibling of the inner wrapper (`properties/index.html:184`), so
  its rule spans edge-to-edge while every other site's sits inside the container.
- `MECH` `carriers/index.html:284` hover rule targets `.op-partner-link`, a class that does not exist;
  the Staff Login link has no hover on carriers pages.
- `MECH` `©` is `&#169;` on HQ/sales/properties and a literal `©` on the three carriers pages.

### 1.5 Type, rhythm, cards

- `DRIFT` Body: 16px (HQ, properties) / **14px** (sales) / **15px** (carriers). Body colour
  `#0B1D2D` / `#0B1320` / `#1A2535` — three navies for one text colour.
- `DRIFT` Section padding: `--sec-y` (96) / `--sec-y-lg` (112) used on HQ, properties, carriers;
  sales hardcodes 56/24; about hardcodes. `--container-max` and `--header-h` (`brand.css:508-521`,
  "locked, all five sites") are used by **zero** pages; each hardcodes 1440/64.
- `DRIFT` Cards: radius 10 (HQ `.svc-card`, sales `.sl-tile`) vs 12 (properties `.pr-type-grid`,
  carriers `.op-pillar`); border `#C6CFDA` (HQ, sales) vs `#DDE3EC` (properties, carriers). Three
  accent idioms: none (HQ), top-left 3×56 bar (carriers hub `:156`), full-height left bar (carriers
  subpages, see live capture), 2px top rule on step headings (properties `.pr-process-step h4`).
- `DRIFT` Section eyebrows: HQ plain grey uppercase ("OPERATING DIVISIONS"); others accent-coloured
  with dash rule.

### 1.6 Token hygiene and fonts

- `DRIFT` Inline `:root` blocks re-declare 12–39 brand tokens per page as literals
  (`flogalhq/index.html:22-35`, `about:23-27`, `sales:25-65`, `properties:25-53`,
  `carriers:25-61`, subpages `:27-58`). Properties **changes values**: `--green-400 #2D7A56` (brand
  `#2E7A55`), `--green-700 #0D3D27` (`#0E4127`), `--ink-900 #0B1D2D` (`#0B1320`), `--ink-400
  #8A9AB5` (`#94A3B8`). STRATEGY.md §4 L215–217 already rejects "inline overrides forever".
- `DRIFT` `shared/css/flogalhq-shell.css:29` reads `var(--night)`, which only the two HQ pages define
  inline — the shared shell cannot be dropped onto another page as-is.
- `MECH` `shared/css/hq.css` (213 lines) is linked by no page and mirrored into all five sites.
- `MECH` `brand.css:39` `@import`s JetBrains Mono from `api.fontshare.com` on every page that links
  tokens.css. Live `document.fonts` reports only **Satoshi** loaded on all 7 pages; the one rule that
  asks for it (`flogalhq/index.html:86` `.hero-caption`) falls back. Sales/properties/carriers
  override `--font-mono` to a system stack; HQ's footer bottom row uses the bare keyword `monospace`.
  Either use it (the "data voice" per CLAUDE.md) or drop the request.
- `MECH` Sales, properties, carriers ×3 request Satoshi **300 Light** inline; `brand.css:9-12` says the
  family was trimmed to 400/500/700/900. `shared/fonts/Satoshi-Light.otf` exists, so it works, but
  the two declarations disagree.
- `MECH` No `preconnect`/`preload` for fonts anywhere.

### 1.7 Assets

- `MECH` `shared/logos/flogal-wordmark-navy.png` is **2.06 MB** and `shared/photos/hero-truck-sunset.png`
  **2.34 MB**; neither is referenced by any page, both are mirrored into every site.
- Referenced logo set is tidy: one symbol per accent at 30/32px, `flogal-wordmark-only-white.png`
  everywhere, `flogal-symbol-navy.png` in HQ's division cards. No SVG versions exist.

---

## 2. Copy drift — proposals for approval (nothing applied)

### 2.1 `BUG` Placeholder contact numbers in production — **STOP-AND-FLAG, values needed from Carlos**

| Page:line | Live text | Note |
|---|---|---|
| `carriers/index.html:759` | `+1 (903) 555-0140` | quote section, ops desk |
| `carriers/index.html:794` | `+1 (903) 555-0173` | quote section |
| `sales/index.html:689` | `+1 (555) 000-0000` | |
| `sales/index.html:1012` | `+1 (713) 555-0199` | |
| `properties/index.html:557` | `+1 (555) 000-0000` | |
| `flogalhq/index.html:343,361`, `about:227,245` | `(214) 702-1336` with `tel:+12147021336` | the only real-looking number; only HQ has `tel:` links |

`555-01xx` and `(555) 000-0000` are reserved/fictional ranges. No replacement is proposed — the real
numbers are undecidable from the repo. Related: `carriers/index.html:771` street address
`2400 N. Stemmons Fwy` — unverifiable here, please confirm. Two carrier inboxes are in use:
`carriers@flogalhq.com` (8×) and `ops@carriers.flogalhq.com` (1×, `carriers/index.html`).

### 2.2 `DRIFT` Legal name casing

Footer legal line on all 7 pages: `FLOGAL Holdings, LLC`. JSON-LD `name` on the 5 pages that carry
it (`flogalhq/index.html:270`, `about:202`, `sales:324`, `properties:241`, `carriers:336`):
`Flogal Holdings, LLC`. Prose everywhere: `Flogal`. Wordmark alt text: `FLOGAL`.

**Proposed:** the wordmark stays `FLOGAL` (it is a logotype). Legal line and JSON-LD use the
registered spelling — I assume `Flogal Holdings, LLC` because every sentence of prose uses title case
and structured data should match the registration exactly. **Confirm the registered spelling before
applying**; if it is all-caps, flip the JSON-LD instead.

### 2.3 `DRIFT` Footer columns: labels vs what exists

Identical headings (Carriers / Equipment / Properties / Company) on all 7 pages, but the links under
them differ and several describe things the destination page does not have:

| Label | Appears on | Destination | Problem |
|---|---|---|---|
| Load Board | HQ, about, sales, properties | carriers root | `carriers/index.html:457` stat reads **"No load boards"**; `:568`, `:839` repeat it. Direct contradiction. |
| Listings | HQ, about, sales, carriers ×3 | properties root | properties is a buyer ("We buy the ground"); page has no listings section (0 occurrences). |
| Yard Leasing | HQ, about, sales, carriers ×3 | properties root | no such section on properties (0 occurrences). |
| Financing / Trade-In | HQ, about, properties, carriers ×3 | sales root | neither word appears on the sales page. |
| Partner Portal (sales, properties) vs Partner Login (HQ, carriers) | | carriers portal | two names for one destination. |
| Contact | sales, carriers | `mailto:` | HQ/properties "Contact" go to on-page forms. |

Carriers column has three variants: HQ = Load Board / Request a Quote / Partner Login; sales &
properties = Load Board / Active Lanes / Partner Portal; carriers = Our Fleet / Active Lanes /
Equipment (+ two subpage links on the hub).

**Proposed canonical footer (same on all 7 pages; every label maps to a real destination):**

| Carriers | Equipment | Properties | Company |
|---|---|---|---|
| Aggregate Hauling → `carriers…/aggregate-hauling/` | Inventory → `sales…/#inventory` | What We Buy → `properties…/#what-we-buy` | About → `flogalhq.com/about` |
| Equipment Transport → `carriers…/equipment-transport/` | Request a Quote → `sales…/` (opens quote) | Our Approach → `properties…/#approach` | Contact → `flogalhq.com/#contact` |
| Request a Quote → `carriers…/#quote` | Contact → `mailto:sales@flogalhq.com` | Sell Us Your Site → `properties…/#contact` | flogalhq.com → `flogalhq.com` |
| Partner Login → `carriers…/portal/login.html` | | | |

"Load Board", "Listings", "Yard Leasing", "Financing", "Trade-In" are dropped until a page exists for
them. Column heading "Equipment" could read "Sales" to match the division name — your call.

### 2.4 `DRIFT` Nav link sets and order

**Proposed pattern:** lockup + division label, then the three operating companies **always in the same
order** — Carriers · Sales · Properties — with the current site's own label linking to its root (it
is the "Home"), then About → `flogalhq.com/about` (one meaning everywhere), then Contact → the local
form/quote. Local section links (Inventory, What We Buy, Our Approach) stay in-page (hero CTAs,
section links) rather than in the top bar, or sit after the sibling set — your preference.

Open questions: keep "Apps" (only HQ links `apps.flogalhq.com`)? Does HQ get a division label
("Holdings")? Keep the HQ phone number in the bar (only HQ has one)?

### 2.5 `DRIFT` CTA label vs destination on HQ

HQ nav and about nav: "Request a Quote" → `#contact`, whose heading is **"Request an Introduction"**
(index) / **"Get in touch"** (about); HQ sells nothing directly. **Proposed:** HQ header CTA reads
"Get in Touch" (already the hero CTA text on index) and the quote wording stays on the operating
sites where a quote form exists.

### 2.6 `MECH` Encoding

- `J&amp;D Hauling` and raw `J&D Hauling` both occur in `flogalhq/index.html` and `carriers/index.html`;
  raw `&` is invalid HTML. **Proposed:** `&amp;` everywhere (renders identically).
- `©` → use `&#169;` or the literal consistently (no visible change).

### 2.7 `CLAIM-FLAG` Reach and entity language — Legal owns these; no wording proposed

- "nationwide": carriers footer tagline (`carriers/index.html:881`, `aggregate:338`, `equipment:326`)
  "Asset-based hauling — nationwide reach through our vetted partner network"; HQ FAQ
  (`flogalhq/index.html:303,503`) "nationwide over-the-road and US–Mexico cross-border freight
  experience". The hero and stat strip on the same carriers page scope to "Oklahoma–Texas corridor"
  and "U.S. + Mexico network". The "through partners" form matches the cleared phrasing in
  `sites/CLAUDE.md`; whether "nationwide" itself is cleared is not recorded.
- RRTL / J&D: hub mentions RRTL 11× and J&D 7×; `aggregate-hauling` RRTL 6× ("run daily by our owned
  fleet, RRTL"); `equipment-transport` mentions **neither** owned fleet. If flatbed is run by one of
  them, the page is silent; if not, fine. Entity attribution is not mine to decide.
- HQ FAQ "Flogal operates asset-based carriers through J&D Hauling and RRTL. It is not a freight
  broker." — consistent with carriers' "No brokers" positioning; noted as the sentence the footer
  "Load Board" label contradicts.

### 2.8 Taglines (probably intentional — confirm)

HQ "Asset-backed across the freight stack." · sales "Equipment sales and leasing, operator-direct
from working freight yards." · properties "Industrial real estate built around freight — yards,
terminals, and last-mile sites in the corridors our trucks run." · carriers "Asset-based hauling —
nationwide reach through our vetted partner network." Per-site taglines are fine as a system; only
the "nationwide" wording is flagged above.

---

## 3. Live capture summary (2026-09-04)

| Page | h1 live | Header | Footer legal | Fonts loaded | Mobile nav |
|---|---|---|---|---|---|
| flogalhq.com | 72px/700 | `.nav` 65px | © 2026 FLOGAL Holdings, LLC | Satoshi | toggle ✓ |
| /about/ | 72px/900 | `.nav` | same | Satoshi | toggle ✓ |
| sales | 48px/700 navy | `.sl-nav` | same | Satoshi | toggle ✓ |
| properties | 76px/700 | `.pr-nav` | same | Satoshi | toggle ✓ |
| carriers | 92px/700 | `.op-nav` | same | Satoshi | toggle ✓ |
| /aggregate-hauling/ | 60px/700 | `.op-nav` | same | Satoshi | **none** |
| /equipment-transport/ | 60px/700 | `.op-nav` | same | Satoshi | **none** |

No console errors on any page; sales logs `[inventory fetch] rowCount: 5`. Page heights: HQ 4734,
about 4933, sales 2977, properties 3445, carriers **7465**, subpages ~2450.

Prior audit: `scripts/_audit/FINDINGS.md` (link-level, GREEN). This document covers shell/design/copy
consistency and does not repeat link findings.

---

## 4. Canonical shell for Direction A (values chosen from the existing majority)

Feeds the follow-on implementation plan; nothing here is applied yet.

- **Header**: 64px sticky, `rgba(11,29,45,.94)` blur 12px sat 140%, border-bottom 1px
  `rgba(255,255,255,.06)`; lockup symbol 30px + 1px divider + wordmark 23px + division label
  11px/600/.12em uppercase in accent; links 14px/500 `.78` white, gap 28px; **one** CTA slot: solid
  accent button + optional ghost utility (Partner Login / Sign in); HQ keeps the phone.
- **Primary button**: solid accent, navy text, `padding 10px 18px`, 700 13px (14px in hero), radius 6,
  shadow `inset 0 1px 0 rgba(255,255,255,.18), 0 1px 2px rgba(5,10,18,.30), 0 2px 6px rgba(5,10,18,.18)`,
  hover brighten 6% + −1px. **Ghost**: transparent, white text, `1px solid rgba(255,255,255,.28)`.
  On light sections: white fill, `#C6CFDA` border. Map these onto `brand.css` `.btn-primary/.btn-ghost`.
- **Eyebrow**: 22px rule + 12px/700/.14em uppercase, accent colour (silver on HQ).
- **Hero**: night ground, h1 Satoshi 700, `clamp(48px, 4.5vw + 0.6rem, 72px)` (= `--t-display`),
  line-height 1.02, tracking −0.02em, accent-coloured final period; lede 18px `.76` white max 540px;
  padding 112px top / 96px bottom; one primary + one ghost CTA.
- **Footer**: as today's shared structure; headings 10px/700/.22em uppercase `.35` white; links 13px
  `.55` white → white on hover; top-row border-bottom `rgba(255,255,255,.07)` inside the container;
  bottom row mono 11px `.3` white; domain strip one span.
- **Body**: 16px / 1.62 / `#0B1D2D` on `#F6F7F9`; sections `--sec-y` 96 / `--sec-y-lg` 112; cards
  radius 10, border `#C6CFDA`, hover lift 2px + `0 8px 24px rgba(11,29,45,.10)`.

# Flogal design standard

flogalhq.com is the approved look. This file records what its code does, so sales, properties and carriers
can match it. Source of truth: `shared/css/` and `sites/flogalhq/`. If this file and the code disagree,
the code wins; fix this file.

## 1. Colors and tokens

| Role | Value | Use |
|---|---|---|
| Tricolor | `#0A72CF` blue, `#EFA01A` gold, `#068A44` green | footer bar, glass tints, vivid symbols |
| Accent per site | HQ tricolor, sales gold, carriers blue, properties green | one `--accent` override per site |
| Admin | navy `#0F172A`, silver `#94A3B8` | admin only, own implementation |
| Navy / night | `#0B1D2D` / `#050A12` | bars, primary button / hero, dark bands, footer |
| Paper / panel | `#F6F7F9` / `#EEF2F6` / white | light sections, alternate band, fields |
| Text on light | `#0B1D2D`, muted `#4A5563` | headings, then body, labels and eyebrows |
| Hairline | `#C6CFDA` | rules, field borders |
| Silver | `#A8B8C8` | dark grounds only (about 2:1 on light) |
| Gold text on light | `#896713` (`--glass-ink-light-gold`) | small gold labels |
| Division ink, light | `#0968BD`, `#896713`, `#01783B` | card tags and links |
| Division ink, dark | `#4D9BE0`, `#EFA01A`, `#3FAB72` | over night; phones over photo `#78B4EC`, gold, `#4FBC82` |
| Tile titles on photo | `#BCDAF3`, `#F8D8A0`, `#9BD3B6` | hero tiles |

Files: `brand.css` (primitives, `--t-*` type sizes, section rhythm), `tokens.css` (imports brand, adds
`--accent`), `flogalhq-shell.css` (nav, footer), `glass.css` (material, focus, shared fixes). Pages declare
local neutrals in their own `:root`. `brand.css` also holds an older, muted gold, blue and green
(`#C79A2B`, `#1E4B8F`, `#165E3A`): the first still marks small labels on dark, the second in-text links.
Do not use that set for new accents or tints.

Fonts: Satoshi 400/500/700/900, self-hosted, with system-ui fallback. Monospace only for data (photo
caption, footer bottom line).

## 2. Glass

| Class | What it is |
|---|---|
| `.glass` | full glass: blur, translucent fill, 1px edge, highlight, shadow |
| `.glass-lite` | flat glass: no blur, no shadow, for flat grounds |
| `.on-light` | light variant, used with `.glass-lite` |
| `.glass-ctl` | control: 10px radius, lit top edge, sheen |
| `.glass--photo` | clear glass over a photo |
| `.glass-primary` | solid navy |
| `.glass--blue/gold/green` | division tint and ink |

- **Blur** only over photos or content that scrolls behind. One blur per stack; never nest. Flat ground = `.glass-lite`.
- Blur values: `blur(16px) saturate(160%)` (glass, nav, menu, phone tiles). Phone hero only: scrim
  `blur(18px) saturate(140%) brightness(.7)`, photo note `blur(16px) saturate(160%) brightness(.5)`, and a
  static `filter:blur(22px)` on the soft photo copy.
- Fills: full `rgba(11,29,45,.50)`; nav and menu `.72`; over photo `rgba(5,10,18,.15)`; flat dark white `.05`; flat light white `.72`.
- Tints (rest / hover): neutral 0 / 6%; dark division 14 / 18%; light 6 / 18%; photo 3 / 5%.
- Edge: white `.16`, hover `.28`. Light: navy `.12`, hover `.22`.
- Lit edge: `inset 0 1px 0` white `.18` (cards) or `.30` (buttons, photo glass; photo tiles mix 30% tint in).
- Sheen (controls, photo glass): white `.07` to 0 at 45%. Shadow (full glass only): `0 8px 24px rgba(5,10,18,.24)`.
- Corners: panels 14px, controls 10px. Form fields 6px.

**Fallbacks.** No `backdrop-filter`, or reduced transparency: surfaces turn solid (bar and menu `.98` navy,
flat dark `.96`, light white, photo glass `.85`), division inks return to the full dark set, pinned phone tile
labels go white. Reduced motion: no glass transitions, stacked phone hero, no hero reveal.

**Safari.** Pair every `backdrop-filter` with `-webkit-backdrop-filter`, and `mask-image` with its prefix.
Write blur values literally (a `var()` value can be dropped). Gate `color-mix()` in `@supports`. A finished
transform or opacity animation still blocks blur inside it: remove the animation when it ends.

## 3. Type

Home page values unless a row says otherwise.

| Role | Desktop | Phone (860px and under) |
|---|---|---|
| Eyebrow | 12 / 700 / .14em caps | same |
| H1, home hero | `--t-display` 48–72 / 700 / 1.05 / -.02em | 32 / 1.08, balanced |
| H1, About hero | 72 / 900 / .95 / -.03em | 48 |
| H1, text pages | 44 / 900 / 1.1 | 44 |
| H2 | 40 / 700 / 1.15 / -.015em | 30, balanced |
| H3, card title | 22 / 700 / 1.2 (FAQ and growth cards 18) | same |
| Lede | 18 / 400 / 1.6 | 15 / 1.55 |
| Body | 14–16 / 1.6–1.75, measure about 62ch | 16; secondary 14–15 |
| Labels | 12 / 700 / .04–.14em caps | 12 / .12em |
| Footer | links 13, headings 10, bottom line 11, Staff Login 10 | links 14; headings, bottom line, Staff Login 12 |
| Fields | 14 | 16 (stops iOS zoom) |

Floor: **12px**. 11px only for photo labels (hero caption, phone photo label). The footer is the exception (section 7).

## 4. Buttons, links, focus

| Kind | Rest | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary (`glass-lite glass-ctl glass-primary`), all form submits | solid navy, white, edge navy `.40` | edge `.62` | edge `.40` | fill navy `.08`, text `#3D4856`, no light or sheen |
| Glass on photo (`glass glass-ctl glass--photo`) | white `.05`, lit edge, sheen | 6% tint, edge `.28` | tint back | not used |
| Flat glass on dark (`glass-lite glass-ctl`) | white `.05` | 6% tint, edge `.28` | tint back | opacity `.6` |

Hover changes tint and edge only: no lift, no new shadow. Padding 9–13px by 20–24px; 44px tall on phones.

Text links: nav white `.78` to white, underlined (4px offset). Footer white `.48` to white, underlined. Footer
bottom line white `.30`; Staff Login white `.22`, hover `.55`. Card links: division ink, 700, underline on hover.
In-text links: blue, underlined. Phone hero link: underline `.40` to solid white.

**Focus** (in `glass.css`, keyboard): light grounds, 2px `#0A72CF` outline with a white 2px halo; dark grounds,
white outline with a navy halo. Text fields on light: solid blue border plus 1px blue ring. Never a faint
silver or translucent ring. A new dark section must be added to the dark focus selector.

## 5. Hero

**Desktop.** Words left, photo right, left-side navy shade. From 861 to 1366px the shade stops get pixel floors
(`max(26%,300px)` and so on) so they keep covering the words. Lede white `.86`, eyebrow white `.90` on the home
hero. Photo caption: white `.86`, each line on its own `rgba(5,10,18,.62)` chip, 10px corners.

**Phone** (home page; needs no reduced motion and `overflow:clip`):
- Photo pins under the 64px nav and fills the screen (`100lvh - 64px`). Sharp photo uses 68% of that height with
  the sky cropped; a soft blurred copy continues below and loads after the main photo.
- At rest only a light low shade (`.30`). Scroll builds one scrim (`rgba(5,10,18,.4)` plus blur) from 0 to `.84`,
  fast over the first 30%. `animation-timeline: scroll()`, with a one-variable JS fallback.
- The photo grows slowly after the first 20% (to 1.75). Short landscape screens use their own, darker curve.
- Words and three equal see-through tiles scroll over it (`minmax(0,1fr)`, one-line fluid titles). The hero
  button becomes a quiet text link.
- Photo label bottom right (11px, icon, 45px hit area). Tapping it or the photo opens a small note with the full
  credit, including any image-edit disclosure; text is copied from the desktop caption. Closes on scroll,
  outside tap or Escape.
- Without JS the caption shows. Reduced motion or no `overflow:clip`: stacked layout (photo band, words and tiles
  on night). No blur: a plain navy scrim.

## 6. Contrast

- Text 4.5:1. Large text (24px, or 18.66px bold), UI parts and focus rings 3:1.
- Measure against what the thing sits on, with alpha composited. Over a photo use the worst pixel in each line box.
- Check every state (rest, hover, focus, touch, disabled) and every scroll position over photos (40px steps;
  parallax moves the picture) at 390, 861, 900, 1024, 1280, 1366, 1440, 1920 and 2560, in Chromium and WebKit.
- White `.86` on a `rgba(5,10,18,.62)` chip holds 4.5:1 over any photo pixel.
- Headless Linux WebKit paints no blur: confirm glass in Chromium and on a real iPhone.

## 7. Guardrails

- Restraint: one blur, one border, one highlight, one shadow per surface.
- No glows, gradient borders or colored shadows. No grain, lift, refraction or animated blur on glass.
- Subtle tints; color comes from symbols and labels.
- Only the hero photo moves. The one entrance is the hero reveal; the growth band's radial layer is static.
- No card grid leaves an empty cell at any width. No horizontal overflow at any width.
- **Quiet footer, by design.** The column headings, bottom line and Staff Login stay small and faint (sizes in
  section 3, colors in section 4), under the contrast and size rules. This applies to those footer items only.
- Signature details to keep: tricolor footer bar, About pull-quote rule, eyebrows, uppercase proof titles.
- `glow.css` belongs to the admin login only.

## 8. Applying it to a site

1. Link order: `tokens.css`, the site's shell, inline `<style>` (with `:root{--accent}` and local neutrals
   including `--night`, `--silver`, `--fg-muted`, `--navy-050`), then `glass.css` last.
2. `glass.css` styles by selector (`.nav*`, `.mobile-nav*`, `.footer*`, `.hero-caption`) and paints a 65px night
   strip behind the bar. Match those names and the 64px header, or add the site's selectors there.
3. Nav: fits from 861px up with no overflow. Phone menu below that.
4. Hero: section 5. Cards: `glass-lite on-light` plus division tint. Dark bands: `glass-lite`.
5. Buttons and forms: section 4. Fields 44px tall in an `.on-light` panel.
6. Icons: existing files in `shared/logos/` (vivid symbols). Favicons, touch icon and manifest per site, with a
   version query. Never redraw a logo.
7. Archived legal pages link the shell and tokens but not `glass.css`. Put shared visual changes in `glass.css`
   so those pages never change.
8. Verify: edit root `shared/` only, run `node scripts/sync-shared.mjs`, then `check-shared-sync.mjs` and
   `check-links.mjs` (both green); screenshots at 390, 700, 861, 1024, 1440; contrast per section 6; keyboard
   pass; `impeccable detect`.

## 9. Known gaps on flogalhq

These do not meet the rules above. Build to the rules.

- About on phones: hero text is under the contrast numbers (use the home phone hero), H2s render at 40–44, the
  lede at 17, fields at 14 (iOS zooms on focus) and the submit button is 41px tall.
- About scrolls sideways under 347px wide (the holding-company card).
- Home tile titles shrink to 11.5px on the narrowest phones.
- The red form error text (`#e05a5a`) is under 4.5:1 on light.

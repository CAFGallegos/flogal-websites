# SITES TREE — FOLDER RULES
# Location: flogal-websites/sites/CLAUDE.md
# Loads ONLY when a session touches site content/structure.

- SITE ISOLATION: hrefs must resolve to files under this site's root (after
  URL clamping). Current code uses ../../shared/... relative paths that work
  because the browser clamps .. to the site root — VALID. Do NOT rewrite
  existing relative paths. Block only references that escape the site root
  (e.g., ../../../ that go above app/sites/, or absolute /root paths pointing
  outside /sites/).
- shared/ assets: changing a shared asset means updating root shared/ AND
  every site's local copy in the SAME session. A partial update is worse than
  no update. List every copied path in the DONE summary.
- LEGAL ENTITIES IN PUBLIC COPY (Legal decision, Sept 2026 — supersedes the
  older entity-separation and "Adjudicated boundary" wording):
  - The ONLY legal entity names allowed on any public surface (pages, footers,
    nav, JSON-LD, meta, alt text): Flogal Holdings LLC, Flogal Leasing LLC,
    Flogal Properties LLC. Exact form: no comma, not all-caps. "Flogal
    Carriers" may appear only as a plain trade name, never with LLC/Inc.
  - Sales: the public brand is "Flogal Equipment"; the seller is Flogal
    Leasing LLC (sales JSON-LD legalName + the sales footer line "Equipment is
    sold by Flogal Leasing LLC."). NEVER "Flogal Sales" on a public surface;
    describe the business in a sentence as "equipment sales".
  - "Flogal Technologies" is a division/brand name only. Never with LLC/Inc,
    never called a company/subsidiary/firm/entity, and NEVER in JSON-LD (no
    Organization, brand, subOrganization, or FAQ node).
  - Never on a public surface: RRTL, J&D / J&D Hauling (any form, any case),
    USDOT/MC numbers, partner-carrier claims ("vetted partners", named partner
    carriers, partner networks), cross-border or Mexico FREIGHT claims. Truck
    EXPORTS to Mexico on sales are a different thing and may stay.
  - Authority CREDENTIALS (USDOT/MC numbers, SAFER/CSA ratings, insurance
    figures, "DOT + MC Active") and any new capacity/authority claim type are
    STOP-AND-FLAG (Legal owns them). Do not invent replacement capacity copy.
- LEGAL PAGES: docs/legal/*.md is the fixed source. /privacy, /sms-terms and
  /account-deletion copy it byte-for-byte (only [EFFECTIVE_DATE] is filled).
  Versioned copies (privacy|sms-terms|account-deletion)/v1.0/ and the
  2026-09-10 archives are immutable — never edit, regenerate, or delete them.
- NO THIRD-PARTY TRACKERS: the privacy policy (§3) says we use only a
  cookieless host analytics service. Never add Google Analytics, Tag Manager,
  Meta/Facebook pixel, LinkedIn Insight, TikTok pixel, Hotjar, Microsoft
  Clarity, FullStory, any session-recording/heatmap tool, chat widget, or
  cookie banner. Adding one makes the published policy false.
- Inquiry forms: the source tag (e.g. source='sales') must match the site the
  form lives on. A mismatched source silently corrupts lead attribution.
- Design tokens: per-site changes go in that site's tokens.css --accent
  override only. Never edit brand.css for a single-site change.
  - Never delete an existing @media query, fallback, or @supports block because it
  looks redundant against a new spec. Report it and leave it. Removal requires
  an explicit instruction in the prompt.
- Tap-to-reveal on a tabindex element: pair :focus for the behavior with
  :focus-visible for the ring, and keep an @media (hover:none) static fallback.
  :focus-visible alone under-triggers on touch.
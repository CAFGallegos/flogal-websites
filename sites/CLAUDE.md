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
- LEGAL ENTITIES IN PUBLIC COPY (Legal decision, Sept 2026, supersedes the
  older entity-separation and "Adjudicated boundary" wording):
  - The ONLY legal entity names allowed on any public surface (pages, footers,
    nav, JSON-LD, meta, alt text): Flogal Holdings LLC, Flogal Leasing LLC,
    Flogal Properties LLC. Exact form: no comma, not all-caps. "Flogal
    Carriers" may appear only as a plain trade name, never with LLC/Inc.
  - The sales site brand stays "Flogal Sales" until the owner approves a
    rename. Legal recommends "Flogal Equipment". The seller of record is Flogal
    Leasing LLC. Do not rename without owner approval.
  - "Flogal Technologies" is a division/brand name only. Never with LLC/Inc,
    never called a company/subsidiary/firm/entity, and NEVER in JSON-LD (no
    Organization, brand, subOrganization, or FAQ node).
  - Never on a public surface: RRTL, J&D / J&D Hauling (any form, any case),
    USDOT/MC numbers. Truck EXPORTS to Mexico on sales are a different thing
    and may stay.
  - Cross-border may be mentioned only as experience or relationships. Never
    offer Mexico freight as a Flogal service or say Flogal moves freight into
    Mexico.
  - Partner carriers may be mentioned only as independent carriers operating
    under their own authority. Never say or imply Flogal arranges, books,
    brokers, dispatches, or selects carriers for a shipper, or that a shipper's
    freight moves on a partner's truck through Flogal.
  - The "Is Flogal Carriers a broker?" FAQ stays. Its answer must say Flogal
    isn't a broker and every load is hauled by a licensed motor carrier under
    its own authority.
  - Authority CREDENTIALS (USDOT/MC numbers, SAFER/CSA ratings, insurance
    figures, "DOT + MC Active") and any new capacity/authority claim type are
    STOP-AND-FLAG (Legal owns them). Do not invent replacement capacity copy.
  - No em dashes in site copy or titles. Titles use "Brand | Description".
  - Public legal entity names: Flogal Holdings LLC, Flogal Leasing LLC, Flogal
    Properties LLC. No comma before LLC.
- LEGAL PAGES: docs/legal/*.md is the fixed source. /privacy, /sms-terms and
  /account-deletion copy it byte-for-byte (only [EFFECTIVE_DATE] is filled).
  Versioned copies (privacy|sms-terms|account-deletion)/v1.0/ and the
  2026-09-10 archives are immutable. Never edit, regenerate, or delete them.
- NO THIRD-PARTY TRACKERS: the privacy policy (section 3) says we use only a
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
# FLOGAL Websites — Open Questions

Ambiguities and contradictions surfaced during the recon pass in `FINDINGS.md`.
Questions only — no recommendations, no rewrites, no verdicts. Human (Carlos / Legal) to resolve.

---

## Entity naming — carriers business

1. **What is "Flogal Carrier Operations"?** The carriers.flogalhq.com site brands itself with this name in its `<title>`, nav, and hero copy, and repeats a single USDOT/MC pair (3142077 / 945-126) as if it is one carrier entity. But the flogalhq About page's entity map lists **two separate operating entities** — "J&D Hauling" and "RRTL" — both routing to that same site, with no mention of "Flogal Carrier Operations" as a name anywhere on the About page. Is "Flogal Carrier Operations" a legal entity in its own right, a d/b/a, or purely a marketing label for the combined dispatch desk of J&D Hauling + RRTL?

2. **Do J&D Hauling and RRTL each hold separate DOT/MC authority, or do they operate under one shared authority?** The carriers site presents exactly one USDOT number and one MC number for the whole site, covering both fleets ("Two owned operations, one dispatch desk... one accountability chain"). Per `sites/CLAUDE.md`, J&D Hauling and RRTL are explicitly different legal entities, and "compliance/authority claims are STOP-AND-FLAG (Legal owns it)." Should the public copy distinguish per-entity authority, or is a single shared/umbrella authority number accurate and intentional?

3. **Is the carriers portal dashboard's "RRTL" sidebar item (under the "Commercial" nav group, alongside "Customers" and "Billing") meant to represent RRTL as a *customer/commercial account* of the dispatch operation, or as one of the *two fleets being dispatched*?** The public site's language ("two owned operations, one dispatch desk") suggests the latter; the internal tool's nav grouping suggests the former. This is a real inconsistency in how the same entity is modeled between the public marketing site and the internal dispatch tool.

4. **Naming variant "FLOGAL Hauling"** — used only in the Properties site's footer ("Network" column) to label the same carriers.flogalhq.com destination that calls itself "Flogal Carrier Operations" elsewhere and "Hauling · Carriers" in its own portal sidebar. Which name (if any) is the canonical public-facing name for this business line?

## "Flogal Industrial" status

5. **Is Flogal Industrial an active operating entity or a placeholder?** It is presented on both the flogalhq homepage ("Operating Divisions" card: "Infrastructure operations... Long-term industrial services supporting logistics infrastructure, site operations, and asset-backed growth across regional markets.") and the About page's entity map (full card: name, type badge "Industrial," color, icon, description — visually identical treatment to the other 4 entities, and counted inside the About page's "5 Active" / "5+ Operating Entities" stats) — yet it has no destination site or page anywhere in this repo, and its "Industrial →" link on the About page is a static `<span>`, not an `<a>`. Per project `CLAUDE.md`: *"Do not create pages or links for rrtl, jd-hauling, or industrial sites. They do not exist yet and are blocked until authority/compliance is confirmed."* The public copy already describes it in present tense as an active operating division with real capability claims. Does this existing published copy need Legal review, given the repo-level instruction that this entity's authority/compliance status is unconfirmed?

6. **Same question applies to "RRTL" as a named, described operating entity** on the About page (`"Regional transport and logistics operations supporting supply chain execution across key corridors."`) — is RRTL's authority/compliance status confirmed, given the same repo-level caution names it alongside "industrial" as blocked pending confirmation?

## Missing / undecided pages

7. The flogalhq homepage nav links to `https://apps.flogalhq.com`, footer domain lists omit it — is `apps.flogalhq.com` intended to be included in the public cross-site domain list shown in every footer (`flogalhq.com · carriers.flogalhq.com · sales.flogalhq.com · properties.flogalhq.com`), or deliberately left out since it lives in a separate repo/project?

8. No site's footer domain list includes `admin.flogalhq.com` — intentional (staff-only, shouldn't be publicized) or an oversight?

## SEO/indexing gaps (technical, not positioning — flagging for a decision on whether to address)

9. Every one of the 9 pages across all 5 sites is missing: meta description, canonical tag, Open Graph tags, Twitter Card tags, and JSON-LD structured data. Is a metadata pass in scope for a follow-up phase, or intentionally deferred?

10. No `robots.txt` and no `noindex` meta tag exist anywhere in the repo — this means the two credential-gated internal tools (`admin/dashboard.html`, `admin/login.html`) and the partner-only mock dispatch dashboard (`carriers/portal/index.html`, `carriers/portal/login.html`) are fully crawlable and indexable by default. Is that intentional, or should these be excluded from indexing?

11. `sales.flogalhq.com` has zero static H1 and effectively zero static content below the nav — all inventory (including the only H2-equivalent heading, the unit model name) is rendered client-side after an async Supabase fetch. Is this an acceptable tradeoff for this site, or does it need a server-rendered/static fallback for crawlability?

12. `properties.flogalhq.com`'s 6 example listings have no real photographs — all "photos" are CSS gradient placeholders with a text label baked into a `::after` pseudo-element (not real alt text, not visible to a crawler as image content). Is this current mock/placeholder state, or the intended final treatment for listings without photography yet?

## Known items carried forward (status confirmed in FINDINGS.md, not re-litigated here)
- flogalhq about-page nav logo size mismatch: confirmed present (30/20px vs 33/25px).
- Mobile nav on sales/carriers/properties: confirmed — sales and carriers hide all nav links + CTA below 768px/720px with no hamburger/mobile-menu replacement; properties has no responsive nav handling at all (no media query touches `.pr-nav-links`).
- Carriers portal's ~27 mock dashboard buttons: confirmed count via `check-links.mjs`, not treated as broken (by design, per instructions).

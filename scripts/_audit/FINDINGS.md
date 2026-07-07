# FLOGAL Websites — Recon Findings

Read-only extraction pass. No files under `sites/**` or `shared/**` were modified.
Scope: 9 HTML pages across 5 Vercel sites (flogalhq, sales, carriers, properties, admin).
No SEO/positioning recommendations here — see `OPEN-QUESTIONS.md` for items needing a human decision.

---

## SITE: flogalhq (flogalhq.com)

Pages: `index.html`, `about/index.html`

### index.html

**A) Technical SEO surface**
- Path: `/`
- Title: `FLOGAL — Brand. Routing. Trust.` — 31 chars (OK, within 30–60 but near low end)
- Meta description: **missing**
- Canonical: **missing**
- Open Graph: **none**
- Twitter Card: **none**
- JSON-LD: **none**
- H1 count: 1 — `We move freight on the lanes that matter to you.`
- H2/H3 outline:
  - H2: Asset-backed across the freight stack.
    - H3: Dedicated & spot freight, OTR coverage
    - H3: Used Class 8 tractors & trailers
    - H3: Industrial yards & terminals
    - H3: Infrastructure operations
  - H2: Built for the long game.
  - H2: Request an Introduction
- Images missing alt: none found (decorative logos use `alt=""` intentionally)

**B) Copy & positioning language (verbatim)**
- Hero H1: `"We move freight on the lanes that matter to you."`
- Hero subhead: `"Flogal operates across hauling, equipment, real estate, and industrial solutions to keep your business moving forward."`
- Stats claims: `"50+ Power Units"`, `"20 Dedicated Lanes"`, `"99.2% On-Time"`, `"24/7 Dispatch Support"`
- Operating divisions copy:
  - `"Fleet operations running dedicated lanes across the continental U.S. with industry-leading on-time delivery and full compliance documentation."`
  - `"Inspected, financed inventory — dry vans, reefers, flatbeds, and day cabs. Buy, lease-to-own, or trade. Hard work, real specs, real prices."`
  - `"Properties built around freight: drop yards, terminals, and last-mile staging in growth corridors. Direct buyer — no agents, last close."`
  - `"Long-term industrial services supporting logistics infrastructure, site operations, and asset-backed growth across regional markets."`
- "Built for the long game" section: `"We build and operate logistics and asset businesses with institutional discipline. Structured for banks, insurance carriers, and corporate partners from day one."`
  - Pillar 1: `"Institutional Structure"` — `"Entity design and operations built to meet bank, insurance, and corporate standards."`
  - Pillar 2: `"Vertical Integration"` — `"Equipment, real estate, and industrial assets under a holding structure."`
  - Pillar 3: `"Operator Model"` — `"Every entity run by operators — not appointees."`

**C) Entity clarity**
- Site names itself just `FLOGAL` (wordmark + tricolor symbol). Nav brand has no division label.
- No explicit statement of what "Flogal" legally is (holding co? single operating company?) on this page — that lives on `/about`.
- Footer domain list: `flogalhq.com · carriers.flogalhq.com · sales.flogalhq.com · properties.flogalhq.com` — does **not** list `apps.flogalhq.com` even though nav links to it, and does not list `admin.flogalhq.com` (admin has a separate "Staff Login" link instead).
- Nav links to `https://apps.flogalhq.com` — this app is outside this repo (per project CLAUDE.md, apps/ is a different repo/project).

**D) Service & service-area language**
- Services named: "Dedicated & spot freight, OTR coverage" (Hauling), "Used Class 8 tractors & trailers" (Equipment), "Industrial yards & terminals" (Realty), "Infrastructure operations" (Industrial)
- No geography named on this page (no city/state/corridor mentions).
- Each "division" card links out to a different subdomain except "Industrial," whose CTA (`Learn More →`) points to `#contact` on this same page — there is no dedicated Industrial page/site anywhere in the repo.

**E) AI-legibility inventory**
- No dedicated About/who-we-are content on this page (redirects to `/about`).
- No FAQ or "how it works" content.
- JSON-LD: none.

**F) Contact form**
- Inquiry form posts to Supabase `inquiries` table with `source: 'hq'` — correct for this site (flogalhq).

---

### about/index.html

**A) Technical SEO surface**
- Path: `/about`
- Title: `About — Flogal Holdings` — 23 chars (**flag: <30**)
- Meta description: **missing**
- Canonical: **missing**
- Open Graph / Twitter: **none**
- JSON-LD: **none**
- H1 count: 1 — `One platform. Five operators. Built to scale.`
- H2/H3 outline:
  - H2: A logistics platform built from the ground up. (Who We Are)
  - H2: The full entity map. (Platform Structure)
  - H2 (styled, not `<h2>` tag but same visual weight — see note below): Why we build this way. (Operating Thesis)
    - 6 pillars, no h-tags used (`.p-title` divs): Institutional Structure First / Vertical Integration Creates Leverage / Assets Over Revenue / Operators, Not Consultants / Scalable by Design / Long Time Horizon
  - H2: Built for partners who require institutional quality. (Who We Serve)
  - H2 (styled, not semantic tag): What's under the hood. (Corporate Structure)
  - H2: Get in touch. (Contact)
  - Note: "Operating Thesis" and "Corporate Structure" section headers are set via inline `style` on a bare tag, not `<h2>`/`<h3>` — grep for H2/H3 tags under-counts this page's real heading structure.
- Images missing alt: none found

**B) Copy & positioning language (verbatim)**
- Hero H1: `"One platform. Five operators. Built to scale."`
- Hero subhead: `"Flogal Holdings is a privately held logistics and asset platform operating across hauling, equipment, real estate, and industrial services — structured for institutional-grade relationships."`
- Overview stats: `"5+ Operating Entities"`, `"4 Industry Verticals"`, `"1 Holding Structure"`
- "Who We Are" body (verbatim, full paragraphs):
  - `"Flogal Holdings is the parent company of a vertically integrated group of operating businesses built around logistics infrastructure, asset ownership, and long-term value creation. We are not a startup. We are not a broker. We are operators who own physical assets, run real businesses, and build institutional relationships."`
  - Pull quote: `"We build companies the way infrastructure should be built — documented, structured, and designed to outlast the people who started them."`
  - `"Every entity under Flogal Holdings operates with its own leadership, its own market, and its own growth trajectory — but shares a common financial and operational discipline that makes the platform stronger than any single company alone."`
  - `"Our goal is to be the kind of operator that banks want to lend to, insurers want to underwrite, and corporate partners want to depend on. That standard drives every decision we make — from how we structure our entities to how we answer the phone."`
- Operating thesis pillars (verbatim):
  - `"Every entity is formed, documented, and capitalized to meet the standards of banks, insurers, and corporate partners. Not after we grow — from the start."`
  - `"When you own the truck, the equipment, the yard, and the financing — you control margin at every level. That's the Flogal model."`
  - `"We build asset-backed businesses, not revenue-dependent service companies. Physical assets create permanence, collateral, and compounding value."`
  - `"Every dollar we earn is from moving freight, selling equipment, or collecting rent — not from advisory fees or management contracts."`
  - `"The holding structure is built to absorb new entities without restructuring. We can add a business the way you add a division — cleanly."`
  - `"We are not building to flip. We are building to compound. Every decision is made through the lens of what the business looks like in ten years."`
- Corporate structure table (verbatim key/value):
  - Entity Type: `Private Holding Company`
  - Headquarters: `Oklahoma City, OK`
  - Operating Entities: `5 Active`
  - Industry Verticals: `Logistics · Equipment · Real Estate · Industrial`
  - Primary Website: `flogalhq.com`
  - Status: `Actively Operating`
  - Funding Model: `Self-Funded · Full Decision Capacity`
  - Carrier Authority: `DOT + MC Active`
- Who We Serve card copy (verbatim):
  - Shippers & Freight Partners: `"Reliable capacity, full compliance documentation, and dedicated account management. The kind of operator partners want to depend on for the long haul."`
  - Insurance Carriers: `"DOT-compliant operations, documented safety programs, and full authority records across all fleet entities. Audit-ready at all times."`
  - Corporate Shippers: `"Reliable capacity, documented compliance, and dedicated account structure. The kind of carrier partner that shows up and shows documentation."`
  - Sellers & Partners: `"Whether you're selling a property, equipment, or a business — we are a direct buyer with the structure to close, not just the intention to."`

**C) Entity clarity — full entity map (verbatim)**
This is the single richest entity-clarity source in the repo. The page renders an explicit org chart: **Flogal Holdings** (Parent Company · Private) → 5 entity cards:
| Entity name (as written) | Type badge | Description (verbatim) | Links to |
|---|---|---|---|
| J&D Hauling | Operating | "Commercial carrier operating DOT-compliant fleet across dedicated and spot freight lanes." | carriers.flogalhq.com |
| RRTL | Operating | "Regional transport and logistics operations supporting supply chain execution across key corridors." | carriers.flogalhq.com |
| Flogal Equipment | Equipment | "Heavy equipment and commercial vehicle sales, leasing, and fleet solutions for operators and contractors." | sales.flogalhq.com |
| Flogal Properties | Real Estate | "Industrial and commercial real estate acquisition, management, and value-add repositioning." | properties.flogalhq.com |
| Flogal Industrial | Industrial | "Site operations, facility services, and industrial support for logistics and construction clients." | *(no href — static span, not a link)* |

- Both J&D Hauling and RRTL route to the **same** URL (carriers.flogalhq.com), which itself brands as a third name, "FLOGAL Carrier Operations" (see Carriers site section below) — the page never explains the relationship between "J&D Hauling," "RRTL," and "Flogal Carrier Operations" as names.
- "Flogal Industrial" is presented here as one of "5 Active" operating entities with its own description, color, and icon — same visual weight as the other four — but has no destination site/page anywhere in this repo.
- Bottom-of-page structure table repeats "Carrier Authority: DOT + MC Active" as a single Holdings-level credential (no distinction between J&D Hauling's and RRTL's individual authority, if any).

**D) Service & service-area language**
- Same 4 verticals as homepage (Logistics/Hauling, Equipment, Real Estate, Industrial), stated as `"Industry Verticals: Logistics · Equipment · Real Estate · Industrial"`.
- Geography: `"Oklahoma City, Oklahoma"` given twice (Headquarters field + contact block). No other city/corridor named.

**E) AI-legibility inventory**
- This page **is** the About/who-we-are page for the whole platform. Key verbatim lines captured above (Section B).
- No FAQ / plain-language "how it works" block.
- JSON-LD: none.

**F) Contact form**
- Form posts with `source: 'hq'` (same as homepage) — consistent.

**Known item — status check:** nav logo size mismatch (about page vs homepage).
- Confirmed present. Homepage (`sites/flogalhq/index.html`) defines an inline `<style>` override: `.nav-symbol{height:33px}` / `.nav-wm{height:25px}` that beats the shared stylesheet.
- `about/index.html` has no such override, so it falls back to the shared `flogalhq-shell.css` values: `.nav-symbol{height:30px}` / `.nav-wm{height:20px}`.
- Net effect: the nav logo renders at a different size on `/` vs `/about`. Not fixed (per instructions, status only).

---

## SITE: sales (sales.flogalhq.com)

Pages: `index.html`

**A) Technical SEO surface**
- Path: `/`
- Title: `FLOGAL Equipment — Inventory` — 28 chars (**flag: <30**)
- Meta description: **missing**
- Canonical: **missing**
- Open Graph / Twitter: **none**
- JSON-LD: **none**
- H1 count: **0** (flag). The page has no static H1 anywhere — the only heading-ish content is a JS-rendered `<h2>${u.model}</h2>` template string inside `renderDrawer()`, which only exists in the DOM after the Supabase inventory fetch resolves client-side.
- H2/H3 outline (static markup only): `H3: Don't see what you need? We source it.` — that is the **only** static heading tag on the page.
- Images missing alt: none found in static markup (all listing photos are rendered client-side from Supabase `photos` data with `alt=""`)

**B) Copy & positioning language (verbatim)**
- No hero H1/tagline — page opens straight into a nav + subtitle bar: `"Trucks, trailers, heavy machinery, and industrial equipment — available for purchase or lease."`
- Sourcing-desk copy: `"Don't see what you need? We source it."` / `"Tell us the spec — make, year, mileage, attachments, condition. Our equipment desk works carrier auctions, OEM allocations, and lease-end returns daily. Most requests come back inside a week, available for purchase or lease."`
- No scale/authority/guarantee claims found in static copy (equipment specs and inventory come entirely from live Supabase data, not hardcoded claims).

**C) Entity clarity**
- Nav brand shows tricolor-free gold symbol + wordmark + divider + `"Equipment · Sales"` label — self-identifies as a Flogal division, not a separate company name. Does not use "Flogal Equipment" (the name used for this division on the flogalhq About page's entity map) anywhere in the visible copy — only "FLOGAL Equipment" in the `<title>` tag.
- Footer column labeled "Sales" (not "Equipment"), contains only one link ("Inventory"), inconsistent with the "Equipment" labeling used in `<title>` and nav.

**D) Service & service-area language**
- Equipment types named (filter rail, verbatim labels): `Tractor · day cab`, `Tractor · sleeper`, `Dry van trailer`, `Reefer trailer`, `Flatbed`, `Heavy machinery`, `Industrial equipment`
- Makes named: `Freightliner`, `Kenworth`, `Peterbilt`, `Volvo`, `International`
- Geography: `"Houston, TX yard"` (grid meta line) — the only location mentioned on the page.
- All of the above are filter options against live inventory, not separate pages.

**E) AI-legibility inventory**
- No About/who-we-are content, no FAQ, no JSON-LD.
- Because both the H1-equivalent content (unit names) and all inventory data load asynchronously from Supabase, a crawler that doesn't execute JS (or doesn't wait for the async fetch) sees an essentially empty content page below the nav/subtitle bar.

**F) Contact form**
- Quote modal posts with `source: 'sales'` — correct for this site.

---

## SITE: carriers (carriers.flogalhq.com)

Pages: `index.html`, `portal/index.html`, `portal/login.html`

### index.html

**A) Technical SEO surface**
- Path: `/`
- Title: `FLOGAL Carrier Operations — Direct capacity. Vetted partners. No brokers.` — **73 chars (flag: >60)**
- Meta description: **missing**
- Canonical: **missing**
- Open Graph / Twitter: **none**
- JSON-LD: **none**
- H1 count: 1 — `Direct capacity. Vetted partners. No brokers.`
- H2/H3 outline:
  - H2: Three things every shipper actually wants from a carrier. → H3: Direct capacity / Vetted partners / No brokers
  - H2: Two owned operations, one dispatch desk. → H3: J&D Hauling / RRTL
  - H2: Trailers we run, freight we handle. → H3: Flatbed · 53' / Dry van · 53' / Heavy haul · RGN / Bulk · end-dump / Pneumatic · dry bulk / Expedited · hot-shot
  - H2: Direct-dispatch capacity beyond our own fleets. → H3: DA Transport / Evolution / FLS Express
  - H2: Built around the TX–OK corridor.
  - H2: From RFP to POD on a single accountability chain.
  - H2: DOT-clean. Insurance-current. Audit-ready.
  - H2: Freight we know cold.
  - H2: Tell us about your load. We'll quote it inside four hours. → H3: Already a partner?
- Images missing alt: none found (all `<img>` decorative logos use `alt=""`, all content is inline SVG icons)

**B) Copy & positioning language (verbatim)**
- Hero eyebrow: `"Carrier Operations · Direct freight, no intermediaries"`
- Hero H1: `"Direct capacity. Vetted partners. No brokers."`
- Hero sub: `"Flogal Carrier Operations connects commercial shippers with DOT-compliant fleets across active freight corridors. One operator, one accountability chain — your freight, our trucks."`
- Hero meta strip claims: `USDOT 3142077`, `MC 945-126`, `SAFER Satisfactory`, `$1M auto · $5M cargo`
- Stats bar claims: `"100% DOT Compliant"`, `"TX–OK Active Lanes"`, `"120+ Direct Capacity"` (power units across owned fleets), `"0 No Brokers"`
- "Why direct" pillar copy (verbatim):
  - `"Your freight rides on Flogal-operated equipment or vetted partner fleets we dispatch ourselves. No load posting boards, no double-brokered surprises."`
  - `"Every partner fleet passes a 22-point compliance check: DOT authority, CSA basics, insurance verification, equipment age, and driver tenure. Re-checked quarterly."`
  - `"One contract, one truck, one accountability chain. You talk to the operator dispatching your load — not a sales desk passing it down the chain for a margin."`
- Fleet section intro: `"Flogal Carrier Operations runs two anchor fleets in-house — J&D Hauling and RRTL — covering the bulk of our owned capacity. Both dispatch from a single ops desk so customers see one rate, one POD, one accountability chain."`
  - J&D Hauling: `"Flogal's anchor fleet. Open-deck and over-dimensional specialists with a dry van pool for general freight. Run primarily on the TX–OK corridor with extended reach into the Gulf and Midwest."` — specs: `64 Power Units`, `3.2 yr avg fleet age`, `99.1% on-time`
  - RRTL: `"Roll-off and end-dump operation moving rock, aggregate, and base material out of regional quarries. Hot-shot and day-cab heavy with same-day turnaround inside the Texas triangle."` — specs: `38 Power Units`, `4.2k daily tons`, `14 quarry partners`
- Network partners (verbatim descriptions):
  - DA Transport: `"Vetted regional fleet servicing the Houston ↔ Dallas ↔ Oklahoma City triangle. Day-cab dry van and reefer specialists with same-day pickup windows on validated lanes."` — 12 power units, TX·OK·LA
  - Evolution: `"Dedicated-fleet operator. Engaged for high-volume shipper accounts that need predictable weekly capacity on locked lanes with assigned drivers and equipment."` — 28 power units, Lower 48
  - FLS Express: `"Cross-border (US ↔ MX) and long-haul OTR partner. C-TPAT and FAST certified with bilingual dispatch and bond capacity in Laredo and El Paso."` — 18 power units, US↔MX
- Compliance credential block (verbatim): USDOT `3142077` (Active · Interstate), MC Authority `MC 945-126` (Common · Contract), SAFER Rating `Satisfactory` (Last audit · Mar 2026), CSA Basics `All Green`, Auto Liability `$1,000,000`, Cargo `$5,000,000`, WC + Employer `In force`, ELD Compliance `100%`
- Testimonial (verbatim): `"Flogal is one of two carriers we call before we post a load. The driver who picks up is the same driver who delivers, and the rate we quote on Monday is the rate we invoice on Friday — that's the whole pitch."` — attributed to Daniel Keene, Logistics Director, Brazos Aggregate Holdings

**C) Entity clarity**
- This site's own self-name in copy is **"Flogal Carrier Operations"** — a name that does not appear anywhere in the flogalhq About page's entity map (which lists J&D Hauling and RRTL as the two operating entities, both routing here).
- The single set of USDOT/MC numbers (`3142077` / `945-126`) is presented once, site-wide, covering the whole "Carrier Operations" umbrella — the page does not state whether J&D Hauling and RRTL each hold separate DOT/MC authority or share this one. (See `OPEN-QUESTIONS.md`.)
- Nav brand: symbol + wordmark + divider + `"Carrier Operations"` label (matches `<title>` framing, not "J&D Hauling" or "RRTL").
- Partner-login CTA points to `portal/login.html`, branded `"FLOGAL Carrier Operations — Partner Access"`, which itself repeats the same USDOT/MC numbers.

**D) Service & service-area language**
- Trailer/service programs named: `Flatbed · 53'`, `Dry van · 53'`, `Heavy haul · RGN`, `Bulk · end-dump`, `Pneumatic · dry bulk`, `Expedited · hot-shot`
- Industries served (8 tiles, verbatim names + equipment tag): Oil & Gas (Hot-shot · flatbed), Construction (Heavy haul · bulk), Aggregates (End-dump · belly), Agriculture (Bulk · grain hopper), Manufacturing (Dry van · flatbed), Building Products (Flatbed · LTL), Energy (Heavy haul · perm), Retail / FMCG (Dry van · reefer)
- Geography: primary corridor `"Dallas / Fort Worth ↔ Oklahoma City"` (24 daily); secondary lanes table: Houston↔Tulsa, San Antonio↔Austin, Midland-Odessa↔Dallas, Dallas↔Memphis, Houston↔Laredo (via FLS, cross-border partner lane); map labels: Oklahoma City, DFW, San Antonio, Austin, Houston, Tulsa, Midland.
- All lane/capacity numbers on this page are static hardcoded HTML (not live data), including the `"Updated Tue · 06:00 CT"` timestamp label on the lanes table.

**E) AI-legibility inventory**
- No dedicated About page for this site; `#about` anchor scrolls to the on-page "Why direct" section rather than linking elsewhere.
- No FAQ block. "How we operate" section (4 numbered steps: Quote → Dispatch → Track + POD → Settle) functions as an implicit "how it works," verbatim:
  - `"Share lane, equipment, weight, and pickup window. Our ops desk replies with an all-in rate inside 4 business hours — no broker markup, no waiting on a load-board response."`
  - `"We assign Flogal-operated equipment or one of three vetted partner fleets, depending on geography and trailer type. You get the driver name and truck number before pickup."`
  - `"ELD-grade GPS pings, geofence alerts on pickup and delivery, and signed PODs delivered electronically within 90 minutes of unload. One ops contact end-to-end."`
  - `"Single invoice on standard NET-30 terms. Detention, accessorials, and TONUs itemized line-by-line. No surprise fuel surcharges or audit-trail gaps."`
- JSON-LD: none.

**F) Contact form**
- Quote form posts with `source: 'carriers'` — correct.

---

### portal/index.html (partner dispatch dashboard mock)

**A) Technical SEO surface**
- Title: `FLOGAL Hauling — Dispatch` — 25 chars
- No meta description/canonical/OG/Twitter/JSON-LD.
- H1 count: 0 (app shell uses `<h1 class="cr-page-title">` — confirmed present: `"Load board · Tuesday, May 19"`).
- No `noindex` meta tag and no `robots.txt` Disallow anywhere in the repo — this internal-facing mock dashboard is fully crawlable/indexable by default.

**C) Entity clarity**
- Sidebar brand label: `"FLOGAL"` / `"Hauling · Carriers"` — a third naming variant distinct from both "Flogal Carrier Operations" (marketing site) and "J&D Hauling"/"RRTL" (About page entity names).
- Sidebar nav includes a "Commercial" group with a dedicated `"RRTL"` menu item alongside `"Customers"` and `"Billing"` — implying RRTL is tracked as a distinct commercial/customer-like unit inside the dispatch tool, separate from the general load board.

**Known item — status check:** ~27 mock dashboard buttons with no handler/target.
- Confirmed: `check-links.mjs` reports exactly 27 "no onclick, no id, not type=submit — likely inert" buttons in this file (sidebar nav items, board tabs, action icons, exception-row resolve buttons). Per instructions, **not flagged as broken** — this is a static UI mock, working as designed.

---

### portal/login.html

**A) Technical SEO surface**
- Title: `FLOGAL Carrier Operations — Partner Access` — 42 chars
- No meta description/canonical/OG/Twitter/JSON-LD.
- H1 count: 1 — `"Partner Access"`.

**C) Entity clarity**
- Repeats `USDOT 3142077` / `MC 945-126` in the pitch-panel meta strip, same numbers as the main carriers site.
- Login form action posts to `index.html` (portal home) via `GET` with `email`/`password` as query params — cosmetic-only mock, does not actually authenticate (no backend wired here, unlike admin's Supabase-authenticated login).

---

## SITE: properties (properties.flogalhq.com)

Pages: `index.html`

**A) Technical SEO surface**
- Title: `FLOGAL Properties — Industrial real estate, built for freight` — **61 chars (flag: >60, borderline)**
- Meta description: **missing**
- Canonical: **missing**
- Open Graph / Twitter: **none**
- JSON-LD: **none**
- H1 count: 1 — `"Yards, terminals, and last-mile sites where the lanes are."`
- H2/H3 outline:
  - H2: Recently listed yards & terminals. → H3 ×6 (listing card titles: Mountain Creek Drop Yard, South Fulton Cross-Dock, Buckeye Last-Mile Hub, Joliet Intermodal Yard, Apex Industrial Flex, Lamar Avenue Terminal)
  - H2: Sited on the lanes our trucks already run.
  - H2: Mountain Creek · a 22-acre drop yard purpose-built for OTR.
  - H2: Industrial real estate, run like an operating company.
  - H2: List a site, lease a yard, or build to suit.
- Images missing alt: none found (all photo slots are CSS gradient/pattern placeholders, no `<img>` tags for listing photos at all — see AI-legibility note)

**B) Copy & positioning language (verbatim)**
- Hero eyebrow: `"Industrial real estate · built for freight"`
- Hero H1: `"Yards, terminals, and last-mile sites where the lanes are."`
- Hero sub: `"Flogal Properties acquires and develops industrial real estate purpose-built for trucking — drop yards, cross-docks, and terminals in the growth corridors our carrier network already runs."`
- Coverage section: `"Every Flogal Properties site is acquired against a lane density model — we site yards and terminals where our hauling network already moves freight, so tenants land in a corridor with carrier capacity, fuel infrastructure, and driver depth from day one."` Stats claimed: `42 Active sites`, `7 Metro markets`, `3.1M Sq ft under mgmt`, `96% Stabilized occupancy`.
- Featured development (Mountain Creek) copy: `"A new build-to-suit yard on the I-20 / I-35E split in Dallas–Fort Worth. Hardened concrete, security-rated fencing, and a fueling pad sized for 184 power units. Designed with our own dispatch team — the spec sheet reads like a driver's checklist."`
- Process band steps (verbatim):
  - `"We site every acquisition against carrier lane data — yards land where the freight already moves, not where the parcel happened to come up."`
  - `"Acquire, entitle, and build to a freight-grade spec: reinforced concrete, security-rated fencing, fuel + DEF, ALPR cameras."`
  - `"Full-site triple-net leases for anchor tenants, share-yard arrangements for fleets needing 10–60 stalls without the full acquisition."`
  - `"Site is enrolled in the Flogal carrier network from day one — your tenants land in a corridor with fuel, drivers, and dispatch already in place."`
- Tenant testimonial (verbatim): `"Flogal didn't pitch us a parcel — they pitched the lane. Our drivers fuel, park, and rotate trailers without leaving the corridor. That's what we were buying."` — Renata Marsh, VP Fleet Operations, Continental Reefer Co. Stats: `7.2 yr` weighted avg lease term, `96%` stabilized occupancy, `$0.41` avg yard rent/sq ft/yr.
- Search bar placeholder claim: `"Search 42 sites →"` button label.

**C) Entity clarity**
- Self-names consistently as `"Flogal Properties"` throughout (title, nav sub-label, footer). No naming inconsistency found within this page.
- Footer "Network" column links out with labels `"FLOGAL Hauling"` (→ carriers.flogalhq.com) and `"FLOGAL Equipment"` (→ sales.flogalhq.com) — a **fourth** naming variant for the carriers site ("FLOGAL Hauling," distinct from "Flogal Carrier Operations" used on that site itself and "Hauling · Carriers" used on its portal dashboard).
- Nav "Sign in" link points to `https://admin.flogalhq.com/login.html` — same staff login used by all other sites' footers, but here it's promoted to a primary nav-bar action rather than a footer micro-link.

**D) Service & service-area language**
- Property types named (5 tiles): `Drop yards` (18 sites · 7 markets), `Terminals` (9 sites · 7 markets), `Last-mile` (7 sites · 7 markets), `Flex industrial` (5 sites · 7 markets), `Land` (3 sites · 7 markets) — totals to 42 sites as claimed.
- 6 example listings named with specific markets: Dallas–Fort Worth TX, Atlanta GA, Phoenix AZ, Chicago IL, Las Vegas NV, Memphis TN — all with named highways (I-20/I-35E, I-285, I-10/Loop 202, I-80, I-15 N, I-40/I-55).
- All listing data (prices, acreage, door/stall counts, badges) is static hardcoded HTML — there is no live inventory backend for properties (contrast with sales.flogalhq.com, whose inventory is Supabase-driven).

**E) AI-legibility inventory**
- No dedicated About page on this site; footer "About" link points to `https://www.flogalhq.com/about` (cross-site, correct target).
- No FAQ block. Process band (4 steps) is the closest "how it works" content (quoted above).
- JSON-LD: none.
- Listing "photos" are CSS gradient/pattern fallbacks with a text label (e.g., `"Yard / Terminal photo"`) baked into the fallback via `::after` pseudo-element content — there are no actual photographs or `<img>` elements for any of the 6 listings, meaning no real visual or alt-text content exists to describe these properties to a crawler or image search.

**F) Contact form**
- Modal form posts with `source: 'properties'` — correct.

---

## SITE: admin (admin.flogalhq.com)

Pages: `login.html`, `dashboard.html`
Internal staff tool, not part of public marketing surface — captured for completeness/AI-legibility inventory only.

**A) Technical SEO surface**
- `login.html` — Title: `FLOGAL Admin — Sign In` (22 chars). H1: `"Admin Portal"`.
- `dashboard.html` — Title: `FLOGAL Admin — Dashboard` (24 chars). H1 count: 0 (app shell, no semantic H1 found in a scan of the file).
- Neither page has a meta description, canonical, Open Graph, Twitter Card, or JSON-LD.
- No `noindex` meta tag on either page, and no `robots.txt` in the repo at all — these staff-only, credential-gated pages are fully crawlable/indexable by default (same gap as the carriers partner portal).

**B) Copy & positioning language**
- No marketing copy — this is a functional login form and role-gated data dashboard (inquiries, inventory, users). No scale/capability/authority claims present.

**C) Entity clarity**
- Dashboard sidebar is role-gated via `data-roles` attributes with exactly four role names: `holdings`, `sales`, `carriers`, `properties`. No `rrtl`, `jd-hauling`, or `industrial` role exists in the admin tool — consistent with the flogalhq About page's entity map only having live sites for Carriers (which covers both J&D Hauling and RRTL), Sales, and Properties, and no live site for "Flogal Industrial."
- "Inquiries" section is broken out by source: All (holdings-only), Sales, Carriers, Properties — matches the `source` field values used by each site's Supabase insert calls (`hq`, `sales`, `carriers`, `properties`), confirming attribution is wired correctly end-to-end.

**F) Login**
- `login.html` uses real Supabase auth (`sb.auth.signInWithPassword`) — functionally different from the carriers portal's cosmetic-only login form (see above).

---

## G) Internal link graph / cross-site isolation / orphan pages (across all sites)

- **`node scripts/check-links.mjs` result: GREEN — 0 broken internal links/assets** across all 5 sites (full output preserved in this session; re-run confirmed at end of pass).
- **Cross-site isolation:** every site keeps its own local `shared/` copy (`sites/<name>/shared/`) alongside the root `shared/`. All relative asset paths (`../../shared/...` or `../../../shared/...` from deeper pages) resolve within that site's own folder after browser `..` clamping — no path was found escaping above a site's own root into another site's folder or above `sites/`. Manually inspected every distinct `href="../..."`/`src="../..."` pattern in the repo (listed below) — none over-escape:
  - 2-level (`../../shared/...`): used by top-level pages (`flogalhq/index.html`, `sales/index.html`, `carriers/index.html`, `properties/index.html`).
  - 3-level (`../../../shared/...`): used by one-level-nested pages (`flogalhq/about/index.html`, `carriers/portal/login.html`) — correctly one level deeper to still land on that same site's `shared/` folder.
  - `admin/` pages use root-relative paths (`shared/...`, `styles.css`) with no `../` at all, since `login.html`/`dashboard.html` sit at the admin site's own root.
- **Cross-site links (absolute `https://`):** all cross-subdomain navigation (Carriers/Sales/Properties/flogalhq/admin/apps) uses full `https://` URLs, never relative paths — correct, since each is a separate Vercel project/domain.
- **`apps.flogalhq.com`** is linked from flogalhq's nav/mobile-nav only; this app lives outside this repo entirely (per project CLAUDE.md) and cannot be checked by `check-links.mjs`.
- **Orphan pages:** none of the 9 pages are unreachable from at least one other page's nav/footer — `carriers/portal/index.html` and `carriers/portal/login.html` are reachable only via the carriers site's "Already a partner? Login →" CTA and each other (not linked from any other site), which is expected for a partner-only portal.
- **"Flogal Industrial"** is described on the flogalhq About page's entity map with no destination — its `<span class="ent-link">Industrial →</span>` is static text, not an `<a>` tag, so it is not a broken link (check-links.mjs correctly does not flag it) but it also is not a link at all.

## H) Cross-site consistency — "what is Flogal" / Flogal↔RRTL relationship

Naming for the umbrella company is **consistent as "Flogal Holdings"** wherever the parent entity is named directly (About page structure table: `Entity Type: Private Holding Company`; footer copyright lines site-wide: `"© 2026 FLOGAL Holdings, LLC"`).

Naming for the **carriers business is inconsistent across 4 different surfaces**, quoted verbatim:
1. flogalhq About page entity map: two separate entities, **`"J&D Hauling"`** and **`"RRTL"`**, both routing to the same URL.
2. carriers.flogalhq.com site itself: self-names as **`"Flogal Carrier Operations"`** (title, nav label, hero eyebrow) — a name that does not appear on the About page's entity map at all.
3. carriers portal dashboard sidebar: brand label **`"FLOGAL"` / `"Hauling · Carriers"`** — yet another variant, plus a distinct **`"RRTL"`** sidebar menu item under "Commercial," implying RRTL is tracked separately inside the tool even though the public site treats it as one of "two owned operations" under one dispatch desk.
4. properties.flogalhq.com footer: labels the same site **`"FLOGAL Hauling"`**.

None of the 5 sites states the relationship between "J&D Hauling," "RRTL," and "Flogal Carrier Operations" as names — a reader would not be able to determine from the site copy alone whether "Flogal Carrier Operations" is a legal entity, a marketing brand for the combined J&D+RRTL dispatch desk, or an umbrella term. See `OPEN-QUESTIONS.md`.

The single **USDOT 3142077 / MC 945-126** credential pair is repeated identically across the carriers site and its partner-login page, presented as covering the whole "Carrier Operations" umbrella — no page distinguishes per-entity authority for J&D Hauling vs. RRTL.

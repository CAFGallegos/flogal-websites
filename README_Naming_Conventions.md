# flogal-websites

Multi-site repo for all Flogal web properties. Each site deploys independently via Vercel.

---

## Stack

- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Database:** Supabase — project `flogal-sales`
- **Editor:** VS Code + Claude Code
- **Domains:** flogalhq.com, sales.flogalhq.com, carriers.flogalhq.com, properties.flogalhq.com

---

## Folder Structure

```
flogal-websites/
├── shared/                  ← Master asset library (source of truth)
│   ├── css/
│   ├── fonts/
│   ├── logos/
│   ├── photos/
│   ├── favicons/
│   └── js/
├── sites/
│   ├── flogalhq/            ← flogalhq.com
│   ├── sales/               ← sales.flogalhq.com
│   ├── carriers/            ← carriers.flogalhq.com
│   ├── properties/          ← properties.flogalhq.com
│   ├── industrial/          ← NOT STARTED
│   ├── rrtl/                ← NOT STARTED
│   └── jd-hauling/          ← NOT STARTED
└── _archive/
```

Each `sites/[site]/` folder contains its own `shared/` copy because Vercel cannot serve files outside its root directory. When updating shared assets, update **both** the root `shared/` and each site's local `shared/`.

---

## Naming Conventions

### Site Folders

| Site | Folder | Domain |
|------|--------|--------|
| Flogal HQ (parent) | `sites/flogalhq/` | flogalhq.com |
| Equipment Sales | `sites/sales/` | sales.flogalhq.com |
| Carrier Operations | `sites/carriers/` | carriers.flogalhq.com |
| Properties | `sites/properties/` | properties.flogalhq.com |
| Industrial | `sites/industrial/` | industrial.flogalhq.com |
| RRTL | `sites/rrtl/` | rrtl.flogalhq.com |
| J&D Hauling | `sites/jd-hauling/` | jdhauling.com |

**Rule:** Always lowercase, hyphen-separated, no underscores.

---

### Logo Files

Pattern: `flogal-[element]-[variant].[ext]`

| File | Description |
|------|-------------|
| `flogal-symbol-tricolor.png` | Symbol mark — full color (used on flogalhq) |
| `flogal-symbol-gold.png` | Symbol mark — gold (used on sales) |
| `flogal-symbol-blue.png` | Symbol mark — blue (used on carriers) |
| `flogal-symbol-green.png` | Symbol mark — green (used on properties) |
| `flogal-wordmark-only-white.png` | "FLOGAL" text only — white (used on all sites) |
| `flogal-logo-full-white.png` | Symbol + wordmark combined — white |

**Rule:** `flogal-[element]-[color/variant].png`
- Elements: `symbol`, `wordmark`, `logo`
- Variants: `tricolor`, `gold`, `blue`, `green`, `white`, `dark`

---

### Favicon Files

Stored in `shared/favicons/[sitename]/` and each site's local `shared/favicons/`.

| Site | File | Color |
|------|------|-------|
| flogalhq | `favicon-flogalhq.png` | tricolor |
| sales | `favicon-sales.png` | gold |
| carriers | `favicon-carriers.png` | blue |
| properties | `favicon-properties.png` | green |

---

### CSS Variables — Brand Colors

Each site defines its own brand color as a CSS variable. Use these consistently:

```css
/* Sales */
--brand: #C9A84C;      /* gold */

/* Carriers */
--brand: #2563EB;      /* blue */

/* Properties */
--brand: #4CAF7D;      /* green */

/* Flogal HQ */
--brand: #FFFFFF;      /* white — parent brand, no single color */
```

---

### CSS Class Naming

Pattern: `[site-prefix]-[component]-[modifier]`

| Prefix | Site |
|--------|------|
| `svc-` | sales (equipment sales) |
| `car-` | carriers |
| `prop-` | properties |
| `hq-` | flogalhq |

Examples:
```
svc-card              ← inventory card on sales site
svc-card--active      ← selected state modifier
svc-drawer            ← detail panel drawer
car-hero              ← hero section on carriers site
prop-listing          ← property listing card
```

**Rule:** BEM-lite — `[prefix]-[block]--[modifier]`. Always lowercase, hyphen-separated.

---

### Supabase

**Project:** `flogal-sales`
**URL:** `https://uzbpsppeihazicmngqqq.supabase.co`

#### Table Naming
- Lowercase, underscore-separated: `inventory`, `inquiries`, `lease_requests`

#### Column Naming
- Lowercase, underscore-separated: `stock_number`, `created_at`, `monthly_payment`
- Boolean columns: `is_` or adjective prefix — `lease_eligible`, `is_active`
- Timestamp columns: always `timestamptz` with `DEFAULT now()`

#### Storage Buckets
Pattern: `[entity]-[content-type]`

| Bucket | Contents |
|--------|----------|
| `inventory-photos` | Equipment listing photos |

#### Storage File Paths
Pattern: `[bucket]/[record-identifier]/[timestamp]-[random].[ext]`

Example: `inventory-photos/TS-1116/1748123456789-a3f2.jpg`

---

### Pages / Routes

Each site uses flat HTML files with folder-based routing:

```
sites/sales/
├── index.html              ← sales.flogalhq.com/
├── admin/
│   ├── login.html          ← sales.flogalhq.com/admin/login.html
│   └── dashboard.html      ← sales.flogalhq.com/admin/dashboard.html
```

**Rule:** Always `index.html` inside a named folder for clean URLs. Never `about.html` at root — use `about/index.html`.

---

### Git Commits

Pattern: `[type]: [what changed]`

| Type | Use for |
|------|---------|
| `feat:` | New feature or page |
| `fix:` | Bug fix |
| `refactor:` | Code cleanup, no behavior change |
| `style:` | Visual/CSS only change |
| `chore:` | Config, dependencies, non-code |

Examples:
```
feat: wire photo uploads to supabase storage
fix: replace created_at order with id — column does not exist
style: normalize page width to sales standard across all sites
chore: add created_at column to inventory table
```

---

### Vercel Projects

| Vercel Project | Root Directory |
|----------------|----------------|
| `flogal-websites` | `sites/flogalhq` |
| `flogal-sales` | `sites/sales` |
| `flogal-carriers` | `sites/carriers` |
| `flogal-properties` | `sites/properties` |

---

## Git Rules

- **Never** run `git add`, `git commit`, or `git push` from Claude Code
- Claude Code stops after file changes and reports what changed
- All commits are pushed manually from GitHub Desktop
- Only push to `main` — Vercel auto-deploys on every push

---

## Adding a New Site

1. Create folder: `sites/[sitename]/`
2. Copy `shared/` into `sites/[sitename]/shared/`
3. Build `index.html` using site-specific CSS prefix and brand color
4. Create new Vercel project → Root Directory: `sites/[sitename]`
5. Add domain in Vercel → add DNS record at registrar
6. Add entry to this README

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| Admin / Owner | Carlos Gallegos | carlos@flogalhq.com |
| Supabase Auth | Admin user | carlos@flogalhq.com |

# FLOGAL — Website Deployment Package
**Version:** Final  
**Built:** May 2025  
**Stack:** Pure HTML/CSS/JS — zero dependencies, no build step

---

## FILE STRUCTURE

```
flogal-websites/
├── index.html              → flogalhq.com (main landing page)
├── about.html              → flogalhq.com/about (company info)
├── carriers/
│   └── index.html          → carriers.flogalhq.com OR flogalhq.com/carriers
├── sales/
│   └── index.html          → sales.flogalhq.com OR flogalhq.com/sales
├── properties/
│   └── index.html          → properties.flogalhq.com OR flogalhq.com/properties
└── README.md               → this file
```

All assets (logos, photos, fonts) are **base64-encoded inside each HTML file**.  
No external dependencies. Files open and render correctly locally and when deployed.

---

## DEPLOY TO VERCEL (Recommended — Free)

1. Go to [vercel.com](https://vercel.com) → Sign up / Log in
2. Click **"Add New Project"** → **"Deploy from folder"**
3. Drag the entire `flogal-final` folder into the upload area
4. Click **Deploy** — live URL in under 60 seconds
5. Go to **Settings → Domains** → Add `flogalhq.com`
6. Follow Vercel's DNS instructions (two records in Namecheap)

---

## DEPLOY TO NETLIFY (Alternative — Also Free)

1. Go to [netlify.com](https://netlify.com) → Sign up
2. Drag the `flogal-final` folder onto the Netlify dashboard
3. Live in 30 seconds
4. Connect your domain under **Domain settings**

---

## PASS TO CLAUDE CODE

If using Claude Code to host or edit:

```bash
# Install and authenticate Claude Code, then:
claude deploy ./flogal-final
```

Or open the folder in VS Code with the Claude Code extension and ask it to:
- "Deploy this folder to Vercel"
- "Connect flogalhq.com to this project"
- "Add a new listing to sales/index.html"

---

## HOW TO UPDATE THINGS YOURSELF

### Change the phone number
Search all files for `+12147021336` and `(214) 702-1336` — replace both.

### Update social media links
Search for these placeholders and replace with your real URLs:
- `https://www.facebook.com/flogal`
- `https://www.linkedin.com/company/flogal`
- `https://www.instagram.com/flogal`

### Add a new equipment listing (sales/index.html)
Open `sales/index.html` in any text editor.  
Find the line: `const ALL = [`  
Copy one listing block `{ ... },` and update the values:

```json
{
  "id": "CT-2213",
  "status": "FRESH",
  "year": 2022,
  "make": "KENWORTH",
  "model": "T680",
  "type": "Tractor - sleeper",
  "engine": "PACCAR MX-13",
  "mileage": 210000,
  "transmission": "Auto",
  "price": 89500,
  "monthly": 2080,
  "term": 60,
  "vin": "YOUR-VIN-HERE",
  "sleeper": "76\" mid-roof",
  "axle": "6x4",
  "photos": 6,
  "video": false,
  "fin": [
    {"l": "$0 down",  "m": 2288},
    {"l": "10% down", "m": 2080},
    {"l": "20% down", "m": 1870}
  ]
}
```
Save the file. Re-upload to Vercel/Netlify. Done.

### Wire the job application form to your email
The careers form (on carriers/index.html) uses [Formspree](https://formspree.io) — free tier.

1. Sign up at formspree.io
2. Create a new form → get your Form ID (looks like `xabc1234`)
3. In `carriers/index.html`, find:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST"
   ```
4. Replace `YOUR_FORM_ID` with your actual ID
5. Submissions go directly to your email

---

## PAGE SUMMARY

| Page | URL | Purpose |
|------|-----|---------|
| `index.html` | flogalhq.com | Main landing — links to all entities |
| `about.html` | flogalhq.com/about | Company overview, thesis, entity map |
| `carriers/index.html` | flogalhq.com/carriers | RRTL + J&D Hauling, services, quote form, careers |
| `sales/index.html` | flogalhq.com/sales | Equipment inventory with filters + detail panel |
| `properties/index.html` | flogalhq.com/properties | Commercial/industrial RE, sell-to-us form |

---

## CONTACT / BRAND INFO

- **Phone:** (214) 702-1336
- **General:** info@flogalhq.com
- **Carriers:** carriers@flogalhq.com
- **Equipment:** equipment@flogalhq.com
- **Properties:** properties@flogalhq.com
- **Careers:** careers@flogalhq.com
- **HQ:** Oklahoma City, OK

---

## COLORS (for reference)

| Token | HEX | Used For |
|-------|-----|----------|
| Navy | `#0B1D2D` | Primary / HoldCo |
| Blue | `#1E4B8F` | Carriers (J&D / RRTL) |
| Gold | `#C79A2B` | Equipment / Accent |
| Green | `#165E3A` | Properties |
| Gray | `#3A3F46` | Industrial |
| Cream | `#F6F7F9` | Backgrounds |

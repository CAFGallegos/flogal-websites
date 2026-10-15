# LEGAL-W2: Publish Website Terms of Service v1.0 (flogal-websites)

Paste this whole file into Claude Code inside the flogal-websites repo. The legal file comes in the same zip, already at its path.

RULES
- The legal text in docs/legal/2026-10-15_hold_website_terms_of_service_v1.0.md is FIXED.
  Copy it byte-for-byte into the page. Do not reword, shorten, or reformat it.
- ADDITIVE ONLY. Do not change, delete, or restyle any other page, section, or footer
  column. Do not touch /privacy, /sms-terms, or /account-deletion.
- No em dashes in anything you write (titles, meta, link labels).

TASK 1. Create the page
  sites/flogalhq/terms/index.html
  sites/flogalhq/terms/v1.0/index.html   (identical copy)
- Use sites/flogalhq/privacy/index.html as the template: same <head> pattern, nav,
  footer, styles. Replace only the main body content.
- Body = the markdown converted to HTML, STOPPING before the "---" line that sits
  directly above "PUBLICATION NOTES". Nothing from that line down is published
  (that includes the companion invoice text).
- Replace [EFFECTIVE_DATE] with today's date (YYYY-MM-DD).
- <title>: "Flogal | Terms of Service". Meta description: "Terms of Service for the
  Flogal websites."
- Links: /privacy and /sms-terms stay relative. The Flogal Apps link stays the absolute
  https://apps.flogalhq.com/legal/terms.
- Keep Section 10.2 in capitals exactly as written (it must be conspicuous).

TASK 2. Footer link
On all five sites, add "Terms of Service" -> https://www.flogalhq.com/terms to the
EXISTING Legal footer column, after SMS Terms. Edit shared/ and run
scripts/sync-shared.mjs if the footer is shared; otherwise edit each footer in place.
Nothing else in any footer changes.

TASK 3. Sitemap
If sites/flogalhq has a sitemap.xml, add /terms. Otherwise skip.

TASK 4. Checks (all must pass before commit)
  In sites/flogalhq/terms/index.html:
    "PUBLICATION NOTES" -> 0     "Companion text" -> 0     "[EFFECTIVE_DATE]" -> 0
    "AS IS, WHERE IS" -> at least 1     "Western District of Oklahoma" -> 1
    "Flogal Leasing LLC" -> at least 1  "—" (em dash) -> 0
  "www.flogalhq.com/terms" appears once in each of the five sites' footers.
  git diff --stat shows only: the two new terms pages, footer files, sitemap,
  and the docs/legal file. If anything else changed, revert it.
  After deploy: /terms, /terms/ and /terms/v1.0 return 200.

TASK 5. Commit and push
Message: "legal: publish Website Terms of Service v1.0 and add footer link"
Report back: the check results and the three live URLs' status codes.

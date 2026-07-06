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
- Entity separation in copy: RRTL, J&D Hauling, Flogal Carriers, Flogal
  Leasing, Flogal Sales, Flogal Properties are DIFFERENT legal entities.
  Never merge, swap, or "simplify" entity names, DOT/MC numbers, or authority
  claims. All compliance/authority language is STOP-AND-FLAG (Legal owns it).
- Inquiry forms: the source tag (e.g. source='sales') must match the site the
  form lives on. A mismatched source silently corrupts lead attribution.
- Design tokens: per-site changes go in that site's tokens.css --accent
  override only. Never edit brand.css for a single-site change.
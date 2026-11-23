# SEO page template and rules (used by the SEO Editor agent)

Pages live in `seo/pages/fix/<slug>.html` and `seo/pages/guide/<slug>.html` as an `<article>` body. `build.py` wraps them (head, schema, canonical, footer disclosures). A page is **noindex until its slug is added to `seo/verified.txt` by a person**.

## Section order
1. Affiliate disclosure, above the first link
2. H1, byline, reviewer, and an "updated" date
3. Quick answer: `<p><b>Quick answer:</b> …</p>`, 40–60 words; becomes the meta description
4. Safety box: `<aside class="safety">`
5. Error-code table for that brand, every code cited
6. Free checks
7. Likely parts, ranked
8. Multimeter test table (good vs bad readings, from a cited service manual)
9. Where the label is for that brand
10. PartSnap CTA link: `/?type=<appliance>&brand=<brand>&symptom=<id>`
11. FAQ: 3–4 real questions
12. Sources, then related links

## Quality gates
All of these must pass, then a person approves:
- Every code, value and label location matches a source fetched in the same run, and is listed in the Sources section.
- At least 40% of the page is unique compared with any sibling page; no brand-swapped templates.
- Has a brand-specific code table, the safety box, and dated sources.
- One real search query per page, with no overlap with existing pages.
- Grade-8 readability or below; no filler, no invented ratings, no "we tested" claims.
- No part numbers or prices from memory.
- Title is 60 characters or less; meta description is 150–155 characters.

## Cadence
- 20 launch pages, then wait 4 weeks.
- After that, 10 pages a week. Go up to 20 a week only if at least 70% of pages are indexed.
- Pause during Google core and spam updates.

## Noindex and merge
- No impressions after 90 days.
- Duplicates a sibling page.
- A brand and appliance combination nobody searches.
- Unverified codes.

## Refresh schedule
- Top 50 pages: every 90 days.
- All other pages: every 6 months.
- Immediately when a manufacturer changes its code page.

## Weekly report
Indexed vs not indexed (with reasons), plus impressions, clicks, CTR and average position by page group, and app CTA clicks for each page.

## Launch list (20)
| Type | Slug | Status |
|---|---|---|
| fix | whirlpool-washer-not-draining | drafted |
| fix | samsung-dryer-not-heating | drafted |
| guide | where-is-washer-model-number | drafted |
| fix | whirlpool-dryer-not-heating | |
| fix | ge-dryer-not-heating | |
| fix | lg-dryer-not-heating | |
| fix | lg-washer-oe-error | |
| fix | samsung-washer-5c-error | |
| fix | samsung-washer-not-spinning | |
| fix | whirlpool-washer-f9e1 | |
| fix | ge-dishwasher-not-draining | |
| fix | whirlpool-dishwasher-not-draining | |
| fix | samsung-refrigerator-not-cooling | |
| fix | whirlpool-ice-maker-not-working | |
| fix | lg-dryer-d80-error | |
| fix | toilet-keeps-running | |
| guide | where-is-dryer-model-number | |
| guide | how-to-test-dryer-thermal-fuse | |
| guide | clean-washer-drain-pump-filter | |
| guide | repair-or-replace-washer | |

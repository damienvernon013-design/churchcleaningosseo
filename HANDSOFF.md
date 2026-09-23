# Handoff — churchcleaningosseo.com

## What was done this session

Replicated the blog + CRM quote wizard pattern from a sister commercial-cleaning
site (per the internal "Playbook — Replicating This Site's Blog + Quote
Wizard for Other Portfolio Sites") onto this church-cleaning site.

### 1. Fixed the CRM industry code
`api/submit-lead.js` previously hardcoded `industry: 23`, flagged in a prior
session as an unverified guess. The reference wizard's actual CRM
`INDUSTRIES` list shows churches/religious institutions as code `1`. The
wizard now defaults `state.industry` to `'1'` and the dropdown lets the
visitor confirm or change it.

### 2. Replaced the single-step quote form with the full CRM wizard
- Added `assets/js/quote-wizard.js` — multi-step wizard (5 CRM questions,
  appointment booking with 1–5 slots, customer details with the full
  facility-type dropdown, review step) copied from the reference
  implementation with church-specific copy (facility/congregation language,
  "church or ministry name" instead of "company name", etc).
- Rewrote `api/submit-lead.js` to validate the full wizard payload shape
  (questions[]/appointments[]/customer), matching CRM rules: appointment
  dates ≥ today+2, weekdays only, timeid 1–39, `num_of_quotes` key (not
  `number_of_quotes`), ResponseCode 200/201 = success. `ZIP_DEFAULT` is
  `55369` (Osseo), `ADDRESS_DEFAULT` is `Osseo, MN`, CORS origin is
  `https://churchcleaningosseo.com`.
- `/request-a-quote/` now uses the `data-quote-wizard` scaffold instead of
  a plain form.
- `quote-form.js` trimmed down to UTM capture + query-param prefill only
  (the `data-submit-mode="api"` handler was removed as dead code — nothing
  has that attribute anymore).
- The homepage hero mini-form is unchanged (already a GET teaser to
  `/request-a-quote/`); its `facility`/`city`/`name`/`phone` fields are
  now read by the wizard's `prefillFromQuery()`.
- Added a `.wiz-*` CSS block to `styles.css` using this site's existing
  cream/navy/gold theme tokens.

### 3. Added a 25-post blog
- Source: a generic commercial-cleaning content pack (`commercial-cleaning-blogs.md`).
- Rewrote all 25 posts for churches/faith facilities: brand → "Osseo
  Church Cleaning", facility language reframed to sanctuaries/fellowship
  halls/nurseries/classrooms, unverifiable named-study citations (Princeton
  study, ACI "88%", FitRated, named OSHA CFR sections, NRA dollar figures)
  softened to general unattributed claims, and the three off-scope
  vertical posts (restaurants, gyms, schools/daycares as standalone client
  types) reframed as general guidance rather than direct service claims,
  since this site only quotes churches.
- One duplicate topic (two separate "what to look for in a cleaning
  contract" posts) was merged into one to land at exactly 25 posts.
- Generated via a scratch Python script (`gen_layout.py` + `posts_data.py`
  + `generate.py`, not committed to the repo) rather than hand-authored, so
  every post shares byte-identical header/nav/footer/JSON-LD. `LocalBusiness`
  JSON-LD only — no `Article`/`BlogPosting` schema, no byline, no publish
  date, matching the rest of the site's content pages.
- Added `blog/index.html` hub with a `card-grid` of all 25 posts.
- Added a "Blog" nav link (between FAQ and Request a Quote) across all 43
  pre-existing pages via a scripted regex insertion, plus a footer "Blog"
  link in the Information column.
- Added all 26 blog URLs to `sitemap.xml` (`changefreq weekly`).

### 4. Added footer credit line
Added "Built and Maintained by Infin8Content" (linking to
`https://infin8content.com/`) as a third `<span>` in `.footer-bottom` on
all 69 pages (43 original + 26 blog), via a scripted regex insertion. The
blog generator's `FOOTER` template (scratch, not committed) was updated to
match, so any future regeneration of blog pages keeps the credit line.

## Verification performed
- `node --check` passed on `api/submit-lead.js`, `assets/js/quote-wizard.js`,
  `quote-form.js`.
- Served the site locally (`python3 -m http.server`) and curled
  `/request-a-quote/` — all six `data-wizard-*` hooks present.
- Curled two blog pages — both return HTTP 200.
- Grepped for cross-portfolio links — zero found (only
  `churchcleaningosseo.com` self-links and the one expected
  `thequotemasters.com` CRM API endpoint).
- Grepped for leftover "Quote Masters" brand references in `blog/` — zero
  (only the intentional shared `ops@thequotemasters.com` email, present on
  every page site-wide by design).
- Confirmed `sitemap.xml` is well-formed XML with 69 URL entries, matching
  the actual count of 69 `index.html` files on disk (43 original + 26 blog).
- Confirmed the Infin8Content footer credit line is present on all 69 pages
  (zero pages missing it after the scripted insertion).

## What you still need to do before this is truly production-ready

- [ ] **No browser click-through was done** — this session had no browser
      tool available. Per the playbook's own explicit warning, click
      through the full wizard in a real browser on a Vercel preview deploy
      before launch, including a real appointment date/time and a real CRM
      submission. Do not skip this.
- [ ] **Set `CRM_API_TOKEN` in the Vercel project's environment variables**
      (Production + Preview) if not already set from a prior session.
- [ ] **No live CRM calls were made** in this session (consistent with the
      prior session's "no testing crm" instruction). The industry code
      change to `1` is based on the reference wizard's CRM `INDUSTRIES`
      list, not a live API check — worth a final confirmation with whoever
      owns the CRM if you want extra certainty before launch.
- [ ] **Vercel deploy** — repo is git-connected; pushing to `main` should
      trigger a deploy automatically.

## Status

Wizard replatform and blog build are complete and internally verified
(syntax, link hygiene, structural checks). **Not yet browser-tested** —
that's the one item blocking a confident "ready to launch."

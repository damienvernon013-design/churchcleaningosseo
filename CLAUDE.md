# churchcleaningosseo.com

Static HTML/CSS SEO microsite for a church-cleaning service in Osseo, MN, plus one Vercel serverless function for lead submission and a multi-step CRM quote wizard. No build step, no framework.

## Structure

- Every page is a standalone `index.html` under a directory matching its URL path (e.g. `/about/index.html` → `/about/`).
- `styles.css` is the single shared stylesheet — no per-page CSS, no web fonts (system Georgia/Arial only). Includes a `.wiz-*` block for the quote wizard.
- `quote-form.js` is the shared client script for UTM capture/persistence (localStorage) and query-param prefill on the homepage teaser form. It no longer handles form submission — that moved to the wizard.
- `assets/js/quote-wizard.js` is the multi-step CRM quote wizard used on `/request-a-quote/` (facility questions, appointment booking, review step, then POST to `/api/submit-lead`).
- `api/submit-lead.js` is a Vercel serverless function (Node, CommonJS) that receives wizard POSTs, validates the full CRM payload shape (questions/appointments/customer), and forwards to the CRM PushLead endpoint server-side.
- `blog/` — 25 posts + `blog/index.html` hub, static pages matching the same header/nav/footer/JSON-LD pattern as every other page. Rewritten for churches/faith facilities from a generic commercial-cleaning content pack; generated via a scratch Python script (not committed) rather than hand-authored, to keep markup byte-identical across posts.

## Content rules (see QA.md for the full checklist)

- No street address anywhere (service-area language only).
- No testimonials, star ratings, or review schema.
- No invented prices, credentials, policy numbers, or staff bios — pricing page uses "contact for quote" language.
- Phone `(866) 958-8773` and email `ops@thequotemasters.com` must appear on every page (header/footer).
- "22 years" claim must stay consistent across all pages.
- URLs: lowercase, hyphenated, trailing slash.
- Every page's footer ends with a "Built and Maintained by Infin8Content" credit line linking to `https://infin8content.com/` (`.footer-bottom` span, after the copyright/insurance lines). Any new page template (including the blog generator) must include it.

## Forms and CRM integration

- Two entry points: the homepage hero mini-form (GET, prefills `/request-a-quote/` via query params: `name`, `facility`, `city`, `phone`) and the full multi-step wizard on `/request-a-quote/` (`assets/js/quote-wizard.js`, POSTs to `/api/submit-lead`).
- The wizard collects the CRM's fixed questionnaire (frequency, current situation, quality feedback, rating, timing preference, number of companies to meet), books 1–5 appointment slots (weekday, 2+ days out, 90-minute minimum same-day gap), then customer details including a full facility-type dropdown (the CRM's 40+ item `INDUSTRIES` list), and a review step before submit.
- `industry` defaults to `1` ("Churches / religious institutions") in the wizard's `state.industry`, matching the CRM's own fixed schema — this replaces the earlier hardcoded `23`, which was an unverified guess.
- `/api/submit-lead` validates the full wizard payload shape (customer, industry, questions[], appointments[]) and calls `https://thequotemasters.com/crm_api/api.php?action=push_lead` with a Bearer token read from `process.env.CRM_API_TOKEN`. Never hardcode the token in source. `ZIP_DEFAULT` is `55369` (Osseo), CORS origin is `https://churchcleaningosseo.com`.

## UTM tracking

- `quote-form.js` captures `utm_source`/`utm_medium`/`utm_campaign`/`utm_term`/`utm_content` from the landing URL into `localStorage`, and forwards `utm_source` with the lead payload.

## Deployment

- Deployed via Vercel, git-connected (push to `main` deploys). No CLI deploy step needed here.
- Required Vercel env var: `CRM_API_TOKEN` (see `.env.example`). Must be set in the Vercel project dashboard before the quote form will work in production.

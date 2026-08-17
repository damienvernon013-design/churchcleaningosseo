# churchcleaningosseo.com

Static HTML/CSS SEO microsite for a church-cleaning service in Osseo, MN, plus one Vercel serverless function for lead submission. No build step, no framework, no client-side JS beyond `quote-form.js`.

## Structure

- Every page is a standalone `index.html` under a directory matching its URL path (e.g. `/about/index.html` → `/about/`).
- `styles.css` is the single shared stylesheet — no per-page CSS, no web fonts (system Georgia/Arial only).
- `quote-form.js` is the single shared client script — handles UTM capture/persistence (localStorage), form prefill from query params, and API submission for `data-submit-mode="api"` forms.
- `api/submit-lead.js` is a Vercel serverless function (Node, CommonJS) that receives quote-form POSTs and forwards them to the CRM PushLead endpoint server-side.

## Content rules (see QA.md for the full checklist)

- No street address anywhere (service-area language only).
- No testimonials, star ratings, or review schema.
- No invented prices, credentials, policy numbers, or staff bios — pricing page uses "contact for quote" language.
- Phone `(866) 958-8773` and email `ops@thequotemasters.com` must appear on every page (header/footer).
- "22 years" claim must stay consistent across all pages.
- URLs: lowercase, hyphenated, trailing slash.

## Forms and CRM integration

- Two quote forms: the homepage hero mini-form (GET, prefills `/request-a-quote/` via query params) and the full form on `/request-a-quote/` (POST via fetch to `/api/submit-lead`).
- `/api/submit-lead` maps form fields to the CRM `push_lead` payload shape and calls `https://thequotemasters.com/crm_api/api.php?action=push_lead` with a Bearer token read from `process.env.CRM_API_TOKEN`. Never hardcode the token in source.
- `industry` is currently hardcoded to `23` in `api/submit-lead.js` — confirm this is the correct CRM industry code for church/faith-facility cleaning before relying on it in production.

## UTM tracking

- `quote-form.js` captures `utm_source`/`utm_medium`/`utm_campaign`/`utm_term`/`utm_content` from the landing URL into `localStorage`, and forwards `utm_source` with the lead payload.

## Deployment

- Deployed via Vercel, git-connected (push to `main` deploys). No CLI deploy step needed here.
- Required Vercel env var: `CRM_API_TOKEN` (see `.env.example`). Must be set in the Vercel project dashboard before the quote form will work in production.

# Handoff — churchcleaningosseo.com

## What was done this session

1. **Removed a stray directory** — a botched `mkdir -p {a,b,c}` had created a literal, empty directory named `{about,contact,...}` at the repo root. Deleted; it held no files.
2. **Wired the quote form to the CRM API**:
   - Added `api/submit-lead.js`, a Vercel serverless function that receives POSTs from the `/request-a-quote/` form, maps fields into the CRM `push_lead` payload shape (per `CRM-QM API Documentation.pdf`), and forwards to `https://thequotemasters.com/crm_api/api.php?action=push_lead` with a Bearer token from `process.env.CRM_API_TOKEN`. The token is never in source.
   - Added `quote-form.js`, included on the homepage and `/request-a-quote/`, which:
     - Intercepts the quote-request form submit, POSTs JSON to `/api/submit-lead`, shows a success/error message inline, and resets the form on success.
     - Prefills the real form from query params carried over from the homepage mini-form.
   - The homepage hero form still uses GET → `/request-a-quote/` to prefill; the real submission happens only on the request-a-quote page.
3. **Added UTM tracking** — `quote-form.js` captures `utm_source/medium/campaign/term/content` from the landing URL into `localStorage` on any page load, and forwards `utm_source` with the CRM lead payload so paid traffic is attributable.
4. **Checked for placeholder content** — full-site grep for lorem ipsum, TODO/TBD, bracket placeholders, fake emails/names, "coming soon," etc. Nothing found. Phone number and email are consistent across all 43 pages.
5. Added `.env.example` (documents `CRM_API_TOKEN`) and `.gitignore` (`.env`, `.vercel`, `node_modules`).

## What you need to do before this is truly production-ready

- [ ] **Set `CRM_API_TOKEN` in the Vercel project's environment variables** (Production + Preview). The form will fail closed with a friendly error until this is set — it does not silently drop leads.
- [ ] **Confirm the CRM `industry` code.** `api/submit-lead.js` hardcodes `industry: 23` (the value from the sample payload in the API doc). Verify with whoever owns the CRM that `23` is actually the code for church/faith-facility cleaning, or tell me the right value and I'll change it in one place.
- [ ] **No automated tests were run** per your instruction ("no testing crm"). I did not call the live CRM endpoint. Recommend a manual smoke test after the env var is set: submit the `/request-a-quote/` form once in the deployed preview and confirm a lead lands in the CRM.
- [ ] **Vercel deploy** — repo is already connected to Vercel per your note, so pushing to `main` should trigger a deploy automatically. No `vercel.json` was needed; static pages + `api/*.js` are auto-detected.

## Status

**READY TO LAUNCH** — pending the two checklist items above (CRM token + industry code confirmation), which are configuration/verification steps outside this repo, not code work.

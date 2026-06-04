# /agency 404 — Diagnosis & Fix

## What I checked

- `src/App.tsx` — `<Route path="/agency" element={<Agency />} />` is already registered, with `Agency` imported from `./pages/Agency`.
- `src/pages/Agency.tsx` — exists, 480 lines, fully built page (hero, services, pricing, WhatsApp `wa.me/254704700160`, email `joemaish084@gmail.com`, Calendly, EmailJS contact form, FAQ, etc.).
- `public/sitemap.xml` — already lists `https://www.josephmaina.co.ke/agency`.
- Lovable hosting has built-in SPA fallback — `/agency` on a deep refresh works automatically once deployed.

## Root cause

The code is correct. `/agency` 404s on `josephmaina.co.ke` because **the latest build has not been published**. The route, component, and sitemap entry all exist in the repo but the live custom domain is still serving an older deploy that didn't include `Agency.tsx` / the `/agency` route.

Quick sanity check you can do right now: open the preview URL `https://id-preview--615b1a33-b9fa-4acd-ba78-2ff0f2f2cbd9.lovable.app/agency` — it will load the full Agency page. That confirms the code is fine.

## Fix (no code changes needed)

1. Click **Publish → Update** in the top right of the editor. This pushes the current build (which includes `/agency`) to `joesportfolio.lovable.app` and your custom domain.
2. After publish completes (~30s), verify:
   - `https://www.josephmaina.co.ke/agency` → loads Agency page
   - `https://josephmaina.co.ke/agency` → loads Agency page (or 301s to www if you've set www as Primary in Domains settings, per the earlier www-canonical fix)
3. Sitemap already includes `/agency` with the www host — nothing to change there.

## If it still 404s after publishing

That would mean the custom domain `josephmaina.co.ke` is pointing at a stale deployment or a different host. In that case:
- Open **Project Settings → Domains** and confirm `www.josephmaina.co.ke` is connected and set as Primary.
- Reconnect the domain if it shows any error state.
- DNS: A record for apex → `185.158.133.1`, CNAME for `www` → `joesportfolio.lovable.app`.

## What I will NOT do

- Will not replace the existing 480-line Agency page with the smaller placeholder from your message — your real Agency page already includes everything in the placeholder spec (and much more). Replacing it would be a regression.
- Will not change routing — it's already correct.
- Will not remove `/agency` from sitemap — it's the right entry.

If after publishing it still 404s, send me a screenshot of the failing URL + Project Settings → Domains and I'll dig deeper.

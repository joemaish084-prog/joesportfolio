# PROGRESS — services page rebuild

Plan: `SERVICE_PAGE_PLAN.md`. Design decisions: `DESIGN_BRIEF.md`. Branch: `service-page-rebuild`.

## Steps

- [x] Step 1 — Audit and design direction
- [x] Step 2 — Content data file
- [x] Step 3 — Hero and services bento grid
- [x] Step 4 — Service card interactions
- [x] Step 5 — Image system
- [ ] Step 6 — Proof and results section
- [ ] Step 7 — Packages table and pricing fix
- [ ] Step 8 — Process, FAQ, schema
- [ ] Step 9 — Visual polish, motion, mobile, accessibility
- [ ] Step 10 — Performance, SEO, cleanup, final QA

## Step 1 notes (2026-11-15)

- **What changed:** audited the agency pages and wrote `DESIGN_BRIEF.md`. No production code touched. The rebuild target is `/agency/services` (`ServicesSection`), with the new bento reused in compact form on `/agency`.
- **Files touched:** `DESIGN_BRIEF.md`, `PROGRESS.md`, `SERVICE_PAGE_PLAN.md` (scope and hosting corrections made before this step).
- **Left open:** five questions for Joseph in `DESIGN_BRIEF.md` section 8 (Meta proof, CTA label, the KES 500K+ vs KES 1.2M+ figures, hero headline, sample dashboard). Each has a default, so Step 2 can start without answers.

## Step 2 notes (2026-11-15)

- **What changed:** added `src/data/services.ts` as the one place for services (13, with price, outcome, who it is for, proof line, category, image slot, CTA), the 3 retainer packages, comparison rows, trust numbers, 5 proof items, the 5 onboarding steps and the 6 agency FAQs. Prices are stored as numbers and printed with `priceLabel` / `servicePrice`, so the "From KES 40,000/month" form that `localizePrice` needs is kept. Homepage tiles, `Agency.tsx`, `servicesContent.ts`, `servicePages.ts` and `shopify.ts` now read from it. The file imports nothing from the app, so there are no import cycles.
- **Files touched:** `src/data/services.ts` (new), `src/data/services.test.ts` (new, 13 tests), `src/components/ServicesPricing.tsx`, `src/components/services/servicesContent.ts`, `src/data/servicePages.ts`, `src/data/shopify.ts`, `src/pages/Agency.tsx`.
- **Left open:**
  - **Checks run:** the 13 new tests and the full suite (220 pass), lint on touched files, `npm run build` and `scripts/check-agency.mjs` all pass. `tsc` still reports 6 errors in `src/lib/chatLead.ts`; they exist on a clean checkout and are not from this step. The homepage price tiles are lazy-loaded, so they are not in `dist/index.html`; they were checked by type and test only, not in a browser.
  - **Still typed by hand, on purpose:** price figures inside prose (service page `metaTitle` / `metaDescription` text, FAQ answers, the "KSh 30,000" Meta minimum ad budget, ad-spend notes in the packages). The data test checks the structured prices only. Step 7 should decide whether to template the prose.
  - **Not merged:** `SHARED_FAQS` in `servicePages.ts` has different wording from `agencyFaqs`, and `servicesContent.ts` `processSteps` (Diagnose to Improve) is a different process from `onboardingSteps`. They are different content, so they were left alone. The services page FAQ in Step 8 should use `agencyFaqs`.
  - **TODO for Joseph (marked `TODO(joseph)` in the file):** who TikTok Ads, Video production, Brand strategy, Graphic design and Strategy consultation are for; a proof line for Shopify (no figure is published); what was done and the period for the iClear result; the campaign period for the Nyeri write-up. Those fields are `null`, so Step 3 must not render them when empty.
  - **Still open from Step 1:** the KES 500K+ (hero trust number) vs KES 1.2M+ (iClear) figures disagree; both stay as published until Joseph says which is right (Q3). The Meta tile uses the published Meta case study (KES 5.33M, 41.3x, client not named), per the Q1 default.
  - TikTok has no service page, so its tile links to `/agency/contact#brief` for now.

## Step 3 notes (2026-11-15)

- **What changed:** `/agency/services` now opens with its own hero (breadcrumb, H1, subhead, "Book a Free Strategy Call", "See results", three trust numbers, one result card) and one bento grid of the 8 services, read from `src/data/services.ts`. Grid is 3 columns on desktop, 2 on tablet, 1 on phones; Meta Ads spans 2. The two lead cards, four secondary cards, the Shopify feature and the sample-data `CampaignSnapshot` are off this page (their files remain for Step 10). `Agency.tsx` skips its generic header and footer CTA for this page. Images are labelled gradient placeholders.
- **Files touched:** new in `src/components/services/`: `ServicesHero.tsx`, `TrustNumbers.tsx`, `HeroResultCard.tsx`, `ServicesBento.tsx`, `ServiceTile.tsx`, `MoreServicesRow.tsx`, `ServiceImagePlaceholder.tsx`. Changed: `ServicesSection.tsx`, `src/pages/Agency.tsx`, `src/data/services.ts` (`bentoServices` now has a fixed tile order).
- **Left open:**
  - **Checks run:** lint on touched files, `npm test` (220 pass), `npm run build`, `check:agency`, `check:seo`, and a browser look at 1440, 768 and 360 in the dark theme. No horizontal scroll. Not checked: light theme, keyboard focus ring in a browser, the USD market view.
  - **Run npm from PowerShell.** `npm run build` fails in Git Bash after `cd /c/...` with a "Could not resolve ... logo-mark.webp" error. It is a drive-letter casing problem, not a code problem.
  - **"See results" goes to `/agency/results`** for now. Step 6 should point it at the proof section on this page.
  - **The "Full service pages" link row stays** (slimmed to one line under the grid). `scripts/check-agency.mjs` requires it and matches it to the JSON-LD list, which includes the "Digital Marketing" overview page that has no tile.
  - **For Step 4:** each tile is one link (the CTA is stretched over the card), ids are `service-<slug>`, and the large and tall sizes are set by slug in `ServicesBento.tsx`. In a filtered view every tile should be `standard`.
  - **For Step 5:** swap `ServiceImagePlaceholder` for `ServiceImage` inside `ServiceTile.tsx`. The tile sets the box size and ratio (16:10 large, 4:5 tall on desktop, 4:3 standard, 96px square thumbnail on phones); the image only has to fill it.
  - **For Step 9:** tiles are tall (about 850px for the top row and 660px for the others on desktop, about 500px each on phones, where the text sits in a narrow column beside the thumbnail). The Free Audit tile has empty space in its middle on desktop. The hero headline's orange phrase needs the light-theme contrast check.
  - **Still waiting on Joseph:** Q3 (KES 500K+ vs KES 1.2M+) and Q4 (headline). The defaults are in use. TikTok and Shopify tiles show no "For" or proof line where the data is `null`.

## Step 4 notes (2026-11-15)

- **What changed:** filter chips (All / Paid ads / SEO / Social / Stores) above the bento grid. Tiles fade and slide to their new place (framer-motion `layout="position"`); in a filtered view every tile is `standard`, so the large and tall sizes exist only under All. Chips are buttons with `aria-pressed`, and a screen-reader line announces "Showing N of 8 services". Tile hover and keyboard focus: lift 4px (already there), image zooms to 1.04, proof line fades in. On touch devices and with reduced motion the proof line is always visible and nothing animates. Tiles still go to their service page; no modal.
- **Files touched:** `src/components/services/ServiceFilterChips.tsx` (new), `ServicesBento.tsx`, `ServiceTile.tsx` (now `forwardRef`, needed by `AnimatePresence`), `src/data/services.ts` (`filterServices`), `src/data/services.test.ts` (2 tests).
- **Left open:**
  - **Checks run:** lint on touched files, `npm test` (222 pass), `npm run build`, `check:agency`, and a desktop browser pass: each chip filters correctly, Tab then Enter selects a chip, hover takes the proof line from opacity 0 to 1 and zooms the image 1.04, no console errors. Not checked: real touch device, reduced-motion emulation (the code path is CSS and a hook, not exercised), light theme. The Playwright window would not go narrower than 517px, so 360px was not re-checked; the chip row scrolls sideways by design on phones.
  - **Filtered view layout:** the Free Audit tile (accent, `md:col-span-2`) can land alone or beside one other tile. Look at it in Step 9.
  - **Chip counts:** the "Social" chip includes TikTok (it is tagged paid and social), so it shows 2 tiles. "Stores" shows 1 (Shopify). Say if either feels too thin.
  - **Step 5:** the image zoom wrapper lives in `ServiceTile.tsx` and clips the image, so `ServiceImage` can replace the placeholder inside it with no other change.

## Step 5 notes (2026-11-15)

- **What changed:** added `ServiceImage` (lazy `<img>`, width/height set, `srcset` of a 400px and a full-size WebP, `sizes` per tile size, grey fill until it loads, alt text from the data file). It finds files in `src/assets/services/` by name (`<slot>.webp`, optional `<slot>-400.webp`), so a new image only needs to be dropped in the folder. A slot with no file, or a file that fails to load, shows the existing labelled placeholder. `ServiceTile` now uses it. Five slots are wired to real work already on the site: Meta (iClear "Water is sweet" banner), Google (iClear promo, the brief's fallback), Social (iClear post), TikTok (iClear short-video still), Shopify (Babyshop Dansar storefront). SEO and Lead Gen keep placeholders.
- **Files touched:** new `src/components/services/ServiceImage.tsx`, `scripts/build-service-images.py` (crops the existing images; needs Pillow from `site-review.local/image-tools`), `src/assets/services/*.webp` (10 files). Changed: `ServiceTile.tsx`, `src/data/services.ts` (new `imageAlt` field), `src/data/services.test.ts` (1 test).
- **Left open:**
  - **Checks run:** lint on touched files, `npm test` (223 pass), `npm run build`, `check:agency`; the built images are emitted and served by `npm run preview` (HTTP 200, image/webp). **Not checked in a browser:** the Playwright window was locked by another process, so the crops, the 1.04 zoom on real images and the 360px thumbnails have not been looked at. Please eyeball `/agency/services` before Step 9.
  - **Google tile uses iClear ad creative, not a Google Ads dashboard.** Alt text says what it is. Replace it with a real dashboard screenshot when you have one.
  - **TikTok crop:** a 9:16 video still cropped to 4:3, so it shows the iClear logo on the jacket and the sink. Check it reads well.
  - **Meta crop** is 1125×703, a little under the 1600×1000 in the brief, because the source banner is only 703px tall. Fine at the 740px tile width on a normal screen; slightly soft on a 2x display.
  - **`ServiceImagePlaceholder` is kept** as the fallback. Delete it in Step 10 only if both missing slots have been filled.
  - **Case-study images (`proof-case-1..3`) are not wired.** They belong to Step 6.
  - The Shopify image is a copy of the file in `public/work/shopify/`, so it is bundled and hashed with the rest.

## Step overrides (read before starting any step)

The audit found the plan was written against an older version of the site. Follow these where they differ from the plan.

- **Step 2.** The homepage prices already match; the job is removing duplication. Prices and packages are repeated in `src/components/ServicesPricing.tsx`, `src/pages/Agency.tsx` (`singlePlatform`, `supportingServices`, `retainerPackages`, `packageComparison`, `faqs`, `steps`), `src/components/services/servicesContent.ts` and `src/data/servicePages.ts`. Create `src/data/services.ts` and point these at it. Keep every price string in the "From KES 40,000/month" form so `localizePrice` still works. Keep the `service-*` anchor ids listed in the brief.
- **Step 3.** Build on `/agency/services`, not `/agency`. `Agency.tsx` must skip its generic inner header and its footer CTA card when `pageKey === "services"`. Read `scripts/check-agency.mjs` first. Use the hero CTA label "Book a Free Strategy Call" unless Q2 is answered otherwise.
- **Step 4.** Tiles link to service pages. No modal. Chips are All / Paid ads / SEO / Social / Stores.
- **Step 5.** Images go in `src/assets/services/` and are sized through `src/lib/responsiveImage.ts`, matching the repo. Not `public/images/services/`.
- **Step 6.** Case study data already exists in `src/data/caseStudies.ts`. Most clients there are not named; keep them unnamed. No testimonials on this page unless `servicePages.ts` testimonials are confirmed for reuse.
- **Step 7.** The packages cards, comparison table and mobile layout already exist on `/agency/pricing`. Do not rebuild them. Point them at the data file and add the compact `PackagesSummary` to the services page. The ad spend note already exists in the repo ("Management fees are separate from your advertising budget"), so it may be used.
- **Step 8.** The process timeline and FAQ accordion already exist. The homepage `FAQPage` JSON-LD already includes all 15 FAQs. Remaining work: add the FAQ to the services page, check whether the agency FAQs are in any JSON-LD, add WhatsApp to the final CTA.
- **Step 9.** The desktop sticky CTA already exists in `AgencyNavigation`. Only the mobile bottom bar is new; check it against the chat panel. Measure orange-on-white contrast for small text (about 2.9:1 by calculation).
- **Step 10.** Counters on `/agency` already print the real value in static HTML; confirm in the prerendered output. Check the graphic design gallery for duplicates (`ui/marquee.tsx` clones children four times). Service pages already exist, so "next ideas" should be about upgrading them.

## Images I still need to supply

Drop these in `src/assets/services/` as WebP. Blur client names and personal details.

- `svc-seo.webp` — Search Console performance graph, 800×600 (4:3). **Placeholder showing now.**
- `svc-lead-gen.webp` — leads arriving by form or WhatsApp, 800×600 (4:3). **Placeholder showing now.**
- `svc-google-ads.webp` — Google Ads dashboard screenshot, 1200×1500 (4:5). Optional: iClear ad creative is in use as a fallback. Also add `svc-google-ads-400.webp` (400px wide) and update its alt text in `src/data/services.ts`.
- `proof-case-1.webp`, `proof-case-2.webp`, `proof-case-3.webp` — results screenshots for the three case studies shown, 1200×675 (16:9)

## Next step

Step 6 — use **Sonnet** (`/model`). Paste: `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 6 only.`

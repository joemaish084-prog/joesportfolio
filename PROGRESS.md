# PROGRESS — services page rebuild

Plan: `SERVICE_PAGE_PLAN.md`. Design decisions: `DESIGN_BRIEF.md`. Branch: `service-page-rebuild`.

## Steps

- [x] Step 1 — Audit and design direction
- [ ] Step 2 — Content data file
- [ ] Step 3 — Hero and services bento grid
- [ ] Step 4 — Service card interactions
- [ ] Step 5 — Image system
- [ ] Step 6 — Proof and results section
- [ ] Step 7 — Packages table and pricing fix
- [ ] Step 8 — Process, FAQ, schema
- [ ] Step 9 — Visual polish, motion, mobile, accessibility
- [ ] Step 10 — Performance, SEO, cleanup, final QA

## Step 1 notes (2026-11-15)

- **What changed:** audited the agency pages and wrote `DESIGN_BRIEF.md`. No production code touched. The rebuild target is `/agency/services` (`ServicesSection`), with the new bento reused in compact form on `/agency`.
- **Files touched:** `DESIGN_BRIEF.md`, `PROGRESS.md`, `SERVICE_PAGE_PLAN.md` (scope and hosting corrections made before this step).
- **Left open:** five questions for Joseph in `DESIGN_BRIEF.md` section 8 (Meta proof, CTA label, the KES 500K+ vs KES 1.2M+ figures, hero headline, sample dashboard). Each has a default, so Step 2 can start without answers.

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

- `svc-google-ads.webp` — Google Ads dashboard screenshot, 1200×1500 (4:5)
- `svc-seo.webp` — Search Console performance graph, 800×600 (4:3)
- `svc-lead-gen.webp` — leads arriving by form or WhatsApp, 800×600 (4:3)
- `proof-case-1.webp`, `proof-case-2.webp`, `proof-case-3.webp` — results screenshots for the three case studies shown, 1200×675 (16:9)

## Next step

Step 2 — use **Sonnet**. Paste: `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 2 only.`

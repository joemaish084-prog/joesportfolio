# SERVICE PAGE REBUILD — MASTER PLAN (josephmaina.co.ke)

> Save this file in the repo root as `SERVICE_PAGE_PLAN.md`.
> Then, in each new Claude Code session, paste ONE line: `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step N only.`

---

## 0. ROLE AND GOAL

You are a senior front-end designer-developer working on josephmaina.co.ke, the site of Joseph Maina, a Nairobi digital marketing specialist and agency owner (Meta Ads, Google Ads, TikTok Ads, SEO, Social Media, Media Buying, graphic design).

Goal: rebuild the **services section/page (`/agency` and `/agency/services`)** so it looks premium, authentic, and interactive, with real images, and converts visitors into "Book a free audit" clicks. It must feel like a big upgrade, not a small tweak.

Audience: Kenyan business owners (restaurants, e-commerce, real estate, startups, SMEs). Many are on mobile data. Speed matters.

## 1. HOW WE WORK (READ FIRST, EVERY SESSION)

1. Do **ONE step per session**. Do not start the next step.
2. Before coding, read `PROGRESS.md`. If it does not exist, create it with the 10 steps unchecked.
3. Read existing code before changing it. Reuse existing colors, fonts, spacing and components. Do not add a new UI library.
4. Keep changes small and reviewable. Commit after each step if git is available: `step N: <what changed>`.
5. When the step is done:
   - Tick it in `PROGRESS.md` and add 3 bullets: what changed, files touched, anything left open.
   - Tell me which model to use for the next step (see table below).
   - Stop.
6. If something is unclear, make the most reasonable choice, note it in `PROGRESS.md`, and move on. Only ask me if you are blocked.
7. Never invent facts, numbers, clients, or testimonials. Use only the facts in section 3. Anything else goes in as a clearly marked `TODO` for me to fill.
8. Plain, direct copy. Short sentences. No buzzwords.

## 2. MODEL ROUTING (SAVES TOKENS)

Switch model in Claude Code with `/model` before starting each step.

| Step | Job | Model |
|---|---|---|
| 1 | Audit + design direction (no code) | **Fable** |
| 2 | Content data file | Sonnet |
| 3 | Hero + services bento grid (hardest visual part) | **Fable** |
| 4 | Service card interactions | Sonnet |
| 5 | Image system + slots | Sonnet |
| 6 | Proof / results section | Sonnet |
| 7 | Packages table + pricing fix | Haiku |
| 8 | Process + FAQ + schema | Haiku |
| 9 | Visual polish, motion, mobile, accessibility | **Fable** |
| 10 | Performance, SEO, cleanup, final QA | Haiku |

Rule: if a cheaper model gets stuck twice on a step, stop and tell me to switch up. Do not burn tokens looping.

## 3. FACTS YOU MAY USE (verify against the repo; the site may have changed)

**Stack:** React + Vite single-page app deployed on Vercel (see `vercel.json`; not WordPress, not Cloudflare). Routes are defined in `src/App.tsx`.

**Scope (public site only):**
- IN scope: the services section shared by `/agency` and `/agency/services`. The same `Agency` component (with a `pageKey` prop) also serves `/agency/results`, `/agency/pricing` and `/agency/contact`; Step 1 must confirm how they reuse the services section so they do not break. The homepage is touched ONLY for the pricing fix.
- Already exist, link to them, do not rebuild: dedicated service pages at `/agency/:service` (`AgencyService`).
- OUT of scope, do not touch: `/hub/*`, `/portal/*`, `/admin`, `/work/*`, `/connect`, `/agency/blog*`, `/agency/ad-budget-calculator`, and the privacy, cookie and terms pages.

**Services (11 total in the site; find the full list in the repo).** Core six: Meta Ads, Google Ads, TikTok Ads, SEO (local and technical), Social Media Management, Media Buying.

**Prices (the agency page is the source of truth, "from" prices):**
Meta Ads from KES 40K, Google Ads from 45K, Social Media from 40K, SEO from 45K.
Known bug: the homepage shows different prices (Meta 35K, Google 40K, Social 45K, SEO 30K). Fix the homepage to match the agency page. For other services, take the price from the repo.

**Retainer packages:** Starter KES 40K, Growth KES 70K, Scale KES 120K.

**Proof (use only these):**
- iClear: 4.2x ROAS on KES 1.2M ad spend
- Convey: 10x leads
- Also in the repo: 2025 full-year social campaign, Nyeri County, iClear 30-day launch. Read the exact wording in the repo before using.

**Contact:** free audit booking via Calendly https://calendly.com/joemaish084/30min. Read the phone, WhatsApp and email from the repo. Do not hard-code new ones.

**Known issues to fix along the way:**
1. Pricing contradicts itself between homepage and agency page.
2. Counters render as "KES 0K+", "0+", "0x+" until JS runs. Put the real final numbers in the HTML and animate up from there (or animate only when scrolled into view, with the real value as fallback).
3. Only about 7 of 15 homepage FAQs are in the FAQPage JSON-LD.
4. Graphic design gallery items are duplicated 2–3x in the DOM (carousel loop).
5. (Removed: dedicated service pages already exist at `/agency/:service`. Check each tile links to the right one.)

## 4. DESIGN DIRECTION (final decisions come out of Step 1)

Principles from research on top agency service pages:
- Benefit headline, not "Our Services". Example: "Meta & Google Ads that pay back in KES."
- Services as a **bento grid**: one large tile for the strongest service (Meta Ads), smaller tiles for the rest. Phone/dashboard mockups inside tiles.
- Every service tile shows: outcome line, who it is for, "from KES X", one proof number, one CTA.
- **Soft CTAs early** ("See results"), **hard CTAs deeper** ("Book a free audit").
- **Layered depth:** skimmers get the hero, serious buyers keep scrolling to method, packages, proof, FAQ.
- Real results screenshots and dashboards beat stock photos. No stock photos of smiling people.
- Palette: reuse the site's existing colors. Keep one strong accent for CTAs. Do not add neon, heavy 3D, or video backgrounds.
- Sticky CTA (mobile bottom bar / desktop nav button): "Book free audit".

Interaction ideas (pick the best 4, do not overdo it):
- Tile hover: lifts, image zooms slightly, result number appears.
- Filter chips: All / Paid Ads / SEO / Social. Grid re-sorts smoothly.
- Packages toggle: monthly vs project, or a highlighted "Most popular" Growth plan.
- Before/after or results slider for case studies.
- Count-up numbers when they scroll into view.
- Accordion FAQ.

Hard limits:
- Respect `prefers-reduced-motion`.
- No new heavy dependencies. Use CSS and existing libs. Animations with transform/opacity only.
- Mobile first. Test at 360px width.
- Lighthouse performance should not drop. Lazy-load images below the fold. WebP/AVIF, with width/height set to avoid layout shift.
- Keyboard accessible, visible focus states, real alt text, color contrast AA.

---

## 5. THE 10 STEPS

### STEP 1 — Audit and design direction (FABLE, no code)
- Find the services section and `/agency` page in the repo. List the files, components, styles, and data they use.
- Note the existing colors, fonts, spacing, button styles (design tokens).
- Create `DESIGN_BRIEF.md` containing:
  1. Current structure and what is weak (be blunt).
  2. Final section order for the page (hero, services bento, proof, process, packages, FAQ, final CTA).
  3. A text wireframe for desktop and mobile.
  4. Chosen tokens (reuse existing) and the one accent.
  5. The 4 interactions chosen and why.
  6. Component list with file names and props.
  7. Image list: every image slot with name, size, ratio, what it shows, and where it goes (see Step 5).
- Create `PROGRESS.md`.
- Do NOT write production code in this step.

### STEP 2 — Content data file (SONNET)
- Create one data file (for example `src/data/services.ts`) as the single source of truth: all services, prices, outcomes, who it is for, proof line, image slot name, category, CTA text; the 3 packages; the proof items; the FAQ list.
- Use only facts from section 3 or from the repo. Mark unknowns `TODO`.
- Point the existing homepage pricing block and the agency page to this file so prices cannot disagree again.

### STEP 3 — Hero and services bento grid (FABLE)
- Build the new hero (benefit headline, one-line subhead, primary CTA "Book a free audit", secondary "See results", a row of 3 trust numbers).
- Build the bento grid of services reading from the data file. Responsive: 3 columns desktop, 2 tablet, 1 mobile, with the large tile spanning 2.
- Use image placeholders for now (correct ratio, tasteful gradient, clear label). Real images arrive in Step 5.
- Static structure and styling only. Light hover states are fine. Deeper interactions come in Step 4.

### STEP 4 — Service card interactions (SONNET)
- Hover/tap behavior on tiles (lift, image zoom, result reveal).
- Filter chips (All / Paid Ads / SEO / Social) with smooth reflow.
- Click on a tile goes to that service's existing page at `/agency/:service` (real URL, better for SEO and sharing). No modal. Add a quick-peek only if Step 1 finds a strong reason.
- Everything works by keyboard and on touch.

### STEP 5 — Image system (SONNET)
- Create `public/images/services/` (or the repo's equivalent) and the naming scheme from `DESIGN_BRIEF.md`.
- Build one reusable `ServiceImage` component: lazy loading, WebP/AVIF with fallback, set width/height, blur-up or solid placeholder, alt text from the data file.
- Real assets to use, in this order of preference: (1) my real results screenshots and dashboards (I will drop them in a folder; blur client names), (2) my own portfolio and design work already on the site, (3) generated illustrations in one consistent flat style using my accent color, no text, no logos.
- No stock photos of people. No copyrighted logos or brand artwork.
- Wire every slot. Any missing real image keeps a clean placeholder and is listed in `PROGRESS.md` under "Images I still need to supply".

### STEP 6 — Proof and results section (SONNET)
- Results strip with count-up numbers (real value in HTML, animate on scroll into view).
- 2–3 case study cards: iClear 4.2x ROAS on KES 1.2M, Convey 10x leads, and one more from the repo. Each shows: client, goal, what was done, result, image.
- Testimonials only if real ones exist in the repo. Otherwise leave a `TODO` slot. Never fabricate.

### STEP 7 — Packages table and pricing fix (HAIKU)
- Comparison table: Starter KES 40K, Growth KES 70K, Scale KES 120K. Growth marked "Most popular".
- Rows: what is included (read from the repo's existing package details), ad budget guidance if it exists in the repo, best for.
- Mobile: stacked cards, not a squeezed table.
- Confirm homepage and agency page now show identical prices, from the data file.
- Add a note for ad spend: "Ad budget is paid separately to the platform" only if the repo already says this.

### STEP 8 — Process, FAQ, schema (HAIKU)
- 5-step process section (use the repo's existing five steps) as a simple horizontal/vertical timeline.
- FAQ accordion from the data file. Put **every** FAQ with its answer into the FAQPage JSON-LD (currently only about 7 of 15 are).
- Final CTA band: "Book a free audit" + WhatsApp link.

### STEP 9 — Visual polish, motion, mobile, accessibility (FABLE)
- Review the whole page at 360px, 768px, 1440px. Fix spacing, hierarchy, alignment, type scale, and rhythm so it looks designed, not assembled.
- Add subtle scroll-in reveals (transform/opacity only). Respect reduced motion.
- Add the sticky CTA (mobile bottom bar, desktop nav button).
- Accessibility pass: heading order, focus rings, contrast AA, keyboard path through filters, modal, accordion, and table.
- List anything that still looks weak in `PROGRESS.md`.

### STEP 10 — Performance, SEO, cleanup, final QA (HAIKU)
- Fix the duplicated graphic design gallery items in the DOM.
- Make sure counters and key numbers exist in the static HTML.
- Unique title and meta description for `/agency`. Check canonical, OG image, and the sitemap.
- Remove dead code and unused CSS from this rebuild. Run build, lint, and typecheck, and fix errors.
- Run Lighthouse (mobile) and record scores in `PROGRESS.md`. Flag anything under 90 and why.
- Write a short "What changed" summary and a "Next ideas" list (for example, upgrading the existing `/agency/:service` pages to match the new design).

---

## 6. PER-STEP COMMANDS (paste one per session)

- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 1 only.`   (use Fable)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 2 only.`   (Sonnet)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 3 only.`   (Fable)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 4 only.`   (Sonnet)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 5 only.`   (Sonnet)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 6 only.`   (Sonnet)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 7 only.`   (Haiku)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 8 only.`   (Haiku)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 9 only.`   (Fable)
- `Read SERVICE_PAGE_PLAN.md and PROGRESS.md. Do Step 10 only.`  (Haiku)

Tip: start a fresh session for each step. The plan and PROGRESS.md carry the memory, so you do not pay to re-explain.

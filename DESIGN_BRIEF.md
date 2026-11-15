# DESIGN BRIEF — services page rebuild

Output of Step 1 of `SERVICE_PAGE_PLAN.md`. Audit date: 2026-11-15. No production code was changed.

Where this brief and the plan disagree, this brief wins, because it was written against the code. The per-step consequences are listed in `PROGRESS.md` under "Step overrides".

---

## 1. Current structure, and what is weak

### 1.1 What exists today

The plan assumed one `/agency` page with a services section. The repo is different:

| Route | What renders | File |
|---|---|---|
| `/agency` | Hero, 4 hub cards, a plain text list of service links, Shopify feature, 3 proof cards, logo marquee, "why" cards, customer journey, paid media approach, creative showcase, 5-step "how it works", footer CTA | `src/pages/Agency.tsx` (`pageKey="home"`) |
| `/agency/services` | Generic inner header, then `ServicesSection` | `src/pages/Agency.tsx` + `src/components/services/ServicesSection.tsx` |
| `/agency/pricing` | 3 retainer cards (Growth is "Most popular"), comparison table, single-service fee table, calculator link, payments, 6-question FAQ accordion | `src/pages/Agency.tsx` (`pageKey="pricing"`) |
| `/agency/results` | 7 case study cards, 4 blog breakdowns | `src/pages/Agency.tsx` (`pageKey="results"`) |
| `/agency/contact` | Calendly embed, WhatsApp card, 3-step brief form | `src/pages/Agency.tsx` (`pageKey="contact"`) |
| `/agency/:service` | 7 live service pages plus Shopify | `src/pages/AgencyService.tsx`, `src/data/servicePages.ts` |
| `/` (homepage) | `ServicesPricing`: a 4-tile bento (Meta, Google, Social, SEO) | `src/components/ServicesPricing.tsx` |

`Agency.tsx` is one 1,126-line component that switches on `pageKey`. The services page is the only one already split out into its own folder (`src/components/services/`, 12 files, last reworked in commits `378ad02` to `0b938f9`).

**Files the services page uses**

- `src/components/services/ServicesSection.tsx` (page body)
- `PrimaryServiceCard.tsx`, `ProofPanel.tsx`, `SecondaryServiceCard.tsx`, `PlatformDecision.tsx`, `CampaignSnapshot.tsx`, `PerformanceMetric.tsx`, `ProcessTimeline.tsx`, `PricingNotes.tsx`, `ServicesCTA.tsx`, `CtaLink.tsx`
- `src/components/services/servicesContent.ts` (all copy for the page)
- `src/components/shopify/ShopifyAgencyFeature.tsx`
- `src/components/agency/AgencyNavigation.tsx` (sticky header, already has a "Book a Call" button at every width)
- `src/data/servicePages.ts` (service pages, `CALENDLY_URL`, `SERVICE_PROCESS`), `src/data/caseStudies.ts`, `src/data/serviceVisuals.ts`
- `src/seo/agencyHeads.ts` (title, description, JSON-LD including `#service-list`)
- `src/lib/market.ts` (`useMarket`, `localizePrice`, `pick`: the KES / USD toggle), `src/lib/spotlight.ts`, `src/lib/track.ts`, `src/lib/responsiveImage.ts`
- `src/index.css` (tokens and utilities), `tailwind.config.ts`
- `scripts/check-agency.mjs` and the prerender (`scripts/prerender.mjs`, `src/prerender`) assert on this page's output

### 1.2 What is weak (blunt)

1. **No picture on the whole services page.** Twelve components and not one image. The repo has 93 files in `src/assets`, including real iClear ad creative that the `/agency/:service` pages already use. The services page uses none of it.
2. **The biggest visual is fake.** `CampaignSnapshot` is the only dashboard on the page and it is labelled "ILLUSTRATIVE CAMPAIGN VIEW / Sample data". Meanwhile verified results sit in small panels or on other pages. A buyer sees invented numbers large and real numbers small.
3. **The Meta Ads card says "results available on request"** while `src/data/caseStudies.ts` holds a published Meta case study (KES 5.33M attributed revenue, 41.3x ROAS, 953 purchases). A code comment says this was left out on purpose. That choice now costs the strongest service its proof. See open question Q1.
4. **Four different ways of listing services on one page.** Two giant cards, four small cards, five pills ("Also available"), then a link list of seven service pages with standfirsts. There is no single view of what is on offer.
5. **Only 2 of 13 services get a real card.** TikTok Ads, one of the core six, is a pill that links to the contact page. Lead Generation has its own service page and price but no card.
6. **The two lead cards are walls of text.** Each carries a badge, eyebrow, title, two paragraphs, 6 "best for" chips, 9 inclusions, 5 tags, a proof panel, a CTA and a price. Nothing can be skimmed.
7. **Two headers before any service appears.** The generic inner header (breadcrumb, H1, intro) is followed by a second label, H2, intro and statement. On a phone that is more than a full screen of headings.
8. **Two closing CTAs stacked.** `ServicesCTA` ends the section, then `Agency.tsx` adds its own "Find the right next step" card to every page except contact.
9. **`/agency` has no services grid at all.** Services appear there only as a small text link list under the hub cards.
10. **Prices live in five places.** `ServicesPricing.tsx`, `Agency.tsx` (`singlePlatform`, `supportingServices`, `retainerPackages`), `servicesContent.ts` (`primaryServices`, `pricingContent`), and `servicePages.ts`. They agree today. Nothing keeps them agreeing.
11. **The five-step process exists twice with different steps.** `Agency.tsx` `steps` and `servicePages.ts` `SERVICE_PROCESS` are the same commercial steps (call, proposal, deposit, launch, report). `servicesContent.ts` `processSteps` is a different campaign method (Diagnose, Plan, Build, Launch, Improve).
12. **Case study covers are Unsplash stock photos** (the code says so: "Stock illustration, not the client"). The plan wants real screenshots instead.
13. **Possible contrast failure in light theme.** `--primary` is `hsl(25 100% 50%)` (#FF6A00). On white that is about 2.9:1. It is used for small text (`text-primary` eyebrows and links) across the page. AA needs 4.5:1. Not measured in a browser yet; Step 9 must check both themes.

### 1.3 Plan assumptions that are already out of date

| Plan says | Repo says |
|---|---|
| Homepage prices differ (Meta 35K, Google 40K, Social 45K, SEO 30K) | Already fixed. Homepage shows 40K / 45K / 40K / 45K, matching the agency pages. The duplication (1.2 item 10) is the remaining problem. |
| Counters render "0" until JS runs | Already handled on `/agency`: `CountUp` prints the real value in a static span, and `index.css` swaps it for the animated one only when JS is on. Step 10 should confirm this in the prerendered HTML. |
| Only about 7 of 15 homepage FAQs are in JSON-LD | Already fixed. `src/seo/heads.ts` maps every entry of `src/data/faqs.ts` (15) into `FAQPage`. Not yet checked: whether the 6 FAQs on `/agency/pricing` are in any JSON-LD. |
| Gallery items duplicated 2–3x | Not confirmed for the gallery. `src/components/ui/marquee.tsx` clones its children (`repeat = 4`), which affects `BrandsLogoMarquee`. Step 10 should check the graphic design gallery itself. |
| Packages table, "Most popular", stacked mobile cards, FAQ accordion need building | All already exist on `/agency/pricing`. |
| Primary CTA "Book a free audit" | The site's one approved call label is "Book a Free Strategy Call". The free audit is a separate service (`/agency/digital-marketing-audit`, "Free for now"). See Q2. |

---

## 2. Final section order

Target page: **`/agency/services`**. The new bento is also reused in a compact form on `/agency`, replacing the text link list.

1. **Hero** (replaces both the generic inner header and the `servicesHeader` block, for this page only)
2. **Services bento** with filter chips
3. **Proof**: results strip, then 3 case study cards
4. **Which platform?** (existing `PlatformDecision`, kept as is)
5. **Process** (existing `ProcessTimeline`, kept)
6. **Packages**: 3 compact cards that link to `/agency/pricing` for the full table, then the calculator link row
7. **FAQ** accordion
8. **Final CTA band** (one only: `ServicesCTA` plus a WhatsApp link; the generic footer CTA is switched off for this page)

Removed from this page:

- `CampaignSnapshot` (sample data). The file stays until Step 10 decides whether anything else uses it.
- `ShopifyAgencyFeature` on this page only. Shopify becomes a bento tile. The feature stays on `/agency`.
- The two lead cards, four secondary cards, "Also available" pills and the service-page link list. The bento replaces all four.

Must survive the rebuild:

- Anchor ids `service-google-ads`, `service-meta-ads`, `service-seo-optimization`, `service-social-media-management`, `service-content-strategy`, `service-digital-marketing-audit`, `service-tiktok-ads`, `service-video-production`, `service-graphic-design`, `service-brand-strategy`, `service-strategy-consultation`. `/agency/pricing` and `legacyAgencyTarget()` link to them.
- The `id="services"` section anchor.
- A crawlable link to every live service page (the bento tiles and the "also available" row cover this).
- The KES / USD market toggle: every price goes through `localizePrice` or `pick`.
- Whatever `scripts/check-agency.mjs` asserts. Read it before Step 3.

---

## 3. Text wireframes

### Desktop (1440px, content max-width 72rem)

```
[sticky nav: logo | Services Results Pricing Blog | Book a Free Strategy Call]

HERO --------------------------------------------------------------
 Agency > Services
 JOSEPH MAINA MARKETING · NAIROBI
 Digital marketing services in Nairobi          +---------------------+
 that pay back in KES.                          | RESULT CARD (HTML)  |
 One line subhead.                              | Tag · period        |
 [Book a Free Strategy Call] [See results v]    | KES 5.43M           |
                                                | tracked revenue     |
 KES 500K+      20+           3+                | 26.4x  ·  938 orders|
 ad budgets     campaigns     years             | Read the case study |
                                                +---------------------+

SERVICES ----------------------------------------------------------
 What I can run for you            (All) (Paid ads) (SEO) (Social) (Stores)
 +-------------------------------+ +--------------+
 | META ADS            [image]   | | GOOGLE ADS   |
 | outcome line                  | | [image]      |
 | For: consumer brands...       | | outcome line |
 | From KES 40,000/mo            | | For: ...     |
 | proof line        Explore ->  | | From 45,000  |
 |                               | | 15.5x ROAS   |
 +-------------------------------+ +--------------+
 +-----------+ +-----------+ +-----------+
 | SEO       | | SOCIAL    | | TIKTOK ADS|
 +-----------+ +-----------+ +-----------+
 +-----------+ +-----------+ +-----------+
 | LEAD GEN  | | SHOPIFY   | | FREE AUDIT|  <- accent tile
 +-----------+ +-----------+ +-----------+
 Also available: Content strategy · Video production · Graphic design ·
                 Brand strategy · Strategy consultation

PROOF -------------------------------------------------------------
 [ number | number | number | number ]   results strip, count-up
 +--------------+ +--------------+ +--------------+
 | image        | | image        | | image        |
 | client/goal  | | client/goal  | | client/goal  |
 | what was done| | ...          | | ...          |
 | result       | |              | |              |
 +--------------+ +--------------+ +--------------+
 Past results are specific to each campaign.        See all results ->

WHICH PLATFORM?  [Google Ads] [Meta Ads] [Not sure yet?]   (existing)

PROCESS   01 -- 02 -- 03 -- 04 -- 05                      (existing)

PACKAGES  [Starter 40K] [GROWTH 70K · Most popular] [Scale 120K]
          Management fee only. Ad spend is paid to the platform.
          Compare packages in full ->        [calculator link row]

FAQ       heading left | accordion right

CTA BAND  Not sure where your next customer should come from?
          [Book a Free Strategy Call] [Message me on WhatsApp]
```

### Tablet (768px)

Two columns. Meta Ads spans both columns. Google Ads is a normal tile. The hero result card drops below the trust numbers.

### Mobile (360px)

```
[nav: logo | Book a Call | menu]
Agency > Services
H1 (text-4xl, 3 lines)
subhead
[Book a Free Strategy Call]   full width
[See results]                 full width
500K+ | 20+ | 3+              3 columns, small labels
[result card]

chips: horizontal scroll row, 44px tall
[META ADS tile, image 16:9 on top]
[GOOGLE ADS tile]
[SEO] [SOCIAL] ... one column, image left 96px, text right
Also available: wrapped pills

results strip: 2 x 2
case cards: one column
platform tabs (existing)
process: vertical timeline (existing)
packages: stacked cards, Growth first
FAQ accordion
CTA band

[bottom bar: Book a Free Strategy Call | WhatsApp icon]   added in Step 9
```

On touch there is no hover, so the proof line on each tile is always visible.

---

## 4. Tokens (all existing; nothing new)

| Token | Value | Use |
|---|---|---|
| `--primary` / `--orange` | `hsl(25 100% 50%)` | **The one accent.** Primary buttons, active chip, key numbers. |
| `--primary-foreground` | `hsl(0 0% 7%)` | Text on orange buttons (dark on orange passes AA). |
| `--orange-light`, `--orange-dark` | `30 100% 58%`, `25 100% 40%` | Gradient end; candidate for small orange text in light theme. |
| `--background`, `--foreground` | white / 7% (light), 5% / 98% (dark) | Page. |
| `--card`, `--muted`, `--muted-foreground`, `--border` | as in `index.css` | Tiles, secondary text, hairlines. |
| `--radius` | `1.25rem`; agency cards use `1rem` (`.agency-page .surface-card`) | Tile corners. |
| `--shadow-elegant`, `--shadow-soft`, `--shadow-orange-glow` | as in `index.css` | Highlighted package, hover. |
| `--ease-out-apple` | `cubic-bezier(0.22, 1, 0.36, 1)` | All motion. |

- **Fonts** (self-hosted): Space Grotesk (`font-display`, headings and numbers), Inter (`font-sans`, body), Instrument Serif italic (`font-serif`, one accent phrase per heading at most).
- **Type scale in use:** H1 `text-4xl sm:text-5xl lg:text-6xl`, H2 `text-3xl sm:text-4xl`, tile title `text-xl` to `text-3xl`, eyebrow `text-xs uppercase tracking-[0.14em–0.18em]`, body `text-sm` to `text-lg`.
- **Spacing:** sections `py-16 sm:py-20`; content `max-w-6xl` inside `container px-4`; grid gaps `gap-4` (tiles) and `gap-6` (cards).
- **Utilities to reuse:** `surface-card`, `spotlight` + `trackSpotlight`, `dot-grid`, `text-gradient`, `bg-gradient-orange`, `mono-accent`, `SectionLabel`.
- **Buttons:** shadcn `Button`, `rounded-full`, `size="lg"`; primary is solid orange, secondary is `variant="outline"`. Tap targets `min-h-11` or `min-h-12`.
- **Rules:** platform colours (`#EA4335`, `#1877F2`) stay as small badge dots only. No second accent colour. No new gradients. `backdrop-filter` and drifting glows stay off on phones, as `index.css` already does.

---

## 5. The four interactions

1. **Filter chips with smooth reflow.** One grid replaces four lists, so people need a way to narrow it. Built with framer-motion `layout` (already a dependency). Chips are real buttons with `aria-pressed`. In a filtered view every tile is the same size; the large Meta tile exists only under "All".
2. **Tile hover and focus:** lift 4px, image scales to 1.04, proof line fades in. Transform and opacity only. On touch and with reduced motion, the proof line is simply always shown. The whole tile is one link to the service page.
3. **Count-up on the results strip** when it scrolls into view. Reuses the existing `CountUp` pattern so the real number is in the HTML first.
4. **FAQ accordion**, the existing shadcn `Accordion`. Keyboard support comes free.

Left out, and why:

- **Modal or detail panel:** every tile already has a real page to go to.
- **Packages toggle:** the KES / USD `MarketToggle` already is the toggle. A second one would confuse.
- **Before / after slider:** there are no before and after assets.

The existing `PlatformDecision` tabs stay. They are not new work.

---

## 6. Components

All new files go in `src/components/services/`. Data comes from the Step 2 file (`src/data/services.ts`).

| Component | File | Props | Notes |
|---|---|---|---|
| `ServicesHero` | `ServicesHero.tsx` | none (reads data file) | Breadcrumb, H1, subhead, 2 CTAs, `TrustNumbers`, `HeroResultCard`. `Agency.tsx` skips its generic header when `pageKey === "services"`. |
| `TrustNumbers` | `TrustNumbers.tsx` | `items: { value: number; prefix?: string; suffix?: string; label: string }[]` | Static in the hero (no count-up above the fold). |
| `HeroResultCard` | `HeroResultCard.tsx` | `study: CaseStudySummary` | HTML card, no image, so the hero adds no image weight. |
| `ServicesBento` | `ServicesBento.tsx` | `services: Service[]`; `variant?: "full" \| "compact"`; `showFilters?: boolean` | `compact` is for `/agency`: no chips, no images on small tiles. |
| `ServiceTile` | `ServiceTile.tsx` | `service: Service`; `size: "large" \| "tall" \| "standard"`; `index: number` | Keeps the service's `anchorId` as its `id`. |
| `ServiceFilterChips` | `ServiceFilterChips.tsx` | `categories: { key: ServiceCategory \| "all"; label: string }[]`; `value`; `onChange` | Built in Step 4. |
| `MoreServicesRow` | `MoreServicesRow.tsx` | `items: { anchorId: string; label: string; to: string }[]` | Services with no page of their own. |
| `ServiceImage` | `ServiceImage.tsx` | `slot: ImageSlot`; `sizes: string`; `priority?: boolean`; `className?: string` | Built in Step 5. Step 3 uses `ServiceImagePlaceholder` with the same props. |
| `ResultsStrip` | `ResultsStrip.tsx` | `items: { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; source: string }[]` | Step 6. Lift `CountUp` out of `Agency.tsx` into `src/components/CountUp.tsx`. |
| `CaseStudyCard` | `CaseStudyCard.tsx` | `study: ProofItem` | Step 6. Shows client (or "Client not named"), goal, what was done, result, image. |
| `PackagesSummary` | `PackagesSummary.tsx` | `packages: RetainerPackage[]` | Step 7. Compact cards; the full table stays on `/agency/pricing`, now reading the same data. |
| `ServicesFaq` | `ServicesFaq.tsx` | `faqs: { q: string; a: string }[]` | Step 8. |
| `ServicesCTA` | existing | none | Add the WhatsApp link in Step 8. |
| `StickyBookingBar` | `src/components/agency/StickyBookingBar.tsx` | none | Step 9, mobile only. Check it does not cover the chat panel. |

Kept unchanged: `PlatformDecision`, `ProcessTimeline`, `CtaLink`, `ProofPanel` (may be retired in Step 10 if nothing uses it).

**Bento contents** (order under "All"):

| Tile | Size | Category | Links to | Proof source |
|---|---|---|---|---|
| Meta Ads | large (2 cols × 2 rows) | paid | `/agency/meta-ads-management` | see Q1 |
| Google Ads | tall (1 × 2) | paid | `/agency/google-ads-management` | Google Ads launch case study |
| SEO | standard | seo | `/agency/seo-services-nairobi` | `servicePages.ts` case study, read exact wording |
| Social Media | standard | social | `/agency/social-media-management` | 2025 social case study |
| TikTok Ads | standard | paid, social | `/agency/contact` brief (no page exists) | 2025 social case study, TikTok figure |
| Lead Generation | standard | paid | `/agency/lead-generation` | Convey, 10x qualified leads |
| Shopify stores | standard | stores | `/agency/shopify-services` | `src/data/shopify.ts`, read exact wording |
| Free audit | standard, accent fill | seo | `/agency/digital-marketing-audit` | none; price "Free for now" |

"Also available" row: Content strategy, Video production, Graphic design, Brand strategy, Strategy consultation.

Chips: All / Paid ads / SEO / Social / Stores. The plan listed four; "Stores" is added because Shopify fits none of them.

"Media Buying" is in the plan's core six but is not a named agency service in the repo. It is treated as covered by the three paid tiles.

---

## 7. Image slots

Repo convention: images are imported from `src/assets` (Vite hashes them) and sized through `src/lib/responsiveImage.ts`. So the folder is **`src/assets/services/`**, not `public/images/services/`.

Naming: `<slot>.webp`, kebab-case, exported at the source size below. Every slot sets `width` and `height`. Only the hero is above the fold and it has no image, so every slot is lazy-loaded.

| Slot | Where | Ratio | Source size | Shows | Available now |
|---|---|---|---|---|---|
| `svc-meta-ads` | Meta tile (large) | 16:10 | 1600×1000 | Real Meta ad creative, or an Ads Manager results screenshot with names blurred | Yes: `design-iclear-facebook.webp` (1600×703, needs a crop) |
| `svc-google-ads` | Google tile (tall) | 4:5 | 1200×1500 | Google Ads dashboard screenshot, names blurred | Fallback: `design-iclear-filter-promo.webp` (1400×1750). **Screenshot needed.** |
| `svc-seo` | SEO tile | 4:3 | 800×600 | Search Console performance graph, domain blurred | **Needed.** Placeholder until supplied. |
| `svc-social` | Social tile | 4:3 | 800×600 | A real social post | Yes: `design-iclear-monday.webp` |
| `svc-tiktok-ads` | TikTok tile | 4:3 | 800×600 | Still from a short-form video | Yes: `short-iclear-dishwash.webp` |
| `svc-lead-gen` | Lead gen tile | 4:3 | 800×600 | Leads arriving (form or WhatsApp list), personal details blurred | **Needed.** |
| `svc-shopify` | Shopify tile | 4:3 | 800×600 | Storefront screenshot | Check what `ShopifyAgencyFeature` already uses |
| `svc-audit` | Audit tile | none | none | Icon on accent fill | Not an image |
| `proof-case-1` | Case card 1 | 16:9 | 1200×675 | Results screenshot for that campaign, names blurred | **Needed.** Current covers are Unsplash stock. |
| `proof-case-2` | Case card 2 | 16:9 | 1200×675 | Same | **Needed.** |
| `proof-case-3` | Case card 3 | 16:9 | 1200×675 | Same | **Needed.** |

Rendered sizes for the `sizes` attribute: large tile about 740px wide on desktop and full width on mobile; standard tiles about 360px on desktop, 96px thumbnail on mobile; case cards about 360px on desktop and full width on mobile.

No stock photos of people. iClear and Convey creative is already published on the site and approved for use.

---

## 8. Open questions for Joseph

None of these block Step 2. Each has a default that will be used if there is no answer.

- **Q1. Meta Ads proof.** The services page deliberately shows no Meta figure, yet the Meta case study (KES 5.33M, 41.3x ROAS, client not named) is published on `/agency/results`. Default: show it on the Meta tile, labelled "Client not named" with its period, the same way the Google figure is shown.
- **Q2. CTA label.** The plan says "Book a free audit". The site's approved label is "Book a Free Strategy Call", and the Calendly link is a 30-minute call. Default: keep "Book a Free Strategy Call" everywhere, and give the free audit its own tile.
- **Q3. Trust numbers.** The hero would use the three confirmed figures: KES 500K+ ad budgets, 20+ campaigns, 3+ years. But the iClear case study on the Meta service page says "KES 1.2M+ ad spend managed". The two do not agree. Default: keep the confirmed three and leave the iClear line where it is. Please say which figure is right.
- **Q4. Hero headline.** Default: "Digital marketing services in Nairobi that pay back in KES." It keeps the search phrase from the current H1. The plan's example ("Meta & Google Ads that pay back in KES.") drops it.
- **Q5. Sample dashboard.** Default: remove `CampaignSnapshot` from the page, because it is sample data.

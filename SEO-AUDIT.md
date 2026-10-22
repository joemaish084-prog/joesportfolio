# SEO audit — josephmaina.co.ke

Audited 22 October 2026 against the 20 checks in your screenshot. The initial technical fixes are deployed and the sitemap is submitted. All seven service pages have now been reviewed and cleared for indexing locally. Next: deploy the reviewed content, recheck the live pages and canonical warning, and measure mobile performance.

## Deployment follow-up

After deployment, verified the live homepage uses the updated title; unknown URLs return HTTP 404; the apex domain returns HTTP 308 to `www` while preserving the path and query; hub/login and admin return HTTP 200 with noindex headers; and the live sitemap returns HTTP 200 with 76 URLs.

Submitted `https://www.josephmaina.co.ke/sitemap.xml` through the domain property's Search Console Sitemaps report. Google confirmed **“Sitemap submitted successfully.”** This confirms submission, not indexing of every URL. Deployment and sitemap submission are complete; the observations below describe the original audit unless otherwise stated.

## Service-page review progress

- **Digital Marketing for Kenyan SMEs:** approved the results-timeline FAQ and softened the suitability wording. Removed the outstanding review notes and cleared the draft flag locally. The next deployment will add `/agency/digital-marketing-kenya` to the sitemap and allow indexing. Six service drafts remain.
- **Meta Ads Management:** confirmed minimum ad spend of KSh 30,000/month, separate from the management fee starting at KSh 40,000/month. Also confirmed the existing iClear figures: KSh 1.2M+ ad spend managed, 4.2x ROAS, and 180% follower growth. FAQ updated and draft flag cleared locally. The next deployment will add `/agency/meta-ads-management` to the sitemap and allow indexing. Five service drafts remain.
- **Google Ads Management:** confirmed Shopping and Performance Max management. Updated the FAQ, campaign list and metadata. Replaced the mixed-channel iClear example with the existing published Google Ads launch case study (KSh 1.94M attributed revenue, 339 orders, 15.5x ROAS), preserving client anonymity and linking to the portfolio breakdown. Cleared the draft flag locally; the next deployment will add `/agency/google-ads-management` to the sitemap. Four service drafts remain.

- **SEO Services:** confirmed a typical 3–6 month timeframe for meaningful progress. Replaced the Nyeri example with the owner-supplied Beauty Square result: search positions improved from 20 to 14 to 9; around 2,000 monthly active users; more than 20 DM enquiries. No keyword, measurement period, organic-only user count or SEO attribution for the DMs was supplied, so the copy does not invent those details or claim traffic growth from a baseline. No testimonial was invented. Cleared the draft flag locally; the next deployment will add `/agency/seo-services-nairobi` to the sitemap. Three service drafts remain.

- **Social Media Management:** confirmed four posts weekly on two client-selected platforms at the base KSh 40,000/month tier. Light social video shoots are included; larger video productions are charged separately. Updated pricing notes, inclusions, FAQs and metadata, then cleared the draft flag locally. No per-platform multiplication, fixed monthly post total or shoot-day allowance was invented. The next deployment will add `/agency/social-media-management` to the sitemap. Two service drafts remain.

- **Lead Generation:** confirmed a starting price of KSh 50,000/month with landing pages included; the client's team handles lead follow-up and sales. Updated page copy, FAQs, inclusions and the related blog topic hub's displayed price, then cleared the draft flag locally. Ad spend remains separate. The next deployment will add `/agency/lead-generation` to the sitemap. Only the marketing audit service remains a draft.

- **Marketing Audit:** free for now, with a written report or verbal walkthrough on a call in 1–2 days. Removed the fee-credit question, paid-audit prices and the unsupported claim that an audit preceded Convey's campaign results. Clarified the existing Convey article and AI-readable summary: employment first, consultancy later. No audit case study or testimonial was invented. Updated the agency page, service pages, blog topic hubs, audit article and llms.txt to match the free offer. Cleared the final draft flag locally; all seven service pages are ready for the next deployment.

## What was actually checked in the original audit
- Fetched all **76 live sitemap URLs** and **72 additional linked site resources**. No request failures, accidental noindex directives, or incorrect canonical URLs were found among those sitemap pages. This checks linked resources in the initial HTML; it is not a full audit of every external link or interactive state.
- Confirmed that HTTP redirects to HTTPS. The apex domain (`https://josephmaina.co.ke/`) currently serves the same content without redirecting to the canonical `www` host.
- Confirmed that an invented URL currently returns **HTTP 200** with an SPA shell and noindex. It should return HTTP 404.
- Read the existing Search Console domain property. The indexing report, last updated **16 October 2026**, shows **42 indexed / 3 not indexed**. One exclusion is a duplicate without a selected canonical; the other two are a redirect and an alternate canonical URL, which can be normal.
- Search Console's Sitemaps report has **no submitted sitemap rows for this property**. Core Web Vitals has **no data** for mobile or desktop. The overview reports **7 HTTPS / 0 non-HTTPS** pages in that report's coverage.
- Validated the updated production build: **84 public routes**, **76 sitemap entries**, **1,087 internal link instances**, and **178 image tags**. Seven service drafts and `/connect` are outside the sitemap by current design; private pages are separate.

## The 20 checks

| # | Check | Finding and action |
|---|---|---|
| 1 | sitemap.xml | Live, valid, generated from the route data. Submit `https://www.josephmaina.co.ke/sitemap.xml` in Search Console. |
| 2 | robots.txt | Live and allows crawling. Correct sitemap declaration. Keep private pages crawlable enough for crawlers to see noindex; robots.txt is not access control. |
| 3 | Noindex | All 76 sitemap pages are indexable. Seven service pages intentionally remain noindex because they contain `[CONFIRM]` details. Do not blanket-remove these directives or the hub/admin exclusions. |
| 4 | Canonicals | Live sitemap pages have correct self-canonicals. Added a permanent apex-to-www redirect in Vercel configuration to strengthen host consistency. Deployment required. |
| 5 | Meta titles | Unique page titles exist. Shortened the homepage title from 86 to 51 characters to make its focus clearer. Long titles elsewhere are editorial opportunities, not automatic failures. |
| 6 | Meta descriptions | Present and page-specific. Rewrote the homepage description with a clear service/location focus. Google can choose a different snippet. |
| 7 | One H1 | One H1 per generated route. The rendered homepage also has one H1. Dialogs and dynamic states were not exhaustively audited. |
| 8 | Heading order | Mobile homepage outline has no skipped heading levels. Footer column headings now use H2. Other page templates have not all received an interactive heading-outline audit. |
| 9 | Alt text | Fixed the decorative tracking pixel's missing empty alt. All generated image tags have alt attributes. No missing alt attributes on the rendered homepage. This does not certify the quality of every description. |
| 10 | Schema | Removed a Product/rating block claiming 12 five-star reviews that did not match the three displayed testimonials. Homepage FAQ markup now uses the same data as the visible FAQs. Blog/article breadcrumbs are standalone BreadcrumbList objects. Service prices now use numeric minimum/exact prices and separate billing labels. |
| 11 | Internal links | Initial HTML now includes homepage navigation/content, service summaries, design work and video links. Draft service links lead to the agency section until publication. Generated internal destination checks pass. |
| 12 | Broken links | Live sitemap/resource requests pass. Added `404.html` and restricted SPA rewrites to `/hub/*` and `/admin`, so unknown public URLs can return a real 404 on Vercel. Replaced manual 404 metadata mutations with the shared SEO component. Verify response status after deployment. |
| 13 | Image compression | Replaced four large blog JPEG references and one design PNG reference with WebP copies. Combined payload falls from **18,043,696 to 827,824 bytes (95.4% smaller)**. Originals are retained. Added intrinsic dimensions to the blog section photos to reserve their layout space. |
| 14 | Core Web Vitals | **Unverified:** Search Console has insufficient field data. The build still warns about an approximately 816 KB main JS chunk before compression (263 KB gzipped). Run PageSpeed Insights on the homepage, blog and a case study; prioritize measured LCP, INP and CLS issues before further optimization. |
| 15 | Mobile layout | Rendered homepage checked at a 390px browser viewport: no horizontal document overflow, one H1, no missing local anchors or alt attributes, and a coherent heading outline. This is a representative check, not certification of every page/device. |
| 16 | HTTPS | Live HTTP-to-HTTPS redirect works. Search Console reports no non-HTTPS pages in its HTTPS summary. |
| 17 | URL slugs | Existing paths are descriptive and hyphenated. Preserve them unless a specific change is needed; renamed URLs need redirects. |
| 18 | Open Graph image | Default social image exists, with 74 generated page-specific social cards. Build checks verify referenced image files and HTTPS URLs. |
| 19 | Search Console | Existing domain property is accessible. Review the canonical exclusion below and submit the sitemap. No Search Console settings or submissions were changed during this audit. |
| 20 | llms.txt | Already exists and is preserved. It is optional; Google does not require an AI-specific text file for inclusion in its AI search features. Do not treat its presence as proof of better ranking. |

## Remaining actions, in priority order

1. **Deploy these local changes through the site's existing Vercel/Lovable workflow.** This audit did not publish, commit, or push the changes. After deployment, check that an unknown path returns 404, the apex host redirects permanently to `www` while preserving path/query, and `/hub/login` plus `/admin` still load with noindex. Vite preview does not validate Vercel's production routing rules.
2. **Submit the existing sitemap.** In the open Search Console domain property, choose Sitemaps, enter `https://www.josephmaina.co.ke/sitemap.xml`, and submit. The file is already referenced from robots.txt, so crawlers can discover it without submission, too.
3. **Finish the seven service drafts.** These are useful commercial landing pages that cannot currently rank. In `src/data/servicePages.ts`, confirm timelines, minimum ad budgets, deliverable volumes, filming scope, landing-page scope and audit terms. Remove every `[CONFIRM]` marker, set the reviewed page's `draft` to `false`, rebuild and redeploy. The sitemap and indexing directive follow that flag automatically. No prices, promises or deliverables were invented here.
4. **Reinspect the canonical exclusion.** Search Console lists `https://www.josephmaina.co.ke/agency/blog/0-to-4-million-tiktok-views-behind-the-campaign` as a duplicate without a selected canonical (last crawled 15 October). It currently returns a correct self-canonical in the live HTML. Use URL Inspection after deployment to compare Google's selected canonical with the declared canonical, then request indexing if appropriate. The report may reflect an older crawl; adding another canonical tag is not the fix.
5. **Measure performance.** Check PageSpeed Insights on mobile for `/`, `/agency/blog`, and an image-heavy case study. Use field data when available. Investigate the large main bundle and third-party scripts against measured results; image savings alone do not prove a Core Web Vitals pass.

## Validation and limits

- `npm run build`: passed, including 84 prerendered routes and 74 social cards.
- `npm run check:seo`: passed. Reuse this after future builds to catch missing metadata, unintended noindex, broken internal destinations, missing assets, malformed JSON-LD/prices, sitemap drift, and unsafe routing changes.
- `git diff --check`: passed.
- TypeScript validation is still blocked by existing errors in `src/lib/chatLead.ts`: the generated Supabase types lack `chat_leads` and associated fields. Those files were not changed by this SEO work. Vite's production build succeeds, but it does not perform this type check.
- No claim is made that all pages are indexed, all external links work, every schema qualifies for a rich result, or mobile Core Web Vitals passes. Schema syntax checks are not a replacement for Google's Rich Results Test.

References: [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [review snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/review-snippet), [AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Vercel custom 404 behavior](https://vercel.com/kb/guide/custom-404-page).

# Rearrange Portfolio + Navbar Overhaul

## 1. Final section order on `/` (src/pages/Index.tsx)

```
1.  Hero
2.  Videos
3.  Graphic Design
4.  Mockups Coming Soon       (PrintMockup, already exists)
5.  About
6.  Services & Pricing         NEW
7.  Media Buying               (MediaBuying, already imported but not rendered)
8.  Skills & Stats             (already exists — verify content)
9.  Case Studies
10. Experience
12. Testimonials
13. FAQ
14. Contact
```

All sections wrapped in `CollapsibleWrapper` where the current pattern uses it, and every section gets a stable `id` matching the navbar anchors below. No section will be duplicated or dropped.

## 2. New sections to build

`**src/components/ServicesPricing.tsx**` — `id="services"`

- Section heading "Services & Pricing"
- 3–4 cards: Meta Ads, Google Ads, Social Media Management, SEO/Content
- Each card: icon, short description, starting price in KES, "Book Discovery Call" link to `/agency`
- Dark card surface, orange gradient on price/CTA, Framer Motion fade-in-on-scroll
- No new business logic — pure presentational, mirrors the visual language of the Agency page

`**src/components/Certifications.tsx**` — `id="certifications"`

- Section heading "Certifications & Achievements"
- Grid of placeholder cards (Google Ads, Meta Blueprint, HubSpot, Google Analytics) using existing Lucide icons as stand-ins
- Each card: badge icon, title, issuer, year
- Note in the card area inviting you to send real badge images/PDFs for swap-in later
- Framer Motion stagger animation on scroll

## 3. Skills & Stats verification

Open `src/components/SkillsStats.tsx` and ensure the exact data is present, replacing whatever is there if it differs:

Counters (animated count-up):

- 20+ Campaigns Managed
- 50+ Keywords Ranked
- 3+ Years Experience
- 15+ Clients Served

Progress bars:

- SEO Optimization 90%
- Content Strategy 85%
- Social Media Marketing 88%
- Google Analytics 85%
- Meta Ads 87%
- TikTok Ads 85%

Existing IntersectionObserver-triggered count-up + progress fill is kept.

## 4. Navbar (src/components/Navigation.tsx)

Replace `navLinks` with this exact order:

```
Home          → #home
Videos        → #videos
Design        → #graphic-design
Mockups       → #mockups
Skills        → #skills
Case Studies  → #case-study
Experience    → #experience
About         → #about
Contact       → #contact
Agency        → /agency           (real route, not anchor)
```

Behavior (most already present, will verify / fix):

- Smooth scroll to section via native hash navigation
- Active section highlights orange via existing IntersectionObserver
- Hides on scroll-down, reappears on scroll-up (already in place)
- Transparent at top, `bg-background/80 backdrop-blur-xl` after 50px (already in place)
- Mobile menu: opens from the right (currently full-screen overlay — switch to right-side slide-in sheet), each link closes the menu on click
- "View CV" button always visible on the right on desktop; on mobile it stays inside the menu
- Agency link is rendered as an `<a href="/agency">` (full page navigation) and styled distinctly (small orange pill) so it stands out from anchor links

## 5. Section IDs to add / confirm

So navbar anchors actually resolve, ensure these ids exist on the section wrappers:
`home, videos, graphic-design, mockups, about, services, media-buying, skills, case-study, experience, certifications, testimonials, faq, contact`.

## 6. Scroll animations

Each new and rearranged section uses the existing `ScrollReveal` / Framer Motion `whileInView` pattern already in the project — no new animation library, respects `prefers-reduced-motion`.

## 7. Technical details

- Files created: `src/components/ServicesPricing.tsx`, `src/components/Certifications.tsx`
- Files edited: `src/pages/Index.tsx` (imports + JSX reorder, add the two new lazy imports, render `PrintMockup` and `MediaBuying` which are already imported but currently unrendered), `src/components/Navigation.tsx` (navLinks array, Agency link, right-side mobile sheet), `src/components/SkillsStats.tsx` (data sync only if needed)
- No changes to routing (Agency route already exists), no changes to backend, no new dependencies
- After implementing, I'll verify in the preview that every navbar link scrolls to a real section and that no section is missing or rendered twice

# Restructure homepage + build /agency client platform

This is a large multi-phase change. I'll split it into 3 phases so each one is reviewable and shippable on its own. We can stop after any phase if priorities change.

---

## Phase 1 — Homepage reorder (small, ~1 step)

Edit `src/pages/Index.tsx` to match your structure. Skipping Certifications per your note.

New order:
```
Hero
About
Skills & Stats
Case Studies
Experience
Video Production
Graphic Design
Testimonials
FAQ
Contact
```

Remove from homepage (they become /agency-only): **Media Buying**, **Social Media Management**, **Print/Mockup**, **Managed Accounts**, **Tools Workflow**.

Keep `ManagedAccounts` + `ToolsWorkflow` available as components — they'll move to /agency in Phase 2. Nothing is deleted.

Also update `Hero.tsx` primary CTA: "Hire Me as an Employee" should scroll to `#experience` (recruiter target) instead of `#case-study`, since case studies now sit higher up and experience is the recruiter destination.

---

## Phase 2 — Build out /agency page (medium, ~1–2 steps)

Restructure `src/pages/Agency.tsx` into clear sections with anchor nav:

```
/agency
├── Hero (client-focused)
├── Services (existing 4 cards)
├── Media Buying (moved from homepage — paid-ads expertise)
├── Social Proof (Managed Accounts carousel + Tools)
├── Pricing (existing 3 tiers — add "Pay with M-Pesa" badge)
├── Booking (existing WhatsApp/Email + add "Request Proposal" button)
└── Footer
```

Add a sticky sub-nav inside /agency: Services · Media Buying · Pricing · Book · Portal Login.

No backend yet in this phase — "Request Proposal" and "Client Login" buttons are wired but route to Phase 3 features.

---

## Phase 3 — Backend: M-Pesa, Proposals, Client Portal (large, ~3–4 steps)

This is the real engineering work. Needs Lovable Cloud (already enabled) + Safaricom Daraja API credentials.

### 3a. Client Portal authentication
- Enable email/password + Google sign-in on Lovable Cloud
- Create `/agency/login`, `/agency/signup`, `/agency/portal` routes
- Add `profiles` table (id, full_name, company, phone, created_at) auto-populated via trigger on signup
- RLS: users see only their own profile

### 3b. Proposals system
- `proposals` table: id, client_id (→ auth.users), title, scope, line_items (jsonb), total_kes, status (draft/sent/accepted/declined), created_at, accepted_at
- Client portal view: list of proposals sent to them with Accept / Decline buttons
- Admin-only view (you): create + send proposals (gated by a `user_roles` table with `admin` role — never on profile)
- Email notification on send/accept via Resend (needs RESEND_API_KEY)

### 3c. M-Pesa STK Push (Daraja API)
- Two edge functions:
  - `mpesa-stk-push` — initiates payment for an accepted proposal or pricing tier
  - `mpesa-callback` — receives Safaricom confirmation, marks payment paid
- `payments` table: id, user_id, proposal_id (nullable), amount_kes, mpesa_receipt, status, raw_callback (jsonb), created_at
- Secrets needed (you'll be prompted): `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_ENV` (sandbox/production)
- Callback URL will be the deployed edge function URL — I'll give it to you to whitelist in the Daraja dashboard

### 3d. Client portal dashboard
- After login at `/agency/portal`: shows their proposals, payment history, active retainer status, and a "Book a call" link

---

## What I need from you before Phase 3

1. **Safaricom Daraja account** — register at developer.safaricom.co.ke, create an app, get the consumer key/secret + shortcode + passkey (sandbox is free for testing)
2. **Resend account** (for proposal emails) — or I can use Lovable's built-in email
3. **Your admin email** — to seed the first admin role so only you can create proposals

---

## Recommended next step

Confirm and I'll execute **Phase 1 now** (5 min), then **Phase 2** in the same turn since it's mostly moving components around. Phase 3 we tackle as a separate conversation once you have the Daraja keys ready — it's too big to do safely in one shot.

Want me to proceed?

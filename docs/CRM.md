# Agency Command Centre (outreach CRM)

Private CRM inside the Client Hub at **`/hub/crm`**. Same login, idle sign-out, noindex and design as the rest of the hub. The public site doesn't load any of it.

## What it does

- **Roles.** Owner, manager and viewer per organisation (`crm_memberships`), enforced by Postgres RLS:
  - Owner: everything.
  - Manager: edits the leads assigned to them, and reads leads shared with them.
  - Viewer: reads only shared leads.
  - Hub admins become owners when the migration runs. CRM-only members see only `/hub/crm`.
- **Two-step login.** Any account with an authenticator enrolled must enter a code to get into the hub. Owners can also require one for everyone (`require_mfa`). The database then refuses CRM data to sessions that haven't passed the second step.
- **Leads.**
  - Search, filters, sort, bulk tag/stage/assign/campaign.
  - Owner-only CSV export. It's audit-logged, and cells that would run as spreadsheet formulas are neutralised.
  - Profile tabs: Overview, Outreach, Timeline, Deals, Campaigns & access.
  - 14 pipeline stages, plus a separate qualification status.
- **Scores.** The spreadsheet's weakness score and A/B/C priority are kept as they came. The separate prospect-fit score uses factors you rate by hand. Unknown factors are left out, never scored as zero, and each factor is marked verified or not.
- **Import (owner only).**
  - XLSX/CSV up to 2 MB, parsed server-side and never stored.
  - Column mapping, then a review step with duplicate detection on name, domain, email and phone. You choose merge, skip or create for each row.
  - Idempotent: a source row is never applied twice. Merges only fill blank fields.
  - Each source row and the "How to read this" methodology are kept with the lead.
- **AI drafts.**
  - Cold email, WhatsApp intro, Instagram DM, two follow-ups, discovery-call notes.
  - Server-side through the Lovable AI gateway, using only verified facts. Anything unverified is listed as an assumption.
  - Each draft is checked for guarantees, invented statistics, claimed audits, "you have no website" claims, a missing opt-out line and a missing sender name.
  - Drafts are stored separately from messages, and editing an approved draft needs a fresh approval.
- **Sending.** Two ways, both only for approved drafts:
  - **By hand (default):** open the approved email in Gmail or the WhatsApp message in WhatsApp, press Send there, then click **I've sent it**. That records a manual send, not a delivery.
  - **Brevo (off until an owner turns it on):** type or pick the client's email on an approved email draft and click **Send now**. It's sent from the From address (`hello@josephmaina.co.ke`) through Brevo's HTTP API, with replies going to your reply-to email and an opt-out line plus a `List-Unsubscribe` header added. Only the approved text is sent, each draft at most once. It's checked against suppression, do-not-contact, a paused campaign, the daily limit (and Brevo's 300/day free cap) and the sending hours, then recorded with Brevo's message id. Recording a send schedules follow-ups.
  - The database refuses provider sends unless sending is on, a provider and From address are set, and the draft is approved (`crm_message_guard`, `crm_organisations_sending_ready_check`).
  - **Brevo policy:** Brevo's anti-spam policy prohibits sending to contacts scraped from the internet, transactional or marketing. The dealer list was scraped from Google Maps, so sending it through Brevo risks the account being suspended.
- **Follow-ups.**
  - When the first message is logged, follow-ups are scheduled in business days from the sequence in Settings (default +4, then +6).
  - Sending a follow-up draft marks it done.
  - A reply, opt-out, bounce, suppression or closing stage cancels what's left.
  - Pausing a campaign holds its follow-ups.
- **Deals.** Monthly retainer, quoted management fee, and the client's ad budget, kept separate. Ad budget is never counted as revenue. A won deal can be turned into a Client Hub client.
- **Dashboard and analytics.**
  - Computed in the database for what the caller can see.
  - Rates show "—" when nobody was contacted, and won deals with no value are flagged.
  - Analytics also compares the spreadsheet priority with actual replies.
- **Audit log.** Imports, exports, sends, deletions, suppression changes, membership and settings changes. It's written by triggers only, readable by owners, and nobody can edit it.

## Files

| Path | What |
|---|---|
| `supabase/migrations/20261024000000_crm_core.sql` | Schema, RLS, triggers, RPCs, seed |
| `supabase/migrations/20261024000000_crm_core.rollback.sql` | Undo (deletes all CRM data) |
| `supabase/migrations/20261027000000_crm_brevo.sql` (+ `.rollback.sql`) | Brevo provider, From address, sending-ready rule |
| `supabase/functions/_shared/vendor/xlsx-0.20.3.mjs` | SheetJS, vendored (Supabase can't fetch it from its CDN) |
| `supabase/functions/crm-parse-sheet` | Upload parsing (owner) |
| `supabase/functions/crm-draft` | AI drafts (owner/manager) |
| `supabase/functions/crm-send-email` | Sends one approved email through Brevo (off by default) |
| `supabase/functions/_shared/crm/*` | Pure shared logic (draft rules, send guards, sheet reader) |
| `src/hub/crm/` | The UI and its logic |
| `src/hub/auth/HubAuthProvider.tsx`, `src/hub/HubApp.tsx`, `src/hub/pages/LoginPage.tsx`, `src/hub/components/HubShell.tsx` | Hub changes: CRM-only members, two-step login, CRM in the dock |
| `tests/db/` | Migrations run in PGlite (real Postgres) with RLS tests |

## Environment

No new frontend variables. Edge function secrets (Supabase → Edge Functions → Secrets):

| Name | Needed | Notes |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | yes | Provided by Supabase automatically |
| `LOVABLE_API_KEY` | yes, for drafts | Already set for `hub-read-invoice` |
| `CRM_AI_MODEL` | no | Defaults to `google/gemini-3-flash-preview` |
| `BREVO_API_KEY` | for Send now | A Brevo **v3 API key** (`xkeysib-…`), not the SMTP key. Supabase blocks SMTP ports, so the HTTP API is used |
| `SUPABASE_SERVICE_ROLE_KEY` | yes, provided | Used only by `crm-send-email` to record sends |

Only `crm-send-email` uses the service-role key, to record a send after its checks pass. Never put any of these in `.env`: it's committed, and `VITE_` values ship to the browser.

## Setup

1. **Back up first.** Supabase → Database → Backups, or `pg_dump`.
2. **Apply the migration.** Run `supabase/migrations/20261024000000_crm_core.sql` (SQL editor, or `supabase db push`). It creates the organisation, makes every hub admin an owner, seeds six industries, and creates the draft campaign "Nairobi car dealers: Nov–Dec 2026".
3. **Deploy the functions:**
   ```
   supabase functions deploy crm-parse-sheet crm-draft crm-send-email
   ```
   They use the default JWT verification; `config.toml` needs no changes.
4. **Check public signup is off.** Supabase → Authentication → Sign In / Providers → turn off "Allow new users to sign up". Strangers couldn't see anything anyway (no membership), but they shouldn't get accounts either.
5. **Sign out of the hub and back in.** Open `/hub/crm`, then go to Settings:
   - Fill in your sender identity (drafts need it).
   - Set up two-step verification.
   - Optionally require it for everyone.
6. **Import.** Go to Leads → Import, upload `Nairobi_Car_Dealer_Leads.xlsx`, and check the columns. The industry defaults to Car dealership. Pick the campaign, review, and import.
7. **Add a colleague.** Create their account in Supabase Auth → Users, then add them by email in Settings → Team.

Rolling out: the frontend works before the migration is applied. Hub admins see "The CRM isn't set up yet" on `/hub/crm`, and the rest of the hub is unaffected.

## Local development and tests

```
npm run dev            # http://localhost:8080/hub/crm
npm test               # 49 tests: unit, draft rules, send guards, and the database suite
npm run lint
npm run build
```

The database suite (`tests/db/crm.test.ts`) boots PGlite and runs the hub migration plus the CRM migration. It needs no Docker. It covers:
- Anonymous and non-member lockout
- Manager, viewer and organisation isolation
- MFA enforcement and audit-log immutability
- The last-owner guard
- Draft approval rules and sending disabled by default (people and the service role)
- Suppression, follow-up scheduling and cancellation, campaign pause
- Idempotent webhooks, import idempotency and merging
- Analytics, including null rates and ad budget not counted as revenue
- SQL and TypeScript producing the same normalisation keys

To run the end-to-end import check against the real file without committing it:

```
CRM_IMPORT_SAMPLE="C:/path/to/Nairobi_Car_Dealer_Leads.xlsx" npm test
```

`*.xlsx`, `*.xls` and `*.csv` are git-ignored so prospect lists can't be committed by accident.

## Security checklist

- [x] RLS on every `crm_*` table; anon has no privileges; every policy checks role and organisation
- [x] Child rows inherit the lead's organisation by trigger (a forged `org_id` is replaced)
- [x] Owner-only: import, export, delete, settings, members, sharing, retention purge
- [x] Managers can't reassign leads away from themselves, delete, or lift do-not-contact
- [x] Approval is stamped from the session; editing approved text resets approval
- [x] Provider sends need `sending_enabled`, a connected provider and an approved draft, checked by DB trigger for every role; people can only log manual sends
- [x] Suppressed addresses and do-not-contact leads are blocked at the database
- [x] Audit log is written only by triggers and RPCs, owner-readable, and can't be changed
- [x] Upload checks: 2 MB cap (header and body), extension plus magic bytes, sheet/row/column/cell caps, formulas never evaluated, file not stored, rate-limited
- [x] AI calls run server-side; the key is never in the browser; rate-limited per user; prompts are size-capped
- [x] CSV export neutralises `= + - @` and tab/CR cell starts
- [x] Links: `externalUrl` refuses non-http(s) schemes; `rel="noopener noreferrer"`
- [x] React escapes all output; no `dangerouslySetInnerHTML` in the CRM
- [x] No secrets or message bodies in logs (functions log status codes only)
- [x] CSRF: the API uses bearer tokens, not cookies, so cross-site requests can't act as you
- [x] Webhook events are idempotent (`crm_record_provider_event`, service role only)
- [ ] Webhook signature verification: build it with the provider (none connected yet)
- [ ] Separately pending: `VITE_APP_PASSCODE` puts the `/admin` passcode in the public JS bundle, and `VITE_SUPABASE_SECRET_KEY` sits in `.env` with a `VITE_` prefix (not used in code, not in `dist`, but one import would ship it). Both are flagged and left for a separate change.

## Limitations

- **No live database run of the UI yet.** The schema and RLS are tested in PGlite, but the pages haven't been clicked through against Supabase. Do that on first deploy.
- **No email provider, reply sync or webhooks.** Replies are logged by hand ("Log a reply").
- **Exports are owner-only in the UI and audit-logged.** Anyone with read access could still copy what they can see.
- **Business days skip weekends but not Kenyan public holidays.**
- **Batch approval only applies to drafts without warnings.** Sending is always one at a time by hand.
- **The dashboard date range uses Nairobi time.** Custom ranges are whole days.
- **The AI model is reached through the Lovable gateway.** Swap providers in `_shared/crm/ai.ts`.

## Legal and policy questions for human review

These are flags, not legal advice:
- **Kenya Data Protection Act 2019.** Named owners/MDs and personal-looking inboxes in the lead list are personal data.
  - Section 37 limits using personal data for commercial purposes without consent.
  - The 2021 General Regulations set direct-marketing rules, including an easy opt-out.
  - Confirm your lawful basis for B2B cold outreach to named people.
- **ODPC registration.** Check whether the agency must register as a data controller under the 2021 Registration Regulations.
- **Privacy policy.** Update `/privacy-policy` to cover prospect data: source (Google Maps scrape), purpose, retention, and how to opt out.
- **Unsolicited messages.** The Kenya Information and Communications (Consumer Protection) Regulations restrict unsolicited electronic messages.
- **Google and Meta terms.**
  - Google Workspace has sending limits and bulk-sender rules.
  - WhatsApp: the manual wa.me flow is fine. The WhatsApp Business Platform later needs opt-in, approved templates and the 24-hour window.
  - The original data was scraped from Google Maps via Apify; check that use against both services' terms.
- **Before connecting an email provider,** confirm in writing that it allows individually written B2B prospecting.

## Backups and recovery

- Supabase daily backups (paid plans) or PITR; take a manual `pg_dump` before migrations.
- Export leads (Leads → Export) before bulk changes.
- Settings → Data: retention period, "Delete old closed leads now", and clearing stored raw import rows. Suppression entries always survive deletion.

## Rollback

1. **Frontend.** Revert the commit. The hub works without the CRM routes.
2. **Functions:**
   ```
   supabase functions delete crm-parse-sheet crm-draft crm-send-email
   ```
3. **Database.** Run `20261024000000_crm_core.rollback.sql`. It deletes every CRM table, including the audit log and suppression list, so export first. Clients, finance, tasks and the old pipeline are untouched.

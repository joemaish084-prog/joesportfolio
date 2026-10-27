# Client portal

A private area at `/portal` where each client signs in and sees only their own
results, reports, work, roadmap, invoices and files. It reads the same data you
already enter in the hub; you decide what is shared.

## Using it day to day

In the hub, open a client and go to the **Client portal** tab:

- **Who can sign in**: invite a contact by email, or preview the portal exactly
  as the client sees it ("Preview as client").
- **What they see**: switch sections on or off per client (a web-design client
  can skip Performance; an ads client can hide Roadmap).
- **What you share**: tick the reports, documents and work entries to publish.
  Nothing is visible until it is ticked. Work minutes, notes and expenses are
  never sent to clients.
- **Roadmap** and **Notes and requests**: milestones, updates, and "needs your
  action" items the client can tick off.
- **Messages from the client**: questions sent from their Help page.

Results come from the client's KPIs and the monthly reports you already add
under Progress. Publish a report by ticking it under "What you share".

## Setup (once)

1. Apply `supabase/migrations/20261028000000_client_portal.sql`
   (rollback: `…client_portal.rollback.sql`). It was tested locally in PGlite
   (`tests/db/portal.test.ts`), not yet against the live project.
2. Deploy the invite function:
   `npx.cmd supabase functions deploy portal-invite --use-api`.
   Optional secret `PORTAL_URL` (defaults to `https://www.josephmaina.co.ke/portal`).
   Until it is deployed, "Invite" falls back to linking someone who already has a
   login created in Supabase → Authentication → Users.
3. Supabase → Authentication: turn **off** "Allow new users to sign up". Clients
   only get in by invitation, and the login form never creates accounts.
4. Optional: add `{{ .Token }}` to the Magic Link email template so clients can
   type a 6-digit code as well as click the link.
5. Optional: set `VITE_CAL_LINK` (e.g. `your-name/strategy-call`) or a per-client
   link in the portal tab for the Cal.com booking embed. Without one, the page
   links to the Calendly page the site already uses.

## Preview without a database

`npm run dev`, then open `/portal?demo`. It shows a sample e-commerce client
(development builds only; the demo never ships to production).

## How access is enforced

- Clients have no table access. Everything comes from `portal_snapshot()`, a
  security definer function that returns one client's shared, client-safe columns.
- New tables are admin-only through RLS; anon has no privileges.
- Files open through short-lived signed links, and only for documents you shared
  (`portal_can_read_file`, used by a storage policy).
- Messages are capped at 10 per client per hour.

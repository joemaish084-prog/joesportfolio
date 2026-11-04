# Hub team access

The main hub supports Admin and Editor accounts in one shared business workspace.
CRM organisations and client portal memberships keep their separate access rules.
The unlisted [personal time dashboard](HUB-TIME.md) at `/hub/time` is restricted
to its specifically bound account, including against other hub administrators.

| Capability | Admin | Editor |
| --- | --- | --- |
| Read all shared clients, tasks, reports, documents and finances | Yes | Yes |
| Create and update operational records | Yes | Yes |
| Edit client KPI fields and report metric fields | Yes | Yes |
| Permanently delete operational records | Yes | No |
| Business funds, website analytics, business settings, client portal administration | Yes | No |
| Invite users, change roles, disable hub access | Yes | No |
| Update own name, job title and phone | Yes | Yes |
| Connect own Google Calendar | Yes | Yes |

Editors are trusted staff with visibility across this business, including invoices,
payments and expenses. This is not a per-client assignment system or separate
workspaces for unrelated organisations. Never give a client an Editor account.

## Deployment

1. Apply `supabase/migrations/20261104000000_hub_team.sql` after existing migrations.
   It requires the hub phases, task board and client portal migrations.
2. Deploy the Edge Functions:

   ```sh
   supabase functions deploy hub-invite hub-read-invoice google-calendar google-oauth-callback
   ```

3. Add the invitation destination to Supabase Auth's allowed redirect URLs:
   `https://www.josephmaina.co.ke/hub/reset-password`. For another environment,
   set the server-side `HUB_INVITE_URL` secret to its trusted reset-password URL
   and allow that URL in Supabase Auth. Existing Supabase URL, anon and service
   role secrets are supplied by the platform. No frontend secret is needed.
4. Keep public signup disabled. New accounts are invited by an administrator.
5. Open **Settings → Account** to fill your own profile, then **Settings → Team**
   to add a name, email, job title, phone and role. New users receive an invitation
   email; existing accounts keep their login and gain hub membership.

Original admins in `user_roles` keep their access and cannot be disabled or
demoted by this form. Other admins cannot remove their own admin access.
Disabling a membership stops its database access immediately. The UI rechecks
membership every minute, clears cached hub queries when its access scope changes,
and moves CRM-only members back to their separate CRM access where applicable.
An invitation creates a login but grants no access until the membership save
succeeds. If that save fails, retry adding the existing account.

Each operational row gets `created_by` and `updated_by` user IDs, stamped by the
database rather than accepted from the browser. Existing rows start without an
attribution value. Actor IDs remain if a login is later deleted. Profiles do not
determine authorization through Auth metadata.
The original blank login name falls back to the account's email until a profile
name is saved; the greeting and account menu then use that name.

## Verification

`npm test -- tests/db/hub-team.test.ts` covers operational entry/edit permissions,
forged attribution, blocked deletion, profile updates, self-promotion, protected
admins, deactivation, funds/settings/CRM/portal boundaries, and rollback.
The common PGlite harness applies the team migration for existing permission
suites too. It stubs Auth and Storage, so deployment must additionally verify a
real invitation, first password setup, editor uploads, administrator management,
and separate Google connections. No invitation is sent by the automated tests.

The paired rollback removes team access, profiles, policies and attribution
columns. Existing operational records and original admins remain. Back up team
profiles and attribution before using the rollback if those values are needed.

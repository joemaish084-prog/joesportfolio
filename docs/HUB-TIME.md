# Personal time and value

Unlisted private page at `/hub/time`; `/hub` remains the agency overview. It uses
the existing hub login, MFA flow, idle sign-out, theme, noindex tags and response
headers. Nothing is added to public navigation, hub navigation, the command
palette, sitemap or client portal.

## Deployment

1. Apply `supabase/migrations/20261104010000_hub_time.sql` after the team migration.
   Use the same Supabase project backing this site's Lovable Cloud connection.
   No new environment variables or Edge Functions are needed.
2. The migration resolves the specified existing login email to its Auth user ID
   and stores that ID in `hub_time_settings`. The account must already exist and
   have hub administrator access. Other admins, editors and CRM/portal users
   have no access to the time tables. Anonymous requests have no privileges.
3. Deploy the frontend, sign in using the designated account and bookmark
   `/hub/time`. Verify that another hub admin cannot open the page or read its
   tables through the database API.

If that login did not exist when the migration ran, no owner is selected and the
page stays locked. After creating the intended account and assigning hub access,
run this in the trusted database SQL editor, substituting the intended email:

```sql
insert into public.hub_time_settings(owner_user_id)
select id from auth.users where lower(email) = lower('YOUR_LOGIN_EMAIL')
on conflict (id) do nothing;
```

The browser cannot insert settings or change the owner ID. An email change does
not change ownership. Reassigning ownership requires trusted database access.
There are no fake clients or time entries seeded by this migration.

## Data and access

- Existing `clients` supplies names, monthly fees, status, engagement and currency.
  Adding or editing a client changes that existing shared hub record.
- `hub_time_entries` stores this account's private minutes, notes and dates.
  It is independent of the shared `work_log` and cannot be published to the portal.
- `hub_time_settings` holds the owner ID and weekly client-delivery capacity
  (default 15 hours, greater than zero and at most 168).
- `hub_time_clients` holds personal tracking archive flags. Archiving does not
  change shared client status. Clients with hours in the selected period remain
  visible in that period; Restore enables new tracking again for eligible clients.
- Client deletion is refused while personal time entries reference it. Prefer
  archive. The existing merge operation transfers time history atomically, and
  only the personal time owner can merge away a client with private time records.

## Calculations

Only active, unarchived monthly KES retainers and in-term monthly contracts are
offered for new tracking. One-off projects, other currencies and ad budgets are
outside this comparison. A client with no fee can be tracked but has no hourly
rate; enter their fee to make the comparison useful.

Weeks begin Monday. Both periods end today, using Africa/Nairobi dates even on
a browser abroad. The comparison includes today as a whole calendar day.

- Allocated hours = weekly capacity × elapsed calendar days / 7 × fee share.
- Period fee = monthly service fee × sum of `1 / days in month` for every day in
  the period. A week crossing a month or year boundary uses each month's length.
- Effective KES/hour = period fee / logged hours, before expenses. No rate is
  shown without hours or a positive monthly fee.
- Over time: above 125% of allocated hours; Under: below 60%; otherwise On track.
  No logged time shows No time yet. Under is neutral, since it can reflect either
  efficiency or missing logging.
- The insight selects the largest hour-share minus fee-share gap, and flags it
  only above 10 percentage points. No insight is displayed without comparable
  logged time. No fees produces a request to add fees instead of a ratio.

Every bar shares one scale including both actual hours and allocations. A black
marker (white in dark mode) shows allocated hours. Monetary display values respect
the hub's Hide amounts control; fee-editing inputs remain explicit editing fields.

This first version uses current client fees and weekly capacity, rather than
historical snapshots. Changing them recalculates the current comparison. Clients
with recorded hours remain visible after leaving active tracking; if changed to
a project or a different currency, their history is marked Outside comparison
and excluded from both fee and hour shares.

## Timer and entry behavior

The timer's UUID, client, note and start timestamp are saved in browser storage
under a user-specific key before it starts. It survives refresh, route changes
and sign-out on the same browser; log back into the same account to recover it.
It does not sync between devices. Browser storage must be available.

Tabs share the timer through storage events and serialize actions with Web Locks
where supported. Stop freezes and persists the end timestamp before saving. A
failed save leaves a stopped timer and Retry save; retrying the same UUID is
idempotent in the database, including concurrent retries from tabs.

Time is rounded to the nearest whole minute with a minimum of one minute. A timer
crossing midnight is assigned to its Nairobi start date, as stated on the card.
It does not automatically split across days or stop at idle sign-out. Long timers
can be discarded and corrected with manual entries. Discard requires a second click.
Manual saves retain their UUID on retries while form values are unchanged.

The recent list shows the last 25 entries across all dates, ordered by worked
date then creation time. The period comparison fetches all matching records in
pages, rather than silently limiting totals to the API's first result page.

## Verification and rollback

`npm test -- src/hub/lib/time.test.ts tests/db/hub-time.test.ts` covers calendar
boundaries, allocation and status thresholds, fee handling, archive history,
timer recovery, ownership, denied access, retry idempotency, validation, merge
preservation and rollback. The common database harness applies the new migration
for the existing hub, CRM and portal suites too.

PGlite does not replace a live Supabase check of the owner binding and API grants.
Verify an actual owner login, reload recovery, Stop/save, manual entries, archive
and a denied second account after deployment.

Export private time records before applying the paired rollback SQL. It removes
the private time tables and restores the prior client merge wrapper; shared
clients, work logs, finances and other hub settings remain.

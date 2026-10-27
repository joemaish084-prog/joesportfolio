# Repository guidance

## Project context

This repository contains a React 18 and TypeScript website built with Vite,
Tailwind CSS, and shadcn/ui, plus a client hub, CRM, and client portal.
Supabase provides authentication, database migrations, and Edge Functions.

## Where to work

- `src/pages`, `src/components`: public website pages and shared components.
- `src/hub`: internal hub and CRM; see `docs/CRM.md` for CRM context.
- `src/portal`: client portal with its own components, theme, and styles.
- `src/hooks`, `src/lib`, `src/integrations`: shared logic and integrations.
- `src/seo`, `src/prerender`, `scripts/prerender.mjs`: metadata and prerendering.
- `supabase/migrations`: Supabase schema changes and rollback scripts.
- `supabase/functions`: Edge Functions and shared server-side helpers.
- `drizzle`: separate schema and migration files; inspect their usage before
  assuming they are interchangeable with Supabase migrations.
- `tests/db`: database behavior and permission tests using in-process PGlite.
- `public`: static assets. `dist` is generated build output.

## Working conventions

- Check the working tree before editing and preserve unrelated user changes,
  including untracked work.
- Follow nearby code patterns and reuse existing components and utilities.
  Use the existing `@/` import alias for `src` where appropriate.
- Keep public website, hub, and portal styling within their existing boundaries.
- Use npm for the commands documented here. Avoid unrelated dependency or
  lockfile changes; the repository also contains Bun lockfiles.
- Fix the source files rather than editing generated build output.
- Do not print, copy into code, or commit secrets from `.env` or other local
  configuration. Use `.env.example` when documenting configuration names.
- Keep prospect lists and personal client data out of Git and public assets,
  consistent with `.gitignore`.

## Database and backend changes

- Add new timestamped Supabase migrations for schema changes that may already
  be deployed. Follow the existing paired `.sql` / `.rollback.sql` convention;
  keep rollback SQL separate from forward migrations.
- Preserve row-level security and role boundaries. For permission changes,
  verify allowed access and denied access, including access across clients or
  organisations where applicable.
- Keep privileged credentials in server-side code. Do not rely on hidden UI
  controls to enforce authorization.
- Extend relevant `tests/db` coverage and its migration setup when changing
  database behavior. The PGlite harness stubs Supabase services, so it does not
  replace integration checks for Auth, Storage, or deployed Edge Functions.

## Commands and verification

- `npm install`: install dependencies when needed.
- `npm run dev`: start Vite on port 8080.
- `npm run lint`: run ESLint.
- `npm test`: run the Vitest suite once.
- `npm test -- tests/db/portal.test.ts`: example of a focused test run.
- `npm run build`: create the production build and run prerendering.
- `npm run preview`: preview the built site locally.
- `npm run check:seo`, `npm run check:agency`, and
  `npm run check:performance`: additional checks for relevant website changes;
  inspect each script's prerequisites before running it.

Development and build commands run blog-summary generation through npm hooks.
Review any resulting generated changes before including them.

Run checks appropriate to the change: focused tests for logic, database tests
for migrations or permissions, and lint/build for application changes. Verify
responsive layout and affected routes for UI changes when browser tooling is
available. Documentation-only changes do not require an application build.
Report what changed, which checks ran, and any failures or checks left unrun.

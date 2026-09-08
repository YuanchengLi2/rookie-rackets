# Supabase Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Rookie Rackets' browser-only demo with a persistent Supabase operations dashboard where public registrations flow into a staff-managed inbox and `yuanchengli612@gmail.com` is the initial administrator.

**Architecture:** Keep the existing Vinext/Cloudflare Sites frontend and visual system. Put relational truth, authorization, private files, and transactional invariants in Supabase; isolate browser/server Supabase access behind typed clients and a repository-backed `OperationsProvider`; route anonymous registration through a validated server endpoint.

**Tech Stack:** Next.js 16, React 19, Vinext, Cloudflare Workers/Sites, TypeScript 5.9, Supabase PostgreSQL/Auth/Storage/Realtime, `@supabase/supabase-js`, `@supabase/ssr`, Zod, Vitest, Testing Library, Supabase CLI/pgTAP.

**Spec:** `docs/superpowers/specs/2026-09-08-supabase-operations-design.md`

## Global Constraints

- `yuanchengli612@gmail.com` is the initial administrator.
- Public visitors submit registrations without accounts; `/portal/**` is removed from the product flow.
- Anonymous clients can read public program/session fields and can never read private registration, emergency-contact, attendance, finance, or file data.
- Paid registrations start as `unpaid`; the website never claims it charged a card.
- Money is stored as integer cents; IDs are UUIDs; audit timestamps are timezone-aware.
- All important mutations are persistent, return authoritative rows, expose pending/error/success UI, and log safe activity without private child data.
- Existing brand, public-site layout, and staff-dashboard visual direction remain intact.
- Secrets stay out of source control and browser bundles.
- Preserve unrelated working-tree changes and stage only task files at each commit.
- No subagents are used, per repository instructions; execute inline with review checkpoints.

---

## File structure and responsibility map

### Supabase

- `supabase/config.toml`: local project configuration and migration/seed paths.
- `supabase/migrations/202609080001_initial_operations_schema.sql`: complete relational schema, indexes, triggers, RLS, public views, registration/staff RPCs, and private Storage policies.
- `supabase/seed.sql`: deterministic migration of the current useful fixture data into relational rows.
- `supabase/tests/operations_rls.sql`: pgTAP coverage of public/staff/admin permissions and registration invariants.

### Supabase clients, contracts, and data access

- `lib/supabase/env.ts`: validate server and public Supabase environment variables without exposing the service key.
- `lib/supabase/browser.ts`: singleton public browser client.
- `lib/supabase/server.ts`: cookie-aware request client plus server-only service client.
- `lib/supabase/auth.ts`: active-staff lookup, safe return-path validation, and staff-route guard helpers.
- `lib/data/types.ts`: neutral domain model, drafts, workspace snapshot, and mutation result types.
- `lib/data/database.types.ts`: Supabase schema types generated after migration.
- `lib/data/mappers.ts`: database-row-to-domain conversion, JSON curriculum validation, and cents/date mapping.
- `lib/data/repository.ts`: exact repository contract consumed by React.
- `lib/data/supabase-repository.ts`: production query/mutation implementation and subscriptions.
- `lib/data/registration-contract.ts`: Zod request/response schema shared by public form and API.
- `lib/data/errors.ts`: error codes and safe user-facing normalization.
- `lib/data/selectors.ts`: renamed pure selectors using current dates and relational domain state.
- `lib/data/csv.ts`: neutral client-only CSV export.

### Server routes and auth UI

- `app/api/registrations/route.ts`: anonymous validated registration transaction.
- `app/auth/callback/route.ts`: exchange magic-link code and verify staff access.
- `app/auth/sign-out/route.ts`: terminate Supabase session.
- `components/auth/staff-sign-in.tsx`: staff email magic-link form.
- `components/auth/staff-guard.tsx`: authenticated loading/denied/redirect boundary.
- `app/sign-in/page.tsx`: staff-only sign-in route.

### Shared state and UI

- `components/data/operations-provider.tsx`: load, mutate, refresh, subscribe, and expose staff/public state.
- `components/data/async-ui.tsx`: load errors, save errors, pending labels, stale-data banner, and retry controls.
- `components/ui/record-overlay.tsx`: neutral modal/drawer primitives migrated from demo UI.
- `components/ui/status-ui.tsx`: neutral status badges, metrics, empty states, and toast region.
- `components/files/private-file-button.tsx`: request signed URLs and open private files.
- `app/layout.tsx`: mount the real provider.

### Product surfaces

- `components/public/dynamic-programs.tsx`, `components/public/program-detail.tsx`, `components/public/registration-wizard.tsx`: database-backed discovery and accountless registration.
- `app/events/page.tsx`, `app/events/[slug]/page.tsx`, `app/register/[slug]/page.tsx`: pass public data states and preserve URLs.
- `components/staff/staff-shell.tsx`, `components/staff/staff-home.tsx`: real identity, counts, activity, navigation, and sign-out.
- `components/staff/registrations-view.tsx`: online/manual registration inbox and complete editor.
- `components/staff/registration-editor.tsx`: shared create/edit form for personal, session, consent, payment, and notes data.
- `components/staff/programs-view.tsx`, `components/staff/program-detail.tsx`, `components/staff/session-editor.tsx`: persistent programs and sessions.
- `components/staff/coaches-view.tsx`, `components/staff/coach-editor.tsx`: coach CRUD and hours.
- `components/staff/organizations-view.tsx`, `components/staff/organization-detail.tsx`, `components/staff/organization-editor.tsx`: partner CRUD and interactions.
- `components/staff/projects-view.tsx`, `components/staff/project-detail.tsx`, `components/staff/project-editor.tsx`: project/task CRUD.
- `components/staff/finance-view.tsx`, `components/staff/finance-editor.tsx`: ledger CRUD, receipts, and export.
- `components/staff/settings-view.tsx`: staff allowlist, form versions, current identity, and admin-only controls.
- `app/portal/**`: redirect retired family routes to `/events`.
- `app/staff/staff.css`, `app/public-flows.css`, `app/demo.css`, `app/demo-polish.css`, `app/portal/portal.css`: replace demo-only selectors/copy and add async/editor states while preserving appearance.

### Project configuration and documentation

- `package.json`, `package-lock.json`: Supabase and Zod dependencies plus focused verification scripts.
- `.env.example`: exact public/server environment names with empty values.
- `.gitignore`: ensure `.env*` secrets, while preserving `.env.example`.
- `DEMO.md` -> `OPERATIONS.md`: live setup, migration, bootstrap, verification, recovery, and deployment runbook.
- Existing tests under `tests/`: migrate reducer-based tests to a deterministic repository harness and add the focused files listed below.

---

### Task 1: Define the persistent contracts and database invariants

**Files:**
- Create: `lib/data/types.ts`
- Create: `lib/data/registration-contract.ts`
- Create: `lib/data/errors.ts`
- Create: `tests/registration-contract.test.ts`
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202609080001_initial_operations_schema.sql`
- Create: `supabase/seed.sql`
- Create: `supabase/tests/operations_rls.sql`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Create: `.env.example`

**Interfaces:**
- Produces `RegistrationSubmissionSchema`, `RegistrationSubmission`, and `RegistrationReceipt`.
- Produces neutral `OperationsState`, record types, create/update drafts, and `DomainError`.
- Produces Postgres RPC `public.submit_registration(payload jsonb, idempotency_key uuid) returns jsonb`.
- Produces helper functions `private.is_active_staff()` and `private.is_admin()` used by all policies.

- [ ] **Step 1: Install supported dependencies and add scripts**

The verified stable releases on 2026-09-08 are `@supabase/supabase-js@2.116.0`, `@supabase/ssr@0.12.7`, and `zod@4.5.4`. Install them with `npm install @supabase/supabase-js@2.116.0 @supabase/ssr@0.12.7 zod@4.5.4`. Add scripts:

```json
{
  "test:focused": "vitest run --maxWorkers=1 --no-file-parallelism",
  "check": "npm run test:focused && npm run lint && tsc --noEmit && npm run build"
}
```

- [ ] **Step 2: Write failing contract tests**

Create cases that prove normalization and reject unknown fields, invalid email/phone/date, missing sessions, excessive text, a missing required consent, and a non-UUID idempotency key:

```ts
expect(parseRegistrationSubmission(validSubmission).guardianEmail).toBe('parent@example.com');
expect(() => parseRegistrationSubmission({ ...validSubmission, unexpected: true })).toThrow();
expect(() => parseRegistrationSubmission({ ...validSubmission, selectedSessionIds: [] })).toThrow();
```

Run `npx vitest run tests/registration-contract.test.ts --maxWorkers=1 --no-file-parallelism`. Expected: FAIL because `registration-contract.ts` does not exist.

- [ ] **Step 3: Implement the neutral domain and registration schemas**

Move the useful enums/interfaces from `lib/demo/types.ts`, remove `Demo*` names and family session/profile types, add `source`, `publicReference`, timestamps, `archivedAt`, integer-cent amounts, and async mutation drafts. Export:

```ts
export function parseRegistrationSubmission(value: unknown): RegistrationSubmission {
  return RegistrationSubmissionSchema.parse(value);
}

export interface RegistrationReceipt {
  registrationId: string;
  publicReference: string;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
}
```

Run the focused contract test and require PASS.

- [ ] **Step 4: Write the schema migration**

Create every table and relationship from the specification. Use `gen_random_uuid()`, `citext` for normalized emails, `amount_cents integer check (amount_cents >= 0)`, cascade only for dependent join rows, and `restrict`/soft archive for operational parents. Add indexes for registration search/status/program/submitted timestamp, upcoming sessions, task due/status, organization status/owner, and activity timestamp.

Create a transaction function with this signature:

```sql
create function public.submit_registration(payload jsonb, idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp;
```

Inside it, validate the program and selected session IDs, lock the program row, reuse an existing registration for the same idempotency key, calculate confirmed enrollment, insert registration/session/consent/attendance/payment rows, and return only ID/reference/status values. Seed `staff_allowlist` with lowercase `yuanchengli612@gmail.com` and role `admin`.

- [ ] **Step 5: Add RLS and SQL tests before remote migration**

Write pgTAP assertions for anonymous public views, denied private selects/writes, active staff CRUD, inactive staff denial, admin-only allowlist/settings writes, storage isolation, idempotent submission, wrong-program session rejection, closed-program rejection, and full-program waitlisting. Run `supabase db reset` and `supabase test db` when local Docker is available. If Docker is unavailable, run `supabase db lint --local` where supported and retain the SQL suite for linked-project execution.

- [ ] **Step 6: Seed relational fixtures and commit**

Translate the current seed into stable UUID records for public programs, sessions, coaches, assignments, registrations, forms, attendance, organizations, interactions, projects, tasks, finance, files metadata, and activity. Exclude demo users and fake paid transactions. Run `supabase db reset`, contract tests, and `git diff --check`; commit only Task 1 files as `feat: define Supabase operations schema`.

---

### Task 2: Implement Supabase clients and real staff authentication

**Files:**
- Create: `lib/supabase/env.ts`
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/auth.ts`
- Create: `components/auth/staff-sign-in.tsx`
- Create: `components/auth/staff-guard.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `app/auth/sign-out/route.ts`
- Modify: `app/sign-in/page.tsx`
- Modify: `app/staff/layout.tsx`
- Create: `tests/staff-auth.test.tsx`
- Modify: `tests/sign-in.test.tsx`

**Interfaces:**
- Produces `createBrowserSupabaseClient()`, `createServerSupabaseClient(cookieStore)`, and `createServiceSupabaseClient()`.
- Produces `getActiveStaff(client): Promise<StaffProfile | null>` and `safeReturnPath(value): string`.
- `StaffGuard` renders children only for an active profile; otherwise it redirects to `/sign-in?next=...`.

- [ ] **Step 1: Write failing environment/auth tests**

Test missing environment values, external/open-redirect rejection, approved admin access, authenticated-but-unapproved denial, inactive staff denial, callback failure, and sign-out cookie clearing. Run `npx vitest run tests/staff-auth.test.tsx tests/sign-in.test.tsx --maxWorkers=1 --no-file-parallelism`. Expected: FAIL because auth modules are missing.

- [ ] **Step 2: Implement environment and client factories**

Public access reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Only `server.ts` may read `SUPABASE_SERVICE_ROLE_KEY`. Validate URL protocol/host and non-empty keys once. The browser client is a singleton; server clients are per request and use `@supabase/ssr` cookie adapters compatible with `next/headers`.

- [ ] **Step 3: Implement staff magic-link flow**

The sign-in form accepts email, calls `signInWithOtp({ email, options: { emailRedirectTo: origin + '/auth/callback?next=' + encodedPath, shouldCreateUser: true } })`, disables while sending, and shows sent/error states. The callback exchanges `code`, calls `getActiveStaff`, signs out unapproved users, and redirects only through `safeReturnPath`.

- [ ] **Step 4: Replace the demo session guard**

Update the staff layout to use `StaffGuard`. Remove role-choice buttons and all family-sign-in copy. Preserve the sign-in page's visual shell but label it `Staff access`. Add `robots: noindex` metadata.

- [ ] **Step 5: Verify and commit**

Run focused auth tests, `npx tsc --noEmit`, and `git diff --check`; commit Task 2 files as `feat: add staff Supabase authentication`.

---

### Task 3: Replace localStorage with the repository-backed operations state

**Files:**
- Create: `lib/data/database.types.ts`
- Create: `lib/data/mappers.ts`
- Create: `lib/data/repository.ts`
- Create: `lib/data/supabase-repository.ts`
- Create: `lib/data/selectors.ts`
- Create: `lib/data/csv.ts`
- Create: `components/data/operations-provider.tsx`
- Create: `components/data/async-ui.tsx`
- Create: `components/ui/record-overlay.tsx`
- Create: `components/ui/status-ui.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/repository-harness.ts`
- Create: `tests/operations-provider.test.tsx`
- Modify: `tests/test-utils.tsx`

**Interfaces:**
- `OperationsRepository` exposes `loadPublicPrograms`, `loadWorkspace`, all create/update/archive methods, `createSignedFileUrl`, `uploadFile`, and `subscribe(onInvalidate)`.
- `OperationsProvider` exposes `{ state, status, staff, mutation, refresh, toast, dismissToast, repository }` and typed wrapper methods matching the UI workflows.
- `createMemoryRepository(seed)` powers component tests without browser storage.

- [ ] **Step 1: Write failing provider/repository tests**

Prove initial loading, successful authoritative merge, failed mutation retaining previous state/form values, retry, stale-data banner after refresh failure, subscription invalidation, and cleanup. Run the focused test and require the missing-module failure.

- [ ] **Step 2: Generate database types and implement mappers**

After the migration exists, run `supabase gen types typescript --local > lib/data/database.types.ts` through a temporary output then apply the generated content. Mappers must validate curriculum JSON, convert cents to numbers only at display boundaries, preserve ISO dates, and never synthesize records when rows are missing.

- [ ] **Step 3: Implement the repository**

Load related tables in bounded parallel queries, fail with typed `DomainError` on any query error, and order collections deterministically. For mutations, use `.select().single()` or RPC return values so the provider receives database truth. Subscribe only to operational tables and debounce invalidation into one `loadWorkspace()`.

- [ ] **Step 4: Implement provider and neutral UI primitives**

Use reducer state only for network lifecycle and authoritative snapshots; remove local persistence. Expose `isSaving(actionKey)` for row/form-specific pending states. Migrate modal/drawer/status/toast components without demo wording. Mount the provider in `app/layout.tsx`.

- [ ] **Step 5: Verify and commit**

Run provider tests, existing selector/storage/reducer tests to identify remaining consumers, typecheck, and `git diff --check`; commit as `feat: add persistent operations data layer`.

---

### Task 4: Make public program discovery and registration real

**Files:**
- Create: `app/api/registrations/route.ts`
- Modify: `components/public/dynamic-programs.tsx`
- Modify: `components/public/program-detail.tsx`
- Modify: `components/public/registration-wizard.tsx`
- Modify: `app/events/page.tsx`
- Modify: `app/events/[slug]/page.tsx`
- Modify: `app/register/[slug]/page.tsx`
- Modify: `app/public-flows.css`
- Modify: `tests/public-registration.test.tsx`
- Create: `tests/registration-route.test.ts`
- Modify: `tests/routes.test.tsx`

**Interfaces:**
- `POST /api/registrations` accepts `{ submission, idempotencyKey, website }` and returns `{ receipt }` with HTTP 201, or `{ error: { code, message, fields? } }` with 400/409/422/429/503.
- Public components consume only `PublicProgram` and `PublicSession`.

- [ ] **Step 1: Write failing route and UI tests**

Cover valid online submission, honeypot rejection, invalid payload, closed program, duplicate idempotency, pending-button behavior, retry with preserved input, successful reference/status/dates, and paid-program external-payment instructions. Prove the form has no account gate or card fields.

- [ ] **Step 2: Implement the registration endpoint**

Parse the body with Zod, reject a populated honeypot with a generic success-shaped response, call `submit_registration` using the server-only client, map known database exceptions to safe status codes, add `Cache-Control: no-store`, and never log the body.

- [ ] **Step 3: Convert public program reads**

Fetch only published/open program and scheduled-session views. Render explicit `loading`, `not found`, `registration closed`, `full/waitlist`, and `service unavailable` states. Existing slugs and event links remain stable.

- [ ] **Step 4: Replace the registration wizard workflow**

Remove family session checks and payment simulation. Generate one UUID idempotency key per form attempt, submit once, preserve state on failure, and render a confirmation containing reference, actual returned status, selected dates, and contact/payment instructions. Do not link to `/portal`.

- [ ] **Step 5: Verify and commit**

Run route/public tests, typecheck, and `git diff --check`; commit as `feat: persist public registrations`.

---

### Task 5: Build the complete staff registration inbox and editor

**Files:**
- Create: `components/staff/registration-editor.tsx`
- Modify: `components/staff/registrations-view.tsx`
- Modify: `components/staff/program-detail.tsx`
- Modify: `components/staff/staff-home.tsx`
- Modify: `app/staff/staff.css`
- Create: `tests/staff-registrations.test.tsx`
- Modify: `tests/staff-core.test.tsx`
- Modify: `tests/staff-secondary.test.tsx`

**Interfaces:**
- `RegistrationEditor` accepts `{ mode, registrationId?, onSaved, onCancel }` and submits `CreateManualRegistrationDraft` or `UpdateRegistrationDraft`.
- Repository methods include `createManualRegistration`, `updateRegistration`, `replaceRegistrationSessions`, `upsertConsent`, `upsertAttendance`, `recordPayment`, and `archiveRegistration`.

- [ ] **Step 1: Write failing inbox/editor tests**

Prove newest online submission/source/reference visibility, manual creation, all-field edit, selected-session reconciliation, consent correction, attendance update, payment record, archive, filters/search, CSV contents, pending controls, and retry-preserved values.

- [ ] **Step 2: Build the shared registration editor**

Reuse public field labels where possible, but add staff-only source, internal notes, registration/payment status, receipt reference, and session reconciliation. Keep each section navigable in one drawer. Validate before mutation and keep the drawer open after errors.

- [ ] **Step 3: Expand the Registrations tab**

Add `Add registration`, source/date/payment filters, source badges, public reference, complete detail editing, archival confirmation, and real export. Sort active rows by `submittedAt desc`; archived rows appear only under an explicit filter.

- [ ] **Step 4: Connect rosters and dashboard attention**

Program rosters and the staff home use the same registration rows. New online/incomplete/unpaid/waitlisted records produce actionable links into the editor. Attendance changes update session and dashboard totals after the authoritative response.

- [ ] **Step 5: Verify and commit**

Run staff registration/core/secondary tests and typecheck; commit as `feat: add live registration operations`.

---

### Task 6: Complete programs, sessions, curriculum, and coaches

**Files:**
- Create: `components/staff/session-editor.tsx`
- Create: `components/staff/coach-editor.tsx`
- Modify: `components/staff/programs-view.tsx`
- Modify: `components/staff/program-detail.tsx`
- Modify: `components/staff/coaches-view.tsx`
- Modify: `components/staff/staff-home.tsx`
- Modify: `app/staff/staff.css`
- Create: `tests/staff-programs.test.tsx`
- Create: `tests/staff-coaches.test.tsx`
- Modify: `tests/staff-core.test.tsx`

**Interfaces:**
- Repository methods: `createProgram`, `updateProgram`, `archiveProgram`, `createSession`, `updateSession`, `updateSessionCurriculum`, `assignCoach`, `createCoach`, `updateCoach`, and `archiveCoach`.

- [ ] **Step 1: Write failing workflow tests**

Cover program create/edit/public visibility, session create/edit/cancel, curriculum save, assignment replacement, coach create/edit/deactivate, volunteer-minute edits, relational list updates, failed-write recovery, and capacity derived from confirmed registrations.

- [ ] **Step 2: Implement program/session editors**

Persist every currently editable field and add missing session creation/editing. Derive capacity from server data; never let the client overwrite enrollment counts. Block archiving a program with future active sessions until the user cancels or moves them.

- [ ] **Step 3: Implement coach management**

Add `Add coach`, editable profile/availability/hours, deactivate with assignment impact shown, and assignment navigation. Store volunteer minutes and format decimal hours only in the UI.

- [ ] **Step 4: Verify and commit**

Run focused program/coach tests, typecheck, and `git diff --check`; commit as `feat: persist program delivery workflows`.

---

### Task 7: Complete organizations, projects, finance, files, and settings

**Files:**
- Create: `components/staff/organization-editor.tsx`
- Create: `components/staff/project-editor.tsx`
- Create: `components/staff/finance-editor.tsx`
- Create: `components/files/private-file-button.tsx`
- Modify: `components/staff/organizations-view.tsx`
- Modify: `components/staff/organization-detail.tsx`
- Modify: `components/staff/projects-view.tsx`
- Modify: `components/staff/project-detail.tsx`
- Modify: `components/staff/finance-view.tsx`
- Modify: `components/staff/settings-view.tsx`
- Modify: `app/staff/staff.css`
- Create: `tests/staff-organizations.test.tsx`
- Create: `tests/staff-projects.test.tsx`
- Create: `tests/staff-finance-settings.test.tsx`

**Interfaces:**
- Repository methods: organization/project/task/finance create-update-archive operations, interaction append, `uploadFile(input)`, `createSignedFileUrl(fileId)`, `inviteStaff(email, role)`, `setStaffActive`, and `updateWorkspaceSettings`.

- [ ] **Step 1: Write failing tests for every remaining mutation**

Cover organization create/edit/interaction, project create/edit/contributors, task add/edit/complete, finance add/edit/archive/export, receipt upload/signed URL, admin invite/deactivate, staff denial of admin settings, form-version updates, pending/error/retry, and neutral non-demo copy.

- [ ] **Step 2: Implement organization and project flows**

Add creation from list headers, full editors, owner/contributor selectors, task editing, and archive confirmations. Append interactions rather than rewriting history. Update organization `last_update` and `next_step` in the same database transaction as the interaction.

- [ ] **Step 3: Implement finance and private files**

Use integer cents end to end. Validate MIME type and size before private-bucket upload, insert metadata only after upload succeeds, and remove the object if metadata insertion fails. Signed URLs expire after five minutes. Add edit/archive and filtered CSV export.

- [ ] **Step 4: Implement live settings**

Show current identity/project status. Admins can allowlist/invite/deactivate staff and update consent versions/contact copy. Ordinary staff see read-only settings. Remove Reset Demo and all browser-storage language.

- [ ] **Step 5: Verify and commit**

Run focused organization/project/finance/settings tests, typecheck, and `git diff --check`; commit as `feat: complete persistent staff operations`.

---

### Task 8: Remove demo/family dead ends and migrate the full test suite

**Files:**
- Modify: `app/portal/layout.tsx`
- Modify: `app/portal/page.tsx`
- Modify: every child route under `app/portal/**/page.tsx`
- Delete: `components/portal/portal-shell.tsx`
- Delete: `components/portal/portal-home.tsx`
- Delete: `components/portal/camps-view.tsx`
- Delete: `components/portal/camp-detail.tsx`
- Delete: `components/portal/account-view.tsx`
- Delete: `components/demo/demo-provider.tsx`
- Delete: `components/demo/session-guard.tsx`
- Delete: `components/demo/demo-sign-in.tsx`
- Delete: `components/demo/demo-file-preview.tsx`
- Delete: `components/demo/overlay.tsx`
- Delete: `components/demo/demo-ui.tsx`
- Delete: `lib/demo/reducer.ts`
- Delete: `lib/demo/storage.ts`
- Delete: `lib/demo/seed.ts`
- Delete: `lib/demo/types.ts`
- Delete: `lib/demo/selectors.ts`
- Delete: `lib/demo/csv.ts`
- Modify: `components/site-shell.tsx`
- Modify: `app/demo.css`
- Modify: `app/demo-polish.css`
- Modify: `app/portal/portal.css`
- Modify: `app/staff/staff.css`
- Modify: `tests/interactions.test.tsx`
- Delete: `tests/demo-state.test.ts`
- Delete: `tests/portal.test.tsx`
- Delete: `tests/portal-redirects.test.ts`
- Modify: `tests/overlay.test.tsx`
- Modify: `tests/routes.test.tsx`
- Modify: `tests/home.test.tsx`

**Interfaces:**
- All `/portal/**` routes issue framework redirects to `/events`.
- No production import contains `/demo/`, `DemoProvider`, `localStorage`, `family-demo`, or `staff-demo`.

- [ ] **Step 1: Write/update failing navigation and copy tests**

Assert staff-only sign-in links, portal redirects, no family-workspace calls to action, no demo/local/fictional storage copy, no inert file controls, and no remaining client storage writes.

- [ ] **Step 2: Redirect retired routes and neutralize shared names/styles**

Keep route files as redirects so old bookmarks never 404. Move any reused modal/status styles to neutral class names, remove unused portal CSS/imports, and update navigation copy.

- [ ] **Step 3: Remove the old state system after imports reach zero**

Run `rg -n "DemoProvider|useDemo|lib/demo|components/demo|localStorage|family-demo|staff-demo|fictional|Demo mode" app components lib tests`. Delete old files only when production results are empty and test results are expected migration fixtures. Update the remaining tests to the memory repository.

- [ ] **Step 4: Run the complete local verification and commit**

Run `npm run test:focused`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`. Commit as `refactor: remove browser demo state`.

---

### Task 9: Provision the exact Supabase project and prove the live backend

**Files:**
- Modify: `.env.local` (ignored; never stage)
- Modify: `.openai/hosting.json` only if the Sites deployment workflow adds required bindings; preserve `project_id`.
- Modify: `lib/data/database.types.ts`
- Create: `OPERATIONS.md`
- Delete: `DEMO.md`

**Interfaces:**
- Local and hosted variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.
- Linked Supabase project owner account: `yuanchengli612@gmail.com`.

- [ ] **Step 1: Inspect the authenticated Supabase account and create/link the exact project**

Use the Supabase dashboard signed in as `yuanchengli612@gmail.com`. Reuse a clearly matching Rookie Rackets project if it exists; otherwise create `rookie-rackets-operations` on the Free plan. Record the project reference locally without exposing it in user-facing logs. Confirm the owner email before applying SQL.

- [ ] **Step 2: Apply and verify schema before data writes**

Run linked migration list, `supabase db push --linked --dry-run`, push the single reviewed migration, rerun migration list, and rerun dry-run expecting no pending migrations. Generate remote database types and compare schema names with local types. Run `supabase test db --linked` if supported; otherwise execute the pgTAP file in the linked test path and save summarized pass/fail evidence.

- [ ] **Step 3: Seed fixtures and bootstrap the administrator**

Apply the idempotent seed. Create/invite `yuanchengli612@gmail.com` through Supabase Auth, complete a sign-in, and query `staff_profiles` to prove `role = 'admin'` and `active = true`. Do not create any family users.

- [ ] **Step 4: Configure local/hosted secrets and verify live data flow**

Place credentials in ignored `.env.local` and the Sites host secret store. Start the app, submit one clearly labeled verification registration through `POST /api/registrations`, authenticate as the administrator, confirm the same reference appears in the Registrations tab, change its status, refresh, and confirm persistence. Archive/delete only that exact verification record using its returned UUID.

- [ ] **Step 5: Write the operations runbook**

Document setup, environment names, migration/seed commands, staff allowlisting, payment-status semantics, file limits, troubleshooting, free-plan inactivity behavior, backup/export guidance, verification commands, and deployment steps. Do not include credentials or live magic links.

- [ ] **Step 6: Run final predeployment verification and commit**

Run SQL tests, the complete Vitest suite, lint, typecheck, Vinext build, and any required Next compatibility build. Inspect `git status`, `git diff --check`, and the staged diff. Commit only implementation/docs as `feat: launch Supabase operations dashboard`.

---

### Task 10: Deploy the completed Sites application and verify production

**Files:**
- Modify: deployment metadata only as required by the Sites hosting workflow.

**Interfaces:**
- Produces the deployed Sites version for the existing `.openai/hosting.json` project.

- [ ] **Step 1: Read and apply `sites-hosting` instructions**

Load the hosting skill, preserve the existing Sites `project_id`, save a new version from the verified checkout, and deploy that exact version. Do not deploy an intermediate build.

- [ ] **Step 2: Verify terminal deployment state**

Require the deployment tool to report success and the expected project/version. Fetch the public homepage, an event detail, registration route, sign-in route, and an unauthorized staff route; require non-error responses and correct redirects/noindex behavior.

- [ ] **Step 3: Verify production persistence**

Submit one production verification registration, confirm it in Supabase and in the authenticated administrator Registrations tab, update it, reload, confirm the update, then remove/archive exactly that verification record. Confirm an anonymous request cannot select registrations.

- [ ] **Step 4: Final evidence review**

Run `git status --short --branch`, confirm no secrets are tracked with `git grep -n "SUPABASE_SERVICE_ROLE_KEY="`, and report separately: local tests/build, remote schema/policies, deployed routes, authenticated admin rendering, and the end-to-end public-registration persistence check.

---

## Plan self-review

- Spec coverage: every database entity, permission boundary, public flow, staff workflow, removed portal route, error state, file flow, migration, deployment, and live acceptance check maps to Tasks 1-10.
- Placeholder scan: implementation steps name exact files, commands, interfaces, expected outcomes, and concrete error cases; no deferred implementation markers remain.
- Type consistency: `RegistrationSubmission`, `RegistrationReceipt`, `OperationsRepository`, `OperationsState`, `StaffProfile`, and repository method names are introduced before their UI consumers.
- Execution selection: repository instructions prohibit subagents, and the user requested immediate construction, so use inline `superpowers:executing-plans` without another execution-choice pause.

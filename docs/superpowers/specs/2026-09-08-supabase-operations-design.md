# Rookie Rackets Supabase operations design

Date: 2026-09-08

## Goal

Replace the browser-only demo state with a real operations system. Public visitors submit registrations without creating accounts. Each submission becomes a persistent staff registration immediately. Authorized staff can also enter registrations received offline and can manage every existing operational record from the dashboard.

`yuanchengli612@gmail.com` is the initial administrator. There are no family accounts or family portal in this version.

## Product boundary

The implementation keeps the existing public website and staff dashboard design. It replaces localStorage, fictional authentication, simulated payments, demo reset controls, and fake file records with real Supabase-backed behavior.

The system includes:

- public programs, sessions, and registration submission;
- staff authentication and authorization;
- registrations, selected sessions, consents, attendance, and manual payment tracking;
- programs, session schedules, curriculum, and coach assignments;
- coaches and volunteer hours;
- partner organizations and interaction history;
- projects and tasks;
- finance entries and receipt/document uploads;
- an immutable activity history for important staff actions; and
- workspace settings for form versions and authorized staff.

Online payments, family logins, outbound email automation, accounting-system synchronization, and Google Drive synchronization are outside this version. Paid registrations are recorded as `unpaid` until staff records an external payment, waiver, or refund. The UI must describe that workflow plainly and must never claim that a charge occurred.

## Chosen architecture

Use Supabase Free for PostgreSQL, Auth, Storage, Realtime, and row-level security. The existing Vinext/Cloudflare Sites application remains the web frontend.

The browser uses a public Supabase URL and publishable/anonymous key for public read-only program data and authenticated staff reads. Sensitive mutations run through application server endpoints or security-definer database functions. The Supabase service-role key is available only to the hosted server runtime and local ignored environment files.

Public registration submission goes through `POST /api/registrations`. The endpoint validates and normalizes the payload, checks that the program is accepting registrations and that selected sessions belong to it, calculates capacity on the server, inserts the registration and related rows in one database transaction, and returns a non-sequential public reference number. The public client never receives permission to read registrations or other private records.

Staff sign in with a Supabase email magic link. A database allowlist controls who can become staff. The initial allowlist contains `yuanchengli612@gmail.com` with the `admin` role. Authentication alone is insufficient: every staff policy also verifies an active staff profile.

## Database model

All primary keys use UUIDs. Dates use `date`; times use `time`; audit timestamps use timezone-aware timestamps. Money is stored as integer cents. User-entered text has explicit maximum lengths at both the application and database layers.

### Identity and settings

- `staff_allowlist`: normalized email, intended role, inviter, created timestamp. Only administrators can read or change it.
- `staff_profiles`: Auth user ID, email, display name, initials, role (`admin` or `staff`), active flag, created and updated timestamps.
- `workspace_settings`: singleton settings for organization name, contact email, current consent-form versions, and registration confirmation copy.

An `auth.users` trigger creates a `staff_profiles` row only when the normalized email exists in `staff_allowlist`. Removing someone from the allowlist or setting `active = false` revokes application access without deleting historical ownership references.

### Programs and delivery

- `organizations`: partner details, type, pipeline status, primary contact, current next step, owner, and timestamps.
- `organization_interactions`: organization, staff owner, interaction type, outcome, notes, next action, occurred date, and timestamps.
- `programs`: slug, organization, type, public description, venue, eligibility, capacity, status, visibility, price in cents, deadline, equipment details, image path, contact, and timestamps.
- `program_sessions`: program, date/time, arrival time, location, curriculum JSON, status, operational notes, and timestamps.
- `coaches`: contact details, role, active/availability state, experience, volunteer minutes, and timestamps.
- `session_coaches`: session, coach, assignment slot, acceptance state, and timestamps. A uniqueness constraint prevents two coaches occupying the same slot.

### Registration operations

- `registrations`: public reference, source (`online` or `staff`), program, player/guardian/emergency details, support notes, equipment and pickup choices, registration status, payment status, submission timestamp, and staff timestamps.
- `registration_sessions`: registration and selected session. A composite primary key prevents duplicate selections.
- `consents`: registration, consent type, form version, response, response timestamp, and timestamps.
- `attendance`: registration, session, attendance status, note, recorder, and timestamps. A unique registration/session constraint makes updates idempotent.
- `payments`: registration, amount in cents, status, received timestamp, method/note, external reference, receipt file, and timestamps. These rows record payments completed outside the website.

The registration transaction locks the selected program while it calculates confirmed enrollment. If capacity remains, the new registration becomes `confirmed`; otherwise it becomes `waitlisted`. This removes the current client-side capacity race. Attendance rows are created only for selected sessions.

### Projects, finance, files, and activity

- `projects`: ownership, contributors, dates, status, priority, description, optional organization/program links, and timestamps.
- `tasks`: project/program/organization links, owner, due date, status, priority, notes, and timestamps.
- `finance_entries`: kind, optional program/project links, date, description, category, amount in cents, payer/payee, reimbursement status, receipt file, creator, and timestamps.
- `files`: storage object path, display name, media type, size, category, uploader, optional entity links, and timestamps.
- `activity_log`: actor, action type, entity type/id, safe summary, structured metadata, and timestamp.

Receipts and operational documents use a private Supabase Storage bucket. Staff request short-lived signed download URLs. The database stores paths and metadata rather than public URLs.

## Authorization and privacy

Row-level security is enabled on every application table.

- Anonymous users may select only public, registration-open program fields and public sessions through dedicated views.
- Anonymous users cannot directly insert, update, or select registrations.
- Active staff may read operational tables and perform ordinary mutations.
- Only administrators may manage the staff allowlist, workspace settings, or deactivate staff.
- Storage access is limited to active staff and private signed URLs.
- Security-definer functions set a fixed `search_path`, validate caller role where applicable, and expose only the minimum operation.

The public registration endpoint rejects unknown fields, oversized text, invalid email/phone/date values, sessions belonging to another program, closed programs, and duplicate resubmissions. It uses a hidden honeypot, a short request timeout, and an idempotency key generated by the browser. Server logs exclude player, emergency-contact, medical/support, and consent values.

Private registration and finance pages remain marked `noindex`. CSV exports are generated only after a staff session is verified.

## Application data flow

Replace `DemoProvider` with an asynchronous `OperationsProvider` backed by a typed repository.

1. On public routes, fetch only published programs and sessions.
2. On staff routes, restore the Supabase session, verify an active staff profile, and load the staff workspace snapshot.
3. Components call repository mutations rather than dispatching reducer actions.
4. Each mutation returns the authoritative changed rows. The provider merges that result, shows a saving/success/error state, and refetches the affected collection when relationships or calculated totals can change.
5. A Supabase Realtime subscription invalidates staff collections changed in another tab or by a new online registration.
6. Failed writes leave the previous state intact and present a retryable error. Forms remain open with the entered values.

The repository boundary keeps Supabase details out of presentation components and gives tests a controllable in-memory implementation. Existing selectors remain pure, but their names and date handling stop referring to demo data.

## User flows

### Public registration

The public event detail links directly to registration. The form no longer asks the visitor to sign in. It collects player, guardian, emergency, selected-date, equipment, pickup, and consent information. Review shows exactly what will be submitted.

Submission disables duplicate clicks and displays a real pending state. Success shows the registration reference, program, selected dates, status, payment instructions, and the Rookie Rackets contact address. Failure preserves the form and offers retry. A closed, full, or changed program produces an explicit state rather than a broken form.

### Staff registration management

The Registrations tab is the operational inbox. New online submissions appear at the top and are labeled `Online`; manual records are labeled `Staff entry`. Staff can:

- add a complete manual registration;
- open and edit every registration field;
- change enrollment and payment statuses;
- change selected sessions with attendance rows reconciled transactionally;
- review and correct consent responses and form versions;
- mark attendance and add internal notes;
- attach a receipt or document;
- export the current filtered view; and
- archive a mistaken or canceled record while preserving the audit trail.

Search covers player, guardian, email, phone, and public reference. Filters cover source, program, enrollment status, payment status, form state, and submission date.

### Remaining staff areas

- Programs: create/edit programs, add/edit/cancel sessions, edit curriculum, manage capacity/public visibility, assign coaches, and view rosters.
- Coaches: add/edit/deactivate coaches, manage availability and volunteer hours, and follow assignment links.
- Organizations: add/edit organizations and append dated calls, emails, visits, and meetings.
- Projects: create/edit projects, manage contributors, and add/edit/complete tasks.
- Finance: add/edit/archive ledger rows, link them to programs/projects, upload receipts, filter, and export.
- Settings: show the authenticated staff member, manage authorized staff and form versions for administrators, and provide sign-out. Demo reset and browser-storage copy are removed.

### Removed routes

`/portal` and its child routes redirect to `/events` with no family-workspace navigation. `/sign-in` becomes staff-only. Existing public registration URLs remain valid.

## File-level implementation map

### New backend and data files

- `supabase/config.toml`: local/linking configuration.
- `supabase/migrations/202609080001_initial_operations_schema.sql`: extensions, enums/check constraints, tables, indexes, updated-at triggers, staff bootstrap allowlist, RLS, public views, registration transaction, activity triggers, and Storage policies.
- `supabase/seed.sql`: migrate the existing believable fixture records into the new schema without demo accounts or fake payments.
- `lib/supabase/browser.ts`: browser client using public environment variables.
- `lib/supabase/server.ts`: server client and cookie handling for Vinext/Cloudflare.
- `lib/supabase/auth.ts`: normalized staff allowlist/profile checks and redirect helpers.
- `lib/data/types.ts`: database-facing domain types and mutation drafts.
- `lib/data/mappers.ts`: snake_case database row to domain-model mapping.
- `lib/data/repository.ts`: repository interface used by UI components.
- `lib/data/supabase-repository.ts`: real read/mutation implementation and Realtime invalidation.
- `lib/data/errors.ts`: safe error normalization for forms and toasts.
- `components/data/operations-provider.tsx`: loading, session, snapshot, mutation, retry, and realtime state.
- `components/data/async-ui.tsx`: shared save/error/empty status elements.
- `app/api/registrations/route.ts`: validated public registration endpoint.
- `app/auth/callback/route.ts`: Supabase magic-link code exchange and safe staff redirect.
- `app/auth/sign-out/route.ts`: session termination.

### Existing application files to replace or update

- `package.json` and `package-lock.json`: add the supported Supabase browser/SSR packages and validation library.
- `.env.example`: document public URL/key and server-only service key names with no secrets.
- `app/layout.tsx`: mount `OperationsProvider` in place of `DemoProvider`.
- `app/sign-in/page.tsx` and `components/demo/demo-sign-in.tsx`: replace role selection with staff email magic-link sign-in, rename the component, and handle unauthorized email/error/sent states.
- `components/demo/session-guard.tsx`: replace local role checks with authenticated active-staff checks and rename it.
- `components/demo/demo-provider.tsx`: remove after consumers use `OperationsProvider`.
- `lib/demo/reducer.ts`, `lib/demo/storage.ts`, and localStorage-only tests: remove after the repository migration.
- `lib/demo/types.ts`, `lib/demo/selectors.ts`, and `lib/demo/csv.ts`: move reusable domain types/selectors/export logic under `lib/data` and remove demo-specific dates and copy.
- `components/demo/demo-ui.tsx`, `components/demo/overlay.tsx`, and `components/demo/demo-file-preview.tsx`: retain reusable UI behavior under neutral names; file preview becomes a private signed download.
- `components/public/dynamic-programs.tsx`, `components/public/program-detail.tsx`, `components/public/registration-wizard.tsx`, `app/events/**`, and `app/register/[slug]/page.tsx`: read public database data, remove family-account gates and fake payment, submit the real endpoint, and render complete pending/error/success/closed states.
- `components/staff/staff-shell.tsx` and `components/staff/staff-home.tsx`: use authenticated identity/live counts, remove reset/demo controls, and show new online submissions.
- `components/staff/registrations-view.tsx`: add the full online/manual inbox, manual-create form, editable detail, payment/forms/session management, archive, and real CSV behavior.
- `components/staff/programs-view.tsx` and `components/staff/program-detail.tsx`: make all program/session/curriculum/coach/attendance actions asynchronous and add missing session creation/editing.
- `components/staff/coaches-view.tsx`: add persistent coach create/edit/deactivate and volunteer-hour controls.
- `components/staff/organizations-view.tsx` and `components/staff/organization-detail.tsx`: add organization creation and persist edits/interactions.
- `components/staff/projects-view.tsx` and `components/staff/project-detail.tsx`: add project creation and persist project/task mutations.
- `components/staff/finance-view.tsx`: persist add/edit/archive, use integer cents, and implement private receipt upload.
- `components/staff/settings-view.tsx`: replace demo boundaries with staff/form settings and administrator controls.
- `app/portal/**` and `components/portal/**`: replace pages with redirects or remove unreachable components.
- `app/demo.css`, `app/demo-polish.css`, `app/portal/portal.css`, and `app/staff/staff.css`: rename demo-specific selectors as needed and add consistent asynchronous/error/form states without redesigning the approved visual system.
- `DEMO.md`: replace with an operations runbook covering local setup, Supabase linking, environment variables, staff bootstrap, migration/seed, verification, and deployment.

### Tests

- `tests/registration-contract.test.ts`: schema validation, normalization, capacity/waitlist decisions, session ownership, idempotency, and safe error responses.
- `tests/operations-provider.test.tsx`: initial load, mutation success, failure rollback, retry, and realtime refresh.
- `tests/public-registration.test.tsx`: anonymous submission, pending state, retry-preserved form, reference confirmation, and paid-program instructions.
- `tests/staff-auth.test.tsx`: active allowlisted admin, inactive/unapproved account, callback redirect, and sign-out.
- `tests/staff-registrations.test.tsx`: online source visibility, manual entry, edits, selected-session reconciliation, attendance, payment, archive, and filtering/export.
- Existing staff component tests: convert from reducer assertions to repository-backed asynchronous behavior, then add coverage for newly live controls in programs, coaches, organizations, projects, finance, and settings.
- `supabase/tests/operations_rls.sql`: anonymous/public read boundary, blocked private reads, active staff CRUD, admin-only staff management, inactive-staff denial, public submission transaction, and capacity concurrency invariants.

## Error handling and recovery

Every page has a real loading skeleton, empty state, retryable load error, and permission-expired state. Every form distinguishes validation errors from network/server failures. Buttons expose pending state and prevent duplicate writes. Mutations are idempotent where duplicate browser submission is plausible.

The UI never silently resets to fixtures. If Supabase is unavailable, existing loaded data stays visible and is marked stale; new writes fail visibly and remain editable for retry. Realtime is an enhancement, so a reconnect triggers a normal refetch and the dashboard remains correct without it.

## Migration and deployment

1. Create a Supabase project owned by the Google account `yuanchengli612@gmail.com`.
2. Link the local Supabase directory to that exact project.
3. Apply the migration and seed fixture data.
4. Create or invite the Auth user `yuanchengli612@gmail.com`; verify the trigger creates an active administrator profile.
5. Configure local ignored variables and hosted Sites secrets.
6. Run SQL policy/invariant tests, application tests, typecheck, lint, and production builds.
7. Verify one anonymous registration reaches the database and appears for the signed-in administrator; then remove the verification record.
8. Save and deploy a Sites version, verify deployment status, and test the deployed staff sign-in and registration flow.

## Acceptance criteria

- Refreshing, signing out/in, changing browsers, and opening another staff session preserve the same records from Supabase.
- An anonymous visitor can submit a registration without an account but cannot read any private registration data.
- A new online registration appears in the staff Registrations tab with source, timestamp, reference, program, sessions, forms, and payment status.
- Staff can create an offline registration and edit every operational field described above.
- All existing dashboard mutation controls persist or are replaced by complete working controls; no demo reset, local-only success copy, fictional charge, or inert file button remains.
- Only active allowlisted staff can enter `/staff`; only an administrator can manage staff access.
- `yuanchengli612@gmail.com` is the initial active administrator.
- Database constraints and transactions enforce cross-record correctness even when requests race or bypass the UI.
- Focused tests, the complete application suite, typecheck, lint, SQL tests, and production builds pass.
- Live verification proves the deployed public form writes to the intended Supabase project and the deployed staff dashboard reads and updates that same record.

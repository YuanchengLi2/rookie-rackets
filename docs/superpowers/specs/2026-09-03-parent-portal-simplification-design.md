# Parent Portal Simplification Design

**Date:** 2026-09-03

**Status:** Approved in chat; awaiting written-spec review

**Scope:** Family authentication handoff, camp registration, and family portal information architecture

## Goal

Replace the current fragmented family experience with one continuous path:

1. A family selects a camp.
2. The family signs in or creates a family account.
3. The family enters player and guardian information.
4. The family chooses the dates the player will attend.
5. The family accepts required forms and separately chooses whether to grant photo/video consent.
6. A payment step appears only for a paid camp.
7. The family confirms the registration and lands in that camp inside the portal.

The portal will expose only **Home**, **My Camps**, and **Account**. Forms, consents, payment status, receipts, dates, attendance, and absence reporting belong to the relevant camp rather than separate global pages.

## Problems in the Current Implementation

- `/register/[slug]` allows a registration to be created for the hard-coded demo family even when no family session exists.
- Every session in a program is added to attendance automatically; the family cannot select dates.
- The registration wizard always creates a waived payment record, so paid and free programs do not have distinct flows.
- Forms and payments are top-level portal sections even though both records are owned by one registration.
- Registration detail links away to `/portal/forms`, breaking the camp-centered mental model.
- Portal terminology alternates between programs and registrations instead of using one family-facing term: camps.
- `app/portal/page.tsx` and `tests/portal.test.tsx` import `components/portal/portal-home.tsx`, but that component is currently absent. The simplified homepage must be implemented as part of this work rather than hidden behind navigation changes.

## Chosen Approach

Use the existing local demo state and shared `DemoProvider`, but make registration session-aware and add selected session IDs as first-class registration data. The public camp page remains discoverable without authentication. The register route becomes the family access boundary and returns the family to the same camp after sign-in or sign-up.

This approach is preferred over merely hiding Payments and Forms because it removes the duplicated navigation and fixes the underlying ownership and enrollment model. It also avoids introducing a separate cart, checkout subsystem, or child-profile subsystem before the product needs them.

## Family Registration Experience

### Entry and authentication

- Public camp CTAs continue linking to `/register/[slug]`.
- When no family session exists, the registration route shows a focused access step with two actions:
  - **Sign in to my account**
  - **Create a family account**
- Those actions open `/sign-in` with a validated `next=/register/[slug]` value and a family mode (`login` or `signup`).
- `DemoSignIn` will render the matching family-focused sign-in/sign-up presentation and, in this prototype, create the existing fictional family session locally. Staff demo access remains available from the normal sign-in page and is not mixed into the camp registration flow.
- After family access succeeds, navigation returns to the exact register route. A staff session cannot register a family and will be prompted to switch to family access.

### Wizard steps

The authenticated wizard uses a small number of clearly named steps:

1. **Player** — child, guardian, emergency contact, skill level, support needs, equipment, and on-site preference.
2. **Dates** — selectable scheduled dates for the chosen camp. At least one date is required. Completed or canceled sessions are visible only when helpful for context and cannot be selected.
3. **Forms** — the three required agreements plus a visually separate optional photo/video permission. Declining photo/video permission never blocks registration.
4. **Payment** — present only when `program.price > 0`. Because this is a local-only demo, it records a fictional successful payment without collecting real card data.
5. **Review** — camp, player, chosen dates, forms, and payment/free status before confirmation.

For free camps, the step sequence skips Payment entirely and the persisted payment status is `waived`. For paid camps, confirmation persists a demo `paid` record and receipt. The success state links directly to `/portal/camps/[registrationId]` because the family is already authenticated.

### Validation and failure states

- Required contact and emergency fields keep the current email and phone validation.
- At least one eligible session must be selected.
- Required agreements must be accepted; optional photo/video consent must only be answered by the checkbox state and is never treated as incomplete work.
- If a camp closes or disappears before confirmation, the wizard remains on screen with a clear message and does not create a partial registration.
- Double submission remains blocked.

## Data Model and State Behavior

### Registration ownership

`Registration` and `RegistrationDraft` gain `selectedSessionIds: string[]`. This is the canonical enrollment list for the family registration.

### Attendance creation

`registerForProgram` will validate selected IDs against scheduled sessions belonging to the program. It will create attendance rows only for the validated selected sessions. Selectors and portal screens will use those same selected IDs, preventing a family from seeing or reporting an absence for a date they did not choose.

### Payment behavior

`registerForProgram` derives payment behavior from the canonical program price:

- `price === 0`: registration payment status `waived`, with a zero-dollar waived record.
- `price > 0`: registration payment status `paid`, with a fictional paid record and demo receipt.

No card number, billing address, or external processor integration will be added. The demo notice will remain explicit that real payment information must not be entered.

### Stored demo data

Seed registrations receive selected session IDs matching their existing attendance rows. Storage validation is upgraded to require the new field. The demo-state version will increment so stale local state cannot silently omit date selections; loading an older schema will reset to the current fictional seed while preserving the established safe local-only behavior.

## Portal Information Architecture

### Navigation

`PortalShell` contains exactly:

- Home — `/portal`
- My Camps — `/portal/camps`
- Account — `/portal/account`

Payments, Forms, and My registrations are removed from navigation and page titles.

### Home

The new `PortalHome` is intentionally small:

- A greeting and a single **Find a camp** action.
- The next selected session, when one exists.
- A concise list of the family’s active/upcoming camps.
- Required actions only, such as an incomplete required agreement or a waitlist offer. Optional photo/video consent is not framed as an error.
- Direct links into the relevant camp detail.

There will be no separate payment summary, global forms card, dashboard-style metric wall, or duplicated quick-link grid.

### My Camps

The former registration list becomes a family-facing camp list at `/portal/camps`. It groups current/waitlisted and past/canceled camps, supports a small search/filter control, and links each row to `/portal/camps/[id]`.

Each camp detail contains:

- Registration and waitlist status.
- Selected dates and attendance/absence controls.
- Player and guardian information.
- Required forms and optional photo/video choice, editable in place.
- Payment status, amount, date, and receipt preview when applicable.
- What to bring and contact information.

Forms and payment status are therefore still available but have one obvious home: the camp they apply to.

### Legacy routes

- `/portal/registrations` redirects to `/portal/camps`.
- `/portal/registrations/[id]` redirects to `/portal/camps/[id]`.
- `/portal/forms` redirects to `/portal/camps`.
- `/portal/payments` redirects to `/portal/camps`.

Redirects preserve old bookmarks and internal links while ensuring the removed standalone experiences are not maintained in parallel.

## File-by-File Implementation Guide

### Demo data and domain logic

- `lib/demo/types.ts`
  - Change `DemoState.version` from `1` to `2`.
  - Add `selectedSessionIds: string[]` to `Registration` and `RegistrationDraft`.
- `lib/demo/seed.ts`
  - Set seed version `2`.
  - Add selected session IDs to each seeded family registration, matching its seeded attendance records.
- `lib/demo/storage.ts`
  - Validate version `2` and require `selectedSessionIds` on every registration.
  - Keep invalid/stale-state recovery through a fresh seed rather than letting partially shaped registrations reach the UI.
- `lib/demo/selectors.ts`
  - Add a selector for selected registration sessions.
  - Change `getNextFamilySession` to consider only selected sessions.
  - Add family-specific required-action derivation for the portal homepage; do not reuse the staff-oriented `getNeedsAttention` function.
- `components/demo/demo-provider.tsx`
  - Validate that draft-selected session IDs belong to the program and are scheduled.
  - Refuse a registration with no valid date.
  - Persist only selected attendance rows.
  - Derive waived-versus-paid demo payment records from `program.price`.

### Authentication handoff

- `components/demo/demo-sign-in.tsx`
  - Accept validated family `next` paths for `/register/[slug]` in addition to portal paths.
  - Read a `mode=login|signup` query value and present the relevant family account copy/action.
  - Keep the default role chooser intact for direct `/sign-in` visits and staff access.
- `tests/sign-in.test.tsx`
  - Cover the targeted family login and signup modes and the safe return to the original register route.

### Public registration

- `components/public/program-detail.tsx`
  - Point family-account links to `/portal/camps` and keep the primary registration CTA unchanged.
- `components/public/registration-wizard.tsx`
  - Add the unauthenticated family access gate.
  - Reorder and simplify steps to Player, Dates, Forms, conditional Payment, and Review.
  - Add scheduled-date selection and validation.
  - Keep photo/video consent explicitly optional and non-blocking.
  - Show payment only for paid programs and never request real card details.
  - Send successful families directly to the new camp detail route.
- `app/public-flows.css`
  - Style the access gate, compact step indicator, selectable date rows, optional-consent treatment, and responsive review layout.
  - Remove or replace selectors tied only to the old four-step wizard.
- `tests/public-registration.test.tsx`
  - Require family access before the form.
  - Verify selected dates are saved and unselected dates do not receive attendance rows.
  - Verify required agreements block progress while photo/video permission does not.
  - Verify free programs skip Payment and paid programs include it.

### Simplified family portal

- `components/portal/portal-shell.tsx`
  - Reduce navigation to Home, My Camps, and Account.
  - Update active-route and heading resolution for `/portal/camps/[id]`.
- `components/portal/portal-home.tsx` (new)
  - Implement the currently missing homepage component with next session, camps, and required actions.
- `components/portal/camps-view.tsx` (new)
  - Replace family-facing registration terminology and links with My Camps and `/portal/camps/[id]`.
- `components/portal/camp-detail.tsx` (new)
  - Replace `registration-detail.tsx` with the camp-centered detail.
  - Render selected dates only.
  - Move consent editing and payment/receipt presentation into this component.
  - Preserve waitlist acceptance and absence reporting.
- `components/portal/registrations-view.tsx`
  - Remove after its behavior is represented by `camps-view.tsx`.
- `components/portal/registration-detail.tsx`
  - Remove after its behavior is represented by `camp-detail.tsx`.
- `components/portal/forms-view.tsx`
  - Remove the standalone forms experience after consent rows are moved into camp detail.
- `components/portal/payments-view.tsx`
  - Remove the standalone payments experience after payment details are moved into camp detail.
- `app/portal/page.tsx`
  - Continue rendering the newly implemented `PortalHome`.
- `app/portal/camps/page.tsx` (new)
  - Render `CampsView`.
- `app/portal/camps/[id]/page.tsx` (new)
  - Render `CampDetail` for the route registration ID.
- `app/portal/registrations/page.tsx`
  - Replace the old view with a server redirect to `/portal/camps`.
- `app/portal/registrations/[id]/page.tsx`
  - Redirect to the matching `/portal/camps/[id]` route.
- `app/portal/forms/page.tsx`
  - Redirect to `/portal/camps`.
- `app/portal/payments/page.tsx`
  - Redirect to `/portal/camps`.
- `app/portal/portal.css`
  - Remove standalone forms/payment page styling that no longer has consumers.
  - Add simple camp list, homepage, inline requirement, payment summary, and selected-date styles.
  - Verify single-column mobile behavior at the existing 900px and 600px breakpoints.
- `tests/portal.test.tsx`
  - Assert only the simplified areas are surfaced.
  - Cover homepage next-session and required-action behavior.
  - Cover camp filters, consent editing inside camp detail, payment display inside camp detail, waitlist acceptance, and absence reporting on a selected date.
- `tests/routes.test.tsx`
  - Update any family account route assertions if public route copy changes.

## Testing and Verification

Implementation will be test-driven. The verification sequence is:

1. Run focused state, sign-in, public-registration, and portal tests while implementing.
2. Run the complete Vitest suite.
3. Run ESLint.
4. Run the production Vinext build.
5. Start the local site and manually verify the public camp → family access → registration → camp detail path at desktop and narrow mobile widths.
6. Confirm the browser has no console errors and legacy portal URLs resolve into My Camps.

Deployment is not included unless separately requested. No external account, real payment processor, production database, or production user data will be changed.

## Acceptance Criteria

- An unauthenticated visitor cannot create a family registration.
- Login and signup both return the family to the camp they selected.
- A family can select one or more available dates, and only those dates become attendance records.
- Photo/video consent is visibly optional and declining it does not block enrollment.
- Free programs skip payment; paid programs show the demo payment step.
- Portal navigation contains only Home, My Camps, and Account.
- Home is a concise view of the family’s next session, camps, and genuinely required actions.
- Forms and payment information are editable/viewable inside the relevant camp detail.
- Separate Payments and Forms experiences are no longer reachable as standalone sections.
- Existing family, staff, public-site, responsive, lint, and production-build checks pass.

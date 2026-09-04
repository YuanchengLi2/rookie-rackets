# Parent Portal Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. This repository explicitly forbids subagents.

**Goal:** Build one authenticated, date-selectable family registration flow and reduce the family portal to Home, My Camps, and Account, with forms and payment information inside each camp.

**Architecture:** Keep the existing React/Vinext local-demo architecture and make Registration.selectedSessionIds the canonical enrollment boundary. Authentication is enforced in the registration component using the existing demo session. Selectors isolate family-specific camp/session views, and CampDetail renders registration-owned consents and payments.

**Tech Stack:** TypeScript 5.9, React 19, Next-compatible Vinext routing, Vitest, Testing Library, Lucide React, CSS

**Spec:** docs/superpowers/specs/2026-09-03-parent-portal-simplification-design.md

## Global Constraints

- Do not use subagents.
- Preserve unrelated worktree changes and stage only files from this feature.
- Do not add external authentication, payment, database, or UI dependencies.
- Never request or store real card details; paid registration is explicitly fictional demo behavior.
- Use camp and My Camps for family-facing copy while retaining Program and Registration domain types internally.
- Photo/video consent is optional and must never be represented as required or incomplete work.
- An unauthenticated visitor must not be able to create a registration for family-demo.
- Only selected scheduled sessions may produce attendance rows or family absence controls.
- Legacy portal routes redirect; they do not preserve duplicate Forms or Payments experiences.
- Verify desktop and narrow-phone behavior in addition to automated tests.

## File Map

- lib/demo/types.ts: schema version and selected session fields.
- lib/demo/seed.ts: selected dates for seeded registrations.
- lib/demo/storage.ts: stored-state validation for the new schema.
- lib/demo/selectors.ts: selected-session and family-required-action selectors.
- components/demo/demo-provider.tsx: registration validation plus attendance/payment persistence.
- components/demo/demo-sign-in.tsx: family login/signup modes and safe return path.
- components/public/registration-wizard.tsx: access gate and Player, Dates, Forms, conditional Payment, Review steps.
- components/public/program-detail.tsx: My Camps account destination.
- app/public-flows.css: registration access, date, consent, payment, review, and mobile styles.
- components/portal/portal-shell.tsx: three-item family navigation.
- components/portal/portal-home.tsx: simplified family homepage.
- components/portal/camps-view.tsx: family camp list.
- components/portal/camp-detail.tsx: camp-owned schedule, forms, payment, and attendance.
- app/portal/camps/page.tsx and app/portal/camps/[id]/page.tsx: new routes.
- app/portal/registrations/page.tsx, app/portal/registrations/[id]/page.tsx, app/portal/forms/page.tsx, app/portal/payments/page.tsx: legacy redirects.
- app/portal/portal.css: simplified home and camp detail presentation.
- components/portal/registrations-view.tsx, registration-detail.tsx, forms-view.tsx, payments-view.tsx: removed after behavior moves.
- tests/demo-state.test.ts, tests/sign-in.test.tsx, tests/public-registration.test.tsx, tests/portal.test.tsx, tests/routes.test.tsx: regression coverage.

---

### Task 1: Make Selected Dates Canonical in Demo State

**Files:**
- Modify: lib/demo/types.ts
- Modify: lib/demo/seed.ts
- Modify: lib/demo/storage.ts
- Modify: lib/demo/selectors.ts
- Modify: components/demo/demo-provider.tsx
- Test: tests/demo-state.test.ts

**Interfaces:**
- Produces: Registration.selectedSessionIds: string[]
- Produces: RegistrationDraft.selectedSessionIds: string[]
- Produces: getRegistrationSessions(state: DemoState, registration: Registration): SessionRecord[]
- Produces: getFamilyRequiredActions(state: DemoState, familyId: string): FamilyRequiredAction[]
- Changes: registerForProgram returns an empty string when no valid scheduled date is selected.

- [ ] **Step 1: Write the failing state tests**

Add selectedSessionIds to the registration fixture and assert that only the chosen date gets attendance:

    expect(next.attendance.filter((row) => row.registrationId === 'registration-new').map((row) => row.sessionId))
      .toEqual(['session-boys-sep-11']);

Add tests proving getNextFamilySession ignores unselected dates and the family action selector ignores declined photo/video consent.

- [ ] **Step 2: Run the focused test**

Run: npm test -- tests/demo-state.test.ts

Expected: FAIL because the new fields and selectors do not exist.

- [ ] **Step 3: Implement types and seed shape**

In types.ts, change DemoState.version from 1 to 2 and add this exact field to Registration and RegistrationDraft:

    selectedSessionIds: string[];

In seed.ts, set version to 2 and assign selected session IDs matching each registration's existing attendance rows.

- [ ] **Step 4: Enforce storage version 2**

In storage.ts, require candidate.version === 2 and:

    candidate.registrations.every((registration) =>
      Array.isArray(registration?.selectedSessionIds)
    )

Older local state follows the existing seed-recovery path.

- [ ] **Step 5: Implement selected-session selectors**

Add:

    export function getRegistrationSessions(state: DemoState, registration: Registration): SessionRecord[] {
      const selected = new Set(registration.selectedSessionIds);
      return getProgramSessions(state, registration.programId)
        .filter((session) => selected.has(session.id));
    }

Update getNextFamilySession to use it. Add getFamilyRequiredActions for incomplete required consent and offer-sent states, linking to /portal/camps/[registrationId]. Exclude photo-video consent.

- [ ] **Step 6: Validate dates and derive payments**

In registerForProgram, de-duplicate selected IDs, retain only scheduled sessions owned by the program, and return an empty ID with Choose at least one available date when none remain. Persist those IDs and create attendance only for them.

Set payment status to waived for price 0 and paid for price greater than 0. Store program.price as the amount and use a matching free/paid demo note.

- [ ] **Step 7: Verify Task 1**

Run: npm test -- tests/demo-state.test.ts

Run: npx tsc --noEmit

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

    git add -- lib/demo/types.ts lib/demo/seed.ts lib/demo/storage.ts lib/demo/selectors.ts components/demo/demo-provider.tsx tests/demo-state.test.ts
    git commit -m "feat: store selected camp dates"

### Task 2: Gate Registration Behind Family Access

**Files:**
- Modify: components/demo/demo-sign-in.tsx
- Modify: components/public/registration-wizard.tsx
- Test: tests/sign-in.test.tsx
- Test: tests/public-registration.test.tsx

**Interfaces:**
- Consumes: state.session and signInAs('family').
- Produces: /sign-in?mode=login|signup&next=<encoded-register-path> access links.

- [ ] **Step 1: Write failing authentication tests**

For mode=login and mode=signup with next=/register/boys-club-fall, click the family action and assert router.replace receives /register/boys-club-fall. Test that an external or protocol-relative next value falls back to /portal.

Render RegistrationWizard signed out and assert Player fields are absent while Sign in to my account and Create a family account are present.

- [ ] **Step 2: Run focused tests**

Run: npm test -- tests/sign-in.test.tsx tests/public-registration.test.tsx

Expected: FAIL because registration is public and register return paths are rejected.

- [ ] **Step 3: Implement safe family modes**

In demo-sign-in.tsx, accept only local /register/<slug> and family portal paths for family mode. Render targeted login/signup copy, call signInAs('family'), and return to the validated next path. Keep the existing role chooser for direct /sign-in visits.

- [ ] **Step 4: Implement the wizard access boundary**

Before form rendering, branch on state.session?.role. Non-family sessions see a focused access card. Its login and signup links encode /register/[program.slug]. Staff access is not presented inside this journey.

- [ ] **Step 5: Verify Task 2**

Run: npm test -- tests/sign-in.test.tsx tests/public-registration.test.tsx

Expected: access tests PASS.

- [ ] **Step 6: Commit Task 2**

    git add -- components/demo/demo-sign-in.tsx components/public/registration-wizard.tsx tests/sign-in.test.tsx tests/public-registration.test.tsx
    git commit -m "feat: require family access for camp registration"

### Task 3: Rebuild the Registration Wizard

**Files:**
- Modify: components/public/registration-wizard.tsx
- Modify: components/public/program-detail.tsx
- Modify: app/public-flows.css
- Test: tests/public-registration.test.tsx
- Test: tests/routes.test.tsx

**Interfaces:**
- Consumes: getProgramSessions, selectedSessionIds, authenticated family session, registerForProgram.
- Produces: navigation to /portal/camps/[registrationId].

- [ ] **Step 1: Write the failing wizard tests**

Sign in the demo family before render. Exercise Player -> Dates -> Forms -> Review for a free program. Select only Sep 11, leave photo/video unchecked, accept the three required agreements, and confirm success.

For a paid fixture, change program.price before render and expect Player -> Dates -> Forms -> Payment -> Review. Assert no card-number input exists.

- [ ] **Step 2: Run the focused wizard test**

Run: npm test -- tests/public-registration.test.tsx

Expected: FAIL on Dates, conditional Payment, and the new success destination.

- [ ] **Step 3: Implement stable named steps**

Initialize selectedSessionIds to an empty array. Build steps from program price:

    const steps = program.price > 0
      ? ['player', 'dates', 'forms', 'payment', 'review']
      : ['player', 'dates', 'forms', 'review'];

Group child, guardian, emergency, support, equipment, and on-site inputs in Player. Dates renders scheduled future program sessions as checkbox rows and requires at least one selection.

- [ ] **Step 4: Implement required and optional forms**

Forms contains required participation, program acknowledgment, and pickup checkboxes. Photo/video is a separate optional block with explicit copy that saying no does not affect registration. Validation reads only the three required booleans.

- [ ] **Step 5: Implement conditional payment and review**

Paid programs show amount and local-demo payment copy with no payment fields. Review lists formatted selected dates and Free or the program price. Confirmation calls registerForProgram once.

- [ ] **Step 6: Update destinations**

Successful registration routes directly to /portal/camps/[id]. program-detail.tsx points Open family account to /sign-in?next=/portal/camps. Update the exact route assertion.

- [ ] **Step 7: Add responsive styles**

In public-flows.css, add styles for registration-access-card, registration-date-options, registration-date-option selected state, registration-optional-consent, registration-payment-demo, and registration-review-dates. At the existing narrow breakpoint, stack date metadata and make actions full width without overflow.

- [ ] **Step 8: Verify Task 3**

Run: npm test -- tests/public-registration.test.tsx tests/routes.test.tsx tests/sign-in.test.tsx

Run: npx tsc --noEmit

Expected: PASS.

- [ ] **Step 9: Commit Task 3**

    git add -- components/public/registration-wizard.tsx components/public/program-detail.tsx app/public-flows.css tests/public-registration.test.tsx tests/routes.test.tsx
    git commit -m "feat: simplify family camp registration"

### Task 4: Consolidate the Portal Into Home and My Camps

**Files:**
- Create: components/portal/portal-home.tsx
- Create: components/portal/camps-view.tsx
- Create: components/portal/camp-detail.tsx
- Create: app/portal/camps/page.tsx
- Create: app/portal/camps/[id]/page.tsx
- Modify: components/portal/portal-shell.tsx
- Modify: app/portal/portal.css
- Test: tests/portal.test.tsx

**Interfaces:**
- Consumes: family registrations, selected-session selectors, family actions, consents, payments, updateConsent, acceptWaitlistOffer, reportAbsence.
- Produces: /portal, /portal/camps, and /portal/camps/[id] as the primary family routes.

- [ ] **Step 1: Write failing portal navigation and home tests**

Render PortalShell and assert exact navigation names Home, My Camps, and Account. Assert Payments, Forms, and My registrations are absent. Render PortalHome and verify next selected session, camp cards, and required action links.

- [ ] **Step 2: Write failing camp detail tests**

Assert only selected dates render. Assert required and optional consent controls, payment status/receipt, waitlist acceptance, and absence reporting live inside CampDetail. Assert absence options contain only selected upcoming dates.

- [ ] **Step 3: Run portal tests**

Run: npm test -- tests/portal.test.tsx

Expected: FAIL because the home and camp components do not exist.

- [ ] **Step 4: Simplify PortalShell**

Use exactly Home (/portal), My Camps (/portal/camps), and Account (/portal/account). Keep the mobile drawer, profile, reset, and sign-out behavior. Nested camp routes resolve to the My Camps title.

- [ ] **Step 5: Implement PortalHome**

Create a greeting and Find a camp action, next selected session card, concise active camp list, and required actions. If no next session or actions exist, use calm empty copy. Do not add dashboard metrics or show optional photo consent as an error.

- [ ] **Step 6: Implement CampsView**

Reuse useful filtering logic but label the screen My Camps. Filters are All, Current, Waitlisted, and Past. Every row links to /portal/camps/[id].

- [ ] **Step 7: Implement CampDetail**

Use getRegistrationSessions for schedules and absence controls. Render consent rows in place with required/optional labels and updateConsent buttons. Find the registration payment and render amount, status, date, and receipt preview. Preserve player information, what to bring, attendance, waitlist acceptance, contact, and absence reporting.

- [ ] **Step 8: Add camp routes and styles**

Create route components using the existing async params pattern. Update portal.css for home camp cards, selected date sections, inline requirements, and payment details. Keep shared shell/account/modal styles and one-column behavior at 600px.

- [ ] **Step 9: Verify Task 4**

Run: npm test -- tests/portal.test.tsx

Run: npx tsc --noEmit

Expected: PASS.

- [ ] **Step 10: Commit Task 4**

    git add -- components/portal/portal-home.tsx components/portal/camps-view.tsx components/portal/camp-detail.tsx components/portal/portal-shell.tsx app/portal/camps app/portal/portal.css tests/portal.test.tsx
    git commit -m "feat: consolidate family portal into my camps"

### Task 5: Redirect Legacy Pages and Remove Duplicate Views

**Files:**
- Modify: app/portal/registrations/page.tsx
- Modify: app/portal/registrations/[id]/page.tsx
- Modify: app/portal/forms/page.tsx
- Modify: app/portal/payments/page.tsx
- Delete: components/portal/registrations-view.tsx
- Delete: components/portal/registration-detail.tsx
- Delete: components/portal/forms-view.tsx
- Delete: components/portal/payments-view.tsx
- Test: tests/portal.test.tsx

**Interfaces:**
- Consumes: /portal/camps routes.
- Produces: legacy URL redirects.

- [ ] **Step 1: Add failing redirect tests**

Mock next/navigation.redirect and assert:

    /portal/registrations       -> /portal/camps
    /portal/registrations/:id   -> /portal/camps/:id
    /portal/forms               -> /portal/camps
    /portal/payments            -> /portal/camps

- [ ] **Step 2: Run redirect tests**

Run: npm test -- tests/portal.test.tsx

Expected: FAIL because legacy pages render old components.

- [ ] **Step 3: Implement redirects**

Use redirect from next/navigation. The dynamic registration page awaits params.id and redirects to the matching internal camp path.

- [ ] **Step 4: Prove old views have no consumers**

Run:

    rg -n "RegistrationsView|RegistrationDetail|FormsView|PaymentsView|/portal/forms|/portal/payments" app components tests

Expected: no navigation or detail link targets the old pages; only redirect coverage may remain.

- [ ] **Step 5: Delete duplicate components**

Remove the four obsolete family components. Do not remove staff registration, finance, or account functionality.

- [ ] **Step 6: Verify Task 5**

Run: npm test -- tests/demo-state.test.ts tests/sign-in.test.tsx tests/public-registration.test.tsx tests/portal.test.tsx tests/routes.test.tsx

Expected: PASS.

- [ ] **Step 7: Commit Task 5**

    git add -A -- app/portal components/portal tests/portal.test.tsx
    git commit -m "refactor: retire separate family forms and payments"

### Task 6: Full Verification and Visual QA

**Files:**
- Modify only if a defect is found: files already listed in Tasks 1 through 5.
- Test: complete suite.

**Interfaces:**
- Consumes: completed implementation.
- Produces: automated, production-build, desktop, and narrow-phone evidence.

- [ ] **Step 1: Run the complete suite**

Run: npm test

Expected: all suites PASS without unhandled React warnings.

- [ ] **Step 2: Run static verification**

Run: npm run lint

Run: npx tsc --noEmit

Expected: both exit 0.

- [ ] **Step 3: Run production build**

Run: npm run build

Expected: Vinext build exits 0 and emits register, portal, and camp routes.

- [ ] **Step 4: Start and probe the local site**

Run npm run dev, capture its localhost URL, and confirm HTTP 200 before visual inspection.

- [ ] **Step 5: Verify the full family path**

From reset/signed-out state: open Boys Club Fall, register, confirm the access gate, choose family signup, return to the same camp, complete player data, select a subset of dates, accept required forms, decline camera consent, verify free flow skips Payment, submit, and confirm direct arrival in the camp detail.

Verify that only selected dates appear, forms and payment status are inside the camp, and navigation contains only Home, My Camps, and Account. Confirm legacy Forms, Payments, and Registrations URLs resolve into My Camps.

- [ ] **Step 6: Verify narrow phone**

At approximately 390px width, repeat access, date selection, review, home, camp list, and camp detail checks. Confirm no clipped controls, horizontal page overflow, or hidden required actions.

- [ ] **Step 7: Check console and diff boundaries**

Confirm no runtime errors. Run:

    git status --short
    git diff --check
    git diff --stat

Separate feature files from unrelated pre-existing changes before reporting completion.

- [ ] **Step 8: Commit verification fixes only when needed**

If QA required changes, stage only the affected feature files and commit with message fix: finish family portal verification. Do not create an empty commit.


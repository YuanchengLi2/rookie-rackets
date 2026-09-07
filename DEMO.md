# Rookie Rackets mock platform

This is a three-surface, frontend-only prototype:

- Public website: `/`, `/about`, `/events`, `/completed-events`, `/faq`, `/contact`.
- Family portal: `/portal`.
- Staff operations desk: `/staff`.

## Demo roles

Open `/sign-in` and choose a fictional Family or Staff profile. There are no passwords and this is not secure authentication. A role is stored only in the current browser session. Wrong-role deep links return to the role selector with the requested destination preserved.

## Local state and reset

The provider stores the validated `DemoState` envelope at `rookie-rackets:demo:v1` after client hydration. Seed fixtures are recreated when the JSON is invalid, the schema version is not `1`, or required collections are missing. Reset Demo restores the original walkthrough while preserving the currently selected role. Sign Out clears only the session. No browser data is transmitted anywhere.

Every form carries a Demo mode notice: use fictional data only; do not enter real personal, medical, or payment information. Registration, receipts, messages, Drive files, and payment actions are local simulations. Card fields, API routes, server actions, databases, email, Stripe, Google Drive, D1, and R2 are intentionally excluded.

## Suggested walkthrough

1. Open `/events/boys-club-fall`, then use `View details & register` and complete the four registration stages. Free records confirm immediately; a full program creates a waitlisted record.
2. Follow the confirmation link into the Family portal. Review registrations, report an absence for a future session, and accept the TMSA offer.
3. Open Forms, accept or decline the outstanding consent, then switch to Staff at `/sign-in`.
4. In Staff, open the Boys Club roster to see the absence, reassign a session coach, and inspect the activity feed.
5. Update White Oak's next step and add a timeline update. Open Projects, complete a task, and add/export a fictional finance entry.
6. Refresh routes to verify persistence, then use Reset Demo in the shell or Settings to return to the original narrative.

## Verification

Run from this directory:

```powershell
npm test -- --reporter=dot
npm run lint
npx next build
npx tsc --noEmit
npm run build
```

The public pages retain their approved design and content; the only global header addition is the quiet `Sign In` link beside `Sign Up`. Portal and staff styles are isolated in `app/portal/portal.css` and `app/staff/staff.css`, and both responsive shells collapse to an accessible drawer at tablet/mobile widths.

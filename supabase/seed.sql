insert into public.organizations (id, name, type, website, address, primary_contact, primary_contact_email, status, last_update, next_step)
values
  ('10000000-0000-4000-8000-000000000001', 'Raleigh Boys Club', 'community-center', 'https://wakejohnstonbgc.org/raleigh-boys-club/', 'Raleigh, NC', 'Program coordinator', null, 'active-partner', 'Fall roster confirmed', 'Confirm coaches for the next session'),
  ('10000000-0000-4000-8000-000000000002', 'TMSA', 'school', '', 'Cary, NC', 'School activities office', null, 'active-partner', 'Fall planning underway', 'Confirm remaining workshop dates'),
  ('10000000-0000-4000-8000-000000000003', 'Carpenter Elementary', 'school', '', 'Cary, NC', 'School office', null, 'interested', 'Workshop conversation opened', 'Set the first planning call'),
  ('10000000-0000-4000-8000-000000000004', 'White Oak', 'school', '', 'Apex, NC', 'School office', null, 'follow-up-due', 'Program overview shared', 'Send schedule options')
on conflict (id) do update set
  name = excluded.name, type = excluded.type, website = excluded.website, address = excluded.address,
  primary_contact = excluded.primary_contact, primary_contact_email = excluded.primary_contact_email,
  status = excluded.status, last_update = excluded.last_update, next_step = excluded.next_step, archived_at = null;

insert into public.coaches (id, name, email, role, active, experience, availability, volunteer_minutes)
values
  ('20000000-0000-4000-8000-000000000001', 'Adithya', 'adithya@example.test', 'program-lead', true, 'Nationally trained player and program lead.', 'available', 1110),
  ('20000000-0000-4000-8000-000000000002', 'Vihaan', 'vihaan@example.test', 'coach', true, 'Competitive player and returning workshop coach.', 'available', 720),
  ('20000000-0000-4000-8000-000000000003', 'Nathan', 'nathan@example.test', 'program-lead', true, 'School-program lead.', 'available', 900),
  ('20000000-0000-4000-8000-000000000004', 'Yuancheng', 'yuanchengli612@gmail.com', 'volunteer', true, 'Operations and coaching volunteer.', 'tentative', 540)
on conflict (id) do update set
  name = excluded.name, email = excluded.email, role = excluded.role, active = excluded.active,
  experience = excluded.experience, availability = excluded.availability, volunteer_minutes = excluded.volunteer_minutes, archived_at = null;

insert into public.programs (
  id, slug, name, organization_id, type, description, venue, skill_level, eligibility, capacity,
  lead_coach_id, status, visibility, price_cents, registration_deadline, what_to_bring,
  equipment_provided, image, contact
)
values
  (
    '30000000-0000-4000-8000-000000000001', 'boys-club-fall', 'Raleigh Boys Club Workshops',
    '10000000-0000-4000-8000-000000000001', 'recurring-partner-program',
    'Four Friday beginner workshops delivered exclusively for Raleigh Boys Club participants.', 'Raleigh Boys Club',
    'beginner', 'Raleigh Boys Club participants in grades 3–6', 24, '20000000-0000-4000-8000-000000000001', 'active', 'public', 0,
    '2026-12-18', array['Athletic non-marking shoes', 'Water bottle'], true, '/images/raleigh-boys-club.webp',
    'Rookie Rackets team · teamrookierackets@gmail.com'
  ),
  (
    '30000000-0000-4000-8000-000000000002', 'tmsa-fall', 'TMSA Fall Workshop',
    '10000000-0000-4000-8000-000000000002', 'multiweek-school-program',
    'Four Friday school workshops that move from racket basics to cooperative games.', 'TMSA Elementary',
    'mixed', 'Elementary students', 20, '20000000-0000-4000-8000-000000000003', 'active', 'public', 0,
    '2026-12-20', array['Athletic non-marking shoes'], true, '/images/gallery-certificates.webp',
    'Rookie Rackets team · teamrookierackets@gmail.com'
  ),
  (
    '30000000-0000-4000-8000-000000000003', 'carpenter-elementary', 'Carpenter Elementary Workshop',
    '10000000-0000-4000-8000-000000000003', 'one-day-workshop',
    'A beginner workshop planned with Carpenter Elementary.', 'Carpenter Elementary',
    'beginner', 'Elementary students', 24, '20000000-0000-4000-8000-000000000001', 'planning', 'public', 0,
    '2027-01-10', array['Athletic non-marking shoes'], true, '/images/story.webp',
    'Rookie Rackets team · teamrookierackets@gmail.com'
  )
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, organization_id = excluded.organization_id, type = excluded.type,
  description = excluded.description, venue = excluded.venue, skill_level = excluded.skill_level,
  eligibility = excluded.eligibility, capacity = excluded.capacity, lead_coach_id = excluded.lead_coach_id,
  status = excluded.status, visibility = excluded.visibility, price_cents = excluded.price_cents,
  registration_deadline = excluded.registration_deadline, what_to_bring = excluded.what_to_bring,
  equipment_provided = excluded.equipment_provided, image = excluded.image, contact = excluded.contact, archived_at = null;

insert into public.program_sessions (id, program_id, date, start_time, end_time, arrival_time, location, lead_coach_id, curriculum, status, notes)
values
  (
    '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '2026-10-09', '16:00', '17:00', '15:40',
    'Boys Club of Raleigh', '20000000-0000-4000-8000-000000000001',
    '{"objective":"Build control through serves and short rallies","activities":[{"id":"warmup-1","kind":"warm-up","title":"Shuttle balance relay","minutes":10,"instructions":"Balance a shuttle on the racket while moving between cones."},{"id":"skill-1","kind":"skill","title":"Underhand serve stations","minutes":20,"instructions":"Rotate through contact, direction, and target stations."},{"id":"game-1","kind":"game","title":"Serve and rally","minutes":25,"instructions":"Start each rally with a legal underhand serve."}],"coachNotes":"Set up large targets before players arrive.","updatedAt":"2026-09-08"}'::jsonb,
    'canceled', 'Superseded placeholder date; review linked registrations before contacting families.'
  ),
  (
    '40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', '2026-10-16', '16:00', '17:00', '15:40',
    'Boys Club of Raleigh', '20000000-0000-4000-8000-000000000001',
    '{"objective":"Move to the shuttle and recover","activities":[],"coachNotes":"Confirm the final coach roster.","updatedAt":"2026-09-08"}'::jsonb,
    'canceled', 'Superseded placeholder date; review linked registrations before contacting families.'
  ),
  (
    '40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', '2026-10-23', '15:30', '17:00', '15:10',
    'TMSA Elementary', '20000000-0000-4000-8000-000000000003',
    '{"objective":"Introduce badminton through movement and contact games","activities":[],"coachNotes":"Use four clearly labeled station groups.","updatedAt":"2026-09-08"}'::jsonb,
    'canceled', 'Superseded placeholder date.'
  ),
  (
    '40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', '2026-10-30', '15:30', '17:00', '15:10',
    'TMSA Elementary', '20000000-0000-4000-8000-000000000003',
    '{"objective":"Develop serve direction and ready position","activities":[],"coachNotes":"Use two large groups.","updatedAt":"2026-09-08"}'::jsonb,
    'canceled', 'Superseded placeholder date.'
  ),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000001', '2026-08-28', '17:00', '18:00', '16:40', 'Raleigh Boys Club', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'completed', ''),
  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000001', '2026-09-11', '17:00', '18:00', '16:40', 'Raleigh Boys Club', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'completed', ''),
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000001', '2026-09-18', '17:00', '18:00', '16:40', 'Raleigh Boys Club', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'completed', ''),
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000001', '2026-09-25', '17:00', '18:00', '16:40', 'Raleigh Boys Club', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000002', '2026-10-02', '15:45', '16:45', '15:25', 'TMSA Elementary', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000002', '2026-10-09', '15:45', '16:45', '15:25', 'TMSA Elementary', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000002', '2026-11-06', '15:45', '16:45', '15:25', 'TMSA Elementary', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000002', '2026-11-13', '15:45', '16:45', '15:25', 'TMSA Elementary', null, '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb, 'scheduled', ''
  )
on conflict (id) do update set
  program_id = excluded.program_id, date = excluded.date, start_time = excluded.start_time, end_time = excluded.end_time,
  arrival_time = excluded.arrival_time, location = excluded.location, lead_coach_id = excluded.lead_coach_id,
  curriculum = excluded.curriculum, status = excluded.status, notes = excluded.notes;

insert into public.session_coaches (id, session_id, coach_id, slot, accepted)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'lead', true),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'coach-2', true),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'lead', true),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'lead', true),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'lead', true)
on conflict (id) do update set session_id = excluded.session_id, coach_id = excluded.coach_id, slot = excluded.slot, accepted = excluded.accepted;

insert into public.registrations (
  id, public_reference, idempotency_key, source, program_id, child_first_name, child_last_name, date_of_birth,
  grade, skill_level, guardian_first_name, guardian_last_name, guardian_email, guardian_phone,
  emergency_name, emergency_relationship, emergency_phone, support_notes, needs_racket, parent_onsite,
  registration_status, payment_status, submitted_at
)
values (
  '60000000-0000-4000-8000-000000000001', 'RR-SAMPLE01', '60000000-0000-4000-8000-000000000099', 'staff',
  '30000000-0000-4000-8000-000000000001', 'Sample', 'Player', '2015-05-12', '5th Grade', 'beginner',
  'Sample', 'Guardian', 'sample.guardian@example.test', '919-555-0110', 'Sample Emergency Contact', 'Parent',
  '919-555-0111', '', true, false, 'confirmed', 'waived', '2026-09-08 12:00:00+00'
)
on conflict (id) do update set
  registration_status = excluded.registration_status, payment_status = excluded.payment_status, archived_at = null;

insert into public.registration_sessions (registration_id, session_id)
values
  ('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001'),
  ('60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002')
on conflict do nothing;

insert into public.consents (id, registration_id, type, version, accepted, responded_at)
values
  ('61000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', 'participation-waiver', '2026.1', true, '2026-09-08 12:00:00+00'),
  ('61000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 'photo-video', '2026.1', false, '2026-09-08 12:00:00+00'),
  ('61000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000001', 'program-acknowledgment', '2026.1', true, '2026-09-08 12:00:00+00'),
  ('61000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000001', 'pickup-policy', '2026.1', true, '2026-09-08 12:00:00+00')
on conflict (id) do update set accepted = excluded.accepted, responded_at = excluded.responded_at;

insert into public.attendance (id, registration_id, session_id, status)
values
  ('62000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'not-marked'),
  ('62000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002', 'not-marked')
on conflict (id) do update set status = excluded.status;

insert into public.payments (id, registration_id, amount_cents, status, note)
values ('63000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', 0, 'waived', 'Free community program')
on conflict (id) do update set status = excluded.status, note = excluded.note;

insert into public.organization_interactions (id, organization_id, occurred_on, kind, outcome, notes, next_action)
values
  ('70000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', '2026-09-05', 'email', 'Program overview shared', 'Sent the fall workshop overview.', 'Send schedule options'),
  ('70000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '2026-09-02', 'call', 'Interested in a workshop', 'School asked about beginner equipment.', 'Set the first planning call')
on conflict (id) do update set outcome = excluded.outcome, notes = excluded.notes, next_action = excluded.next_action;

insert into public.projects (id, name, status, priority, start_date, target_date, description, organization_id, program_id)
values
  ('80000000-0000-4000-8000-000000000001', 'Online Registration Launch', 'in-progress', 'high', '2026-09-08', '2026-10-01', 'Launch the public registration and staff operations workflow.', null, null),
  ('80000000-0000-4000-8000-000000000002', 'Fall Outreach', 'planning', 'medium', '2026-09-08', '2026-10-15', 'Coordinate fall partner outreach and materials.', '10000000-0000-4000-8000-000000000004', null)
on conflict (id) do update set name = excluded.name, status = excluded.status, priority = excluded.priority, target_date = excluded.target_date, description = excluded.description, archived_at = null;

insert into public.tasks (id, title, due_date, status, priority, project_id, program_id, organization_id, notes)
values
  ('81000000-0000-4000-8000-000000000001', 'Review registration copy', '2026-09-12', 'in-progress', 'high', '80000000-0000-4000-8000-000000000001', null, null, ''),
  ('81000000-0000-4000-8000-000000000002', 'Confirm Boys Club coaches', '2026-10-05', 'not-started', 'high', null, '30000000-0000-4000-8000-000000000001', null, ''),
  ('81000000-0000-4000-8000-000000000003', 'Send White Oak schedule options', '2026-09-15', 'awaiting-reply', 'medium', '80000000-0000-4000-8000-000000000002', null, '10000000-0000-4000-8000-000000000004', '')
on conflict (id) do update set status = excluded.status, due_date = excluded.due_date, notes = excluded.notes, archived_at = null;

insert into public.finance_entries (id, kind, program_id, project_id, date, description, category, amount_cents, paid_by, reimbursement_status)
values
  ('90000000-0000-4000-8000-000000000001', 'revenue', '30000000-0000-4000-8000-000000000001', null, '2026-08-18', 'Fall program sponsorship', 'Sponsorship', 50000, 'Local sponsor', 'not-applicable'),
  ('90000000-0000-4000-8000-000000000002', 'expense', '30000000-0000-4000-8000-000000000001', null, '2026-08-24', 'Shuttlecocks and grips', 'Equipment', 8600, 'Adithya', 'requested')
on conflict (id) do update set amount_cents = excluded.amount_cents, reimbursement_status = excluded.reimbursement_status, archived_at = null;

insert into public.activity_log (id, action, entity_type, entity_id, summary, metadata, created_at)
values
  ('a0000000-0000-4000-8000-000000000001', 'workspace.seeded', 'workspace', null, 'Rookie Rackets operations data was initialized.', '{}', '2026-09-08 12:00:00+00'),
  ('a0000000-0000-4000-8000-000000000002', 'organization.follow_up', 'organization', '10000000-0000-4000-8000-000000000004', 'White Oak follow-up is due.', '{}', '2026-09-08 12:05:00+00')
on conflict (id) do nothing;

begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('b0000000-0000-4000-8000-000000000001', 'yuanchengli612@gmail.com', '{"full_name":"Yuancheng Li"}'),
  ('b0000000-0000-4000-8000-000000000002', 'outsider@example.test', '{"full_name":"Outside User"}')
on conflict (id) do nothing;

select is(
  (select role from public.staff_profiles where id = 'b0000000-0000-4000-8000-000000000001'),
  'admin',
  'the bootstrap email receives the admin profile'
);

select is(
  (select count(*)::integer from public.staff_profiles where id = 'b0000000-0000-4000-8000-000000000002'),
  0,
  'an email outside the allowlist receives no staff profile'
);

set local role anon;
select lives_ok(
  $$ select id, slug, name from public.public_programs $$,
  'anonymous visitors can read public programs'
);
select ok(
  (select count(*) > 0 from public.public_program_sessions),
  'anonymous visitors can read scheduled public sessions'
);
select throws_ok(
  $$ select * from public.registrations $$,
  '42501',
  'permission denied for table registrations',
  'anonymous visitors cannot read private registrations'
);

select lives_ok(
  $$
    select public.submit_registration(
      '{
        "program_id":"30000000-0000-4000-8000-000000000001",
        "child_first_name":"Policy",
        "child_last_name":"Test",
        "date_of_birth":"2015-05-12",
        "grade":"5th Grade",
        "skill_level":"beginner",
        "guardian_first_name":"Sample",
        "guardian_last_name":"Guardian",
        "guardian_email":"sample@example.test",
        "guardian_phone":"919-555-0199",
        "emergency_name":"Sample Contact",
        "emergency_relationship":"Parent",
        "emergency_phone":"919-555-0111",
        "support_notes":"",
        "needs_racket":true,
        "parent_onsite":false,
        "selected_session_ids":["40000000-0000-4000-8000-000000000001"],
        "consents":{"participation_waiver":true,"photo_video":false,"program_acknowledgment":true,"pickup_policy":true}
      }'::jsonb,
      'b1000000-0000-4000-8000-000000000001'
    )
  $$,
  'anonymous visitors can submit through the constrained transaction'
);

select is(
  (select public.submit_registration(
      '{
        "program_id":"30000000-0000-4000-8000-000000000001",
        "child_first_name":"Policy",
        "child_last_name":"Test",
        "date_of_birth":"2015-05-12",
        "grade":"5th Grade",
        "skill_level":"beginner",
        "guardian_first_name":"Sample",
        "guardian_last_name":"Guardian",
        "guardian_email":"sample@example.test",
        "guardian_phone":"919-555-0199",
        "emergency_name":"Sample Contact",
        "emergency_relationship":"Parent",
        "emergency_phone":"919-555-0111",
        "support_notes":"",
        "needs_racket":true,
        "parent_onsite":false,
        "selected_session_ids":["40000000-0000-4000-8000-000000000001"],
        "consents":{"participation_waiver":true,"photo_video":false,"program_acknowledgment":true,"pickup_policy":true}
      }'::jsonb,
      'b1000000-0000-4000-8000-000000000001') ->> 'registrationId'),
  (select public.submit_registration(
      '{
        "program_id":"30000000-0000-4000-8000-000000000001",
        "child_first_name":"Policy",
        "child_last_name":"Test",
        "date_of_birth":"2015-05-12",
        "grade":"5th Grade",
        "skill_level":"beginner",
        "guardian_first_name":"Sample",
        "guardian_last_name":"Guardian",
        "guardian_email":"sample@example.test",
        "guardian_phone":"919-555-0199",
        "emergency_name":"Sample Contact",
        "emergency_relationship":"Parent",
        "emergency_phone":"919-555-0111",
        "support_notes":"",
        "needs_racket":true,
        "parent_onsite":false,
        "selected_session_ids":["40000000-0000-4000-8000-000000000001"],
        "consents":{"participation_waiver":true,"photo_video":false,"program_acknowledgment":true,"pickup_policy":true}
      }'::jsonb,
      'b1000000-0000-4000-8000-000000000001') ->> 'registrationId'),
  'repeating an idempotency key returns the original registration'
);

select throws_ok(
  $$
    select public.submit_registration(
      '{
        "program_id":"30000000-0000-4000-8000-000000000001",
        "child_first_name":"Wrong",
        "child_last_name":"Session",
        "date_of_birth":"2015-05-12",
        "grade":"5th Grade",
        "skill_level":"beginner",
        "guardian_first_name":"Sample",
        "guardian_last_name":"Guardian",
        "guardian_email":"sample@example.test",
        "guardian_phone":"919-555-0199",
        "emergency_name":"Sample Contact",
        "emergency_relationship":"Parent",
        "emergency_phone":"919-555-0111",
        "support_notes":"",
        "needs_racket":true,
        "parent_onsite":false,
        "selected_session_ids":["40000000-0000-4000-8000-000000000003"],
        "consents":{"participation_waiver":true,"photo_video":false,"program_acknowledgment":true,"pickup_policy":true}
      }'::jsonb,
      'b1000000-0000-4000-8000-000000000002'
    )
  $$,
  '22023',
  'INVALID_SESSION_SELECTION',
  'the database rejects sessions belonging to another program'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;

select ok(private.is_active_staff(), 'the allowlisted account is active staff');
select ok(private.is_admin(), 'the bootstrap account is an administrator');
select lives_ok($$ select * from public.registrations $$, 'active staff can read registrations');
select lives_ok(
  $$ update public.programs set description = description where id = '30000000-0000-4000-8000-000000000001' $$,
  'active staff can update operational records'
);
select lives_ok(
  $$ insert into public.staff_allowlist (email, role) values ('new.staff@example.test', 'staff') $$,
  'administrators can manage the staff allowlist'
);

reset role;
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*)::integer from public.registrations), 0, 'an authenticated outsider sees no private rows');

select * from finish();
rollback;

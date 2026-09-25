-- Keep canceled placeholder IDs and their linked registrations intact so
-- staff can follow up with affected families.
update public.program_sessions
set status = 'canceled', notes = 'Superseded placeholder date; review linked registrations before contacting families.'
where id in (
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '40000000-0000-4000-8000-000000000003',
  '40000000-0000-4000-8000-000000000004'
);

update public.programs
set status = 'active',
    description = 'Four Friday beginner workshops delivered exclusively for Raleigh Boys Club participants.'
where slug = 'boys-club-fall';

update public.programs
set status = 'active',
    description = 'Four Friday school workshops that move from racket basics to cooperative games.'
where slug = 'tmsa-fall';

-- September 4 was canceled by the Boys Club. October 23 was omitted from the
-- TMSA public schedule at the site owner's request.
insert into public.program_sessions
  (id, program_id, date, start_time, end_time, arrival_time, location, status, notes)
values
  ('40000000-0000-4000-8000-000000000005', (select id from public.programs where slug = 'boys-club-fall'), '2026-08-28', '17:00', '18:00', '16:40', 'Raleigh Boys Club', 'completed', ''),
  ('40000000-0000-4000-8000-000000000006', (select id from public.programs where slug = 'boys-club-fall'), '2026-09-11', '17:00', '18:00', '16:40', 'Raleigh Boys Club', 'completed', ''),
  ('40000000-0000-4000-8000-000000000007', (select id from public.programs where slug = 'boys-club-fall'), '2026-09-18', '17:00', '18:00', '16:40', 'Raleigh Boys Club', 'completed', ''),
  ('40000000-0000-4000-8000-000000000008', (select id from public.programs where slug = 'boys-club-fall'), '2026-09-25', '17:00', '18:00', '16:40', 'Raleigh Boys Club', 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000009', (select id from public.programs where slug = 'tmsa-fall'), '2026-10-02', '15:45', '16:45', '15:25', 'TMSA Elementary', 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000010', (select id from public.programs where slug = 'tmsa-fall'), '2026-10-09', '15:45', '16:45', '15:25', 'TMSA Elementary', 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000011', (select id from public.programs where slug = 'tmsa-fall'), '2026-11-06', '15:45', '16:45', '15:25', 'TMSA Elementary', 'scheduled', ''),
  ('40000000-0000-4000-8000-000000000012', (select id from public.programs where slug = 'tmsa-fall'), '2026-11-13', '15:45', '16:45', '15:25', 'TMSA Elementary', 'scheduled', '')
on conflict (id) do update set
  date = excluded.date, start_time = excluded.start_time, end_time = excluded.end_time,
  arrival_time = excluded.arrival_time, location = excluded.location,
  status = excluded.status, notes = excluded.notes;

create or replace view public.public_program_sessions
with (security_barrier = true)
as
select s.id, s.program_id, s.date, s.start_time, s.end_time, s.location, s.status
from public.program_sessions s
join public.programs p on p.id = s.program_id
where p.visibility = 'public' and p.archived_at is null
  and p.status not in ('draft', 'archived') and s.status in ('scheduled', 'completed');

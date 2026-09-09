create schema if not exists extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.staff_allowlist (
  email extensions.citext primary key,
  role text not null check (role in ('admin', 'staff')),
  active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email extensions.citext not null unique,
  name text not null default '' check (char_length(name) <= 160),
  initials text not null default '' check (char_length(initials) <= 8),
  role text not null check (role in ('admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_settings (
  id boolean primary key default true check (id),
  organization_name text not null default 'Rookie Rackets' check (char_length(organization_name) between 1 and 160),
  contact_email extensions.citext not null default 'teamrookierackets@gmail.com',
  participation_waiver_version text not null default '2026.1' check (char_length(participation_waiver_version) between 1 and 40),
  photo_video_version text not null default '2026.1' check (char_length(photo_video_version) between 1 and 40),
  program_acknowledgment_version text not null default '2026.1' check (char_length(program_acknowledgment_version) between 1 and 40),
  pickup_policy_version text not null default '2026.1' check (char_length(pickup_policy_version) between 1 and 40),
  confirmation_copy text not null default 'We received your registration. The Rookie Rackets team will contact you if anything else is needed.' check (char_length(confirmation_copy) between 1 and 1000),
  updated_by uuid references public.staff_profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create function private.handle_new_staff_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  approved public.staff_allowlist%rowtype;
  display_name text;
begin
  select * into approved
  from public.staff_allowlist
  where email = lower(new.email) and active = true;

  if not found then
    return new;
  end if;

  display_name := trim(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  insert into public.staff_profiles (id, email, name, initials, role, active)
  values (
    new.id,
    lower(new.email),
    display_name,
    upper(left(display_name, 2)),
    approved.role,
    true
  )
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role,
      active = true,
      updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute function private.handle_new_staff_user();

create function private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.staff_profiles
    where id = auth.uid() and active = true
  );
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.staff_profiles
    where id = auth.uid() and active = true and role = 'admin'
  );
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  type text not null check (type in ('school', 'nonprofit', 'sports-facility', 'community-center', 'college', 'sponsor', 'government', 'other')),
  website text not null default '' check (char_length(website) <= 500),
  address text not null default '' check (char_length(address) <= 500),
  lead_staff_id uuid references public.staff_profiles(id) on delete set null,
  primary_contact text not null default '' check (char_length(primary_contact) <= 160),
  primary_contact_email extensions.citext,
  status text not null check (status in ('researching', 'not-contacted', 'contacted', 'follow-up-due', 'meeting-scheduled', 'interested', 'planning', 'active-partner', 'paused', 'declined', 'dormant')),
  last_update text not null default '' check (char_length(last_update) <= 1000),
  next_step text not null default '' check (char_length(next_step) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.organization_support_staff (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  primary key (organization_id, staff_id)
);

create table public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  email extensions.citext not null,
  role text not null check (role in ('program-lead', 'coach', 'assistant', 'volunteer')),
  active boolean not null default true,
  experience text not null default '' check (char_length(experience) <= 2000),
  availability text not null default 'informational' check (availability in ('available', 'tentative', 'unavailable', 'informational')),
  volunteer_minutes integer not null default 0 check (volunteer_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 200),
  organization_id uuid references public.organizations(id) on delete set null,
  type text not null check (type in ('one-day-workshop', 'multiweek-school-program', 'camp', 'recurring-partner-program', 'community-event', 'tournament', 'clinic')),
  description text not null default '' check (char_length(description) <= 5000),
  venue text not null default '' check (char_length(venue) <= 500),
  skill_level text not null default 'mixed' check (skill_level in ('beginner', 'intermediate', 'mixed', 'advanced')),
  eligibility text not null default '' check (char_length(eligibility) <= 500),
  capacity integer not null check (capacity between 1 and 10000),
  lead_coach_id uuid references public.coaches(id) on delete set null,
  status text not null check (status in ('draft', 'planning', 'registration-open', 'full', 'active', 'completed', 'canceled', 'archived')),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  price_cents integer not null default 0 check (price_cents >= 0),
  registration_deadline date not null,
  what_to_bring text[] not null default '{}',
  equipment_provided boolean not null default true,
  image text not null default '' check (char_length(image) <= 1000),
  contact text not null default '' check (char_length(contact) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  date date not null,
  start_time time not null,
  end_time time not null,
  arrival_time time not null,
  location text not null check (char_length(location) between 1 and 500),
  lead_coach_id uuid references public.coaches(id) on delete set null,
  curriculum jsonb not null default '{"objective":"","activities":[],"coachNotes":"","updatedAt":null}'::jsonb,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'canceled')),
  notes text not null default '' check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.session_coaches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.program_sessions(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete restrict,
  slot text not null check (slot in ('lead', 'coach-2', 'coach-3', 'coach-4', 'backup')),
  accepted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, slot),
  unique (session_id, coach_id)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique check (public_reference ~ '^RR-[A-Z0-9]{8}$'),
  idempotency_key uuid not null unique,
  source text not null check (source in ('online', 'staff')),
  program_id uuid not null references public.programs(id) on delete restrict,
  child_first_name text not null check (char_length(child_first_name) between 1 and 80),
  child_last_name text not null check (char_length(child_last_name) between 1 and 80),
  date_of_birth date not null,
  grade text not null check (char_length(grade) between 1 and 40),
  skill_level text not null check (char_length(skill_level) between 1 and 40),
  guardian_first_name text not null check (char_length(guardian_first_name) between 1 and 80),
  guardian_last_name text not null check (char_length(guardian_last_name) between 1 and 80),
  guardian_email extensions.citext not null,
  guardian_phone text not null check (char_length(guardian_phone) between 7 and 32),
  emergency_name text not null check (char_length(emergency_name) between 1 and 160),
  emergency_relationship text not null check (char_length(emergency_relationship) between 1 and 80),
  emergency_phone text not null check (char_length(emergency_phone) between 7 and 32),
  support_notes text not null default '' check (char_length(support_notes) <= 2000),
  internal_notes text not null default '' check (char_length(internal_notes) <= 5000),
  needs_racket boolean not null default false,
  parent_onsite boolean not null default false,
  registration_status text not null check (registration_status in ('incomplete', 'confirmed', 'waitlisted', 'offer-sent', 'canceled', 'completed', 'refunded', 'archived')),
  payment_status text not null check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial-refund', 'waived')),
  submitted_at timestamptz not null default now(),
  created_by uuid references public.staff_profiles(id) on delete set null,
  updated_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.registration_sessions (
  registration_id uuid not null references public.registrations(id) on delete cascade,
  session_id uuid not null references public.program_sessions(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (registration_id, session_id)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  type text not null check (type in ('participation-waiver', 'photo-video', 'program-acknowledgment', 'pickup-policy')),
  version text not null check (char_length(version) between 1 and 40),
  accepted boolean not null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, type)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  session_id uuid not null references public.program_sessions(id) on delete restrict,
  status text not null default 'not-marked' check (status in ('not-marked', 'present', 'late', 'absent', 'parent-reported-absence', 'canceled', 'walk-in')),
  note text not null default '' check (char_length(note) <= 2000),
  recorded_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, session_id)
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (char_length(storage_path) between 1 and 1000),
  name text not null check (char_length(name) between 1 and 255),
  media_type text not null check (char_length(media_type) between 1 and 160),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  category text not null check (category in ('document', 'receipt', 'curriculum', 'notes')),
  uploaded_by uuid references public.staff_profiles(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  project_id uuid,
  registration_id uuid references public.registrations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null check (status in ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial-refund', 'waived')),
  received_at timestamptz,
  method text not null default '' check (char_length(method) <= 80),
  note text not null default '' check (char_length(note) <= 2000),
  external_reference text not null default '' check (char_length(external_reference) <= 160),
  receipt_file_id uuid references public.files(id) on delete set null,
  created_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  occurred_on date not null,
  owner_id uuid references public.staff_profiles(id) on delete set null,
  kind text not null check (kind in ('email', 'call', 'visit', 'meeting')),
  outcome text not null check (char_length(outcome) between 1 and 1000),
  notes text not null default '' check (char_length(notes) <= 5000),
  next_action text not null default '' check (char_length(next_action) <= 1000),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  owner_id uuid references public.staff_profiles(id) on delete set null,
  status text not null check (status in ('planning', 'in-progress', 'blocked', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  start_date date not null,
  target_date date not null,
  description text not null default '' check (char_length(description) <= 5000),
  organization_id uuid references public.organizations(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (target_date >= start_date)
);

alter table public.files
add constraint files_project_id_fkey foreign key (project_id) references public.projects(id) on delete set null;

create table public.project_contributors (
  project_id uuid not null references public.projects(id) on delete cascade,
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  primary key (project_id, staff_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 300),
  owner_id uuid references public.staff_profiles(id) on delete set null,
  due_date date not null,
  status text not null check (status in ('not-started', 'in-progress', 'awaiting-reply', 'blocked', 'done', 'canceled')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  project_id uuid references public.projects(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  notes text not null default '' check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('revenue', 'expense')),
  program_id uuid references public.programs(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  date date not null,
  description text not null check (char_length(description) between 1 and 500),
  category text not null check (char_length(category) between 1 and 160),
  amount_cents integer not null check (amount_cents > 0),
  paid_by text not null check (char_length(paid_by) between 1 and 200),
  receipt_file_id uuid references public.files(id) on delete set null,
  reimbursement_status text not null default 'not-applicable' check (reimbursement_status in ('not-applicable', 'requested', 'approved', 'paid')),
  created_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.staff_profiles(id) on delete set null,
  action text not null check (char_length(action) between 1 and 100),
  entity_type text not null check (char_length(entity_type) between 1 and 100),
  entity_id uuid,
  summary text not null check (char_length(summary) between 1 and 500),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

insert into public.staff_allowlist (email, role)
values ('yuanchengli612@gmail.com', 'admin')
on conflict (email) do update set role = excluded.role, active = true, updated_at = now();

insert into public.workspace_settings (id) values (true) on conflict (id) do nothing;

create index programs_public_idx on public.programs (visibility, status, registration_deadline) where archived_at is null;
create index program_sessions_upcoming_idx on public.program_sessions (program_id, date, start_time) where status = 'scheduled';
create index registrations_inbox_idx on public.registrations (submitted_at desc) where archived_at is null;
create index registrations_program_status_idx on public.registrations (program_id, registration_status) where archived_at is null;
create index registrations_guardian_email_idx on public.registrations (guardian_email);
create index attendance_session_idx on public.attendance (session_id, status);
create index organizations_pipeline_idx on public.organizations (status, lead_staff_id) where archived_at is null;
create index tasks_due_idx on public.tasks (status, due_date) where archived_at is null;
create index finance_date_idx on public.finance_entries (date desc) where archived_at is null;
create index activity_recent_idx on public.activity_log (created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'staff_allowlist', 'staff_profiles', 'organizations', 'coaches', 'programs', 'program_sessions',
    'session_coaches', 'registrations', 'consents', 'attendance', 'payments', 'projects', 'tasks', 'finance_entries'
  ] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create view public.public_programs
with (security_barrier = true)
as
select id, slug, name, type, description, venue, skill_level, eligibility, capacity, status,
       price_cents, registration_deadline, what_to_bring, equipment_provided, image, contact
from public.programs
where visibility = 'public' and archived_at is null and status not in ('draft', 'archived');

create view public.public_program_sessions
with (security_barrier = true)
as
select s.id, s.program_id, s.date, s.start_time, s.end_time, s.location, s.status
from public.program_sessions s
join public.programs p on p.id = s.program_id
where p.visibility = 'public' and p.archived_at is null and p.status not in ('draft', 'archived') and s.status = 'scheduled';

create function private.make_public_reference()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  candidate text;
begin
  loop
    candidate := 'RR-' || upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 8));
    exit when not exists (select 1 from public.registrations where public_reference = candidate);
  end loop;
  return candidate;
end;
$$;

create function public.submit_registration(payload jsonb, idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing public.registrations%rowtype;
  selected_program public.programs%rowtype;
  new_registration public.registrations%rowtype;
  selected_ids uuid[];
  selected_count integer;
  confirmed_count integer;
  next_status text;
  next_payment text;
  settings public.workspace_settings%rowtype;
begin
  select * into existing from public.registrations where registrations.idempotency_key = submit_registration.idempotency_key;
  if found then
    return jsonb_build_object(
      'registrationId', existing.id,
      'publicReference', existing.public_reference,
      'registrationStatus', existing.registration_status,
      'paymentStatus', existing.payment_status
    );
  end if;

  begin
    select array_agg(value::uuid order by value::text)
    into selected_ids
    from jsonb_array_elements_text(payload -> 'selected_session_ids') value;
  exception when others then
    raise exception using errcode = '22023', message = 'INVALID_SESSION_IDS';
  end;

  if selected_ids is null or cardinality(selected_ids) = 0 or cardinality(selected_ids) > 40 then
    raise exception using errcode = '22023', message = 'INVALID_SESSION_IDS';
  end if;

  select * into selected_program
  from public.programs
  where id = (payload ->> 'program_id')::uuid
  for update;

  if not found then raise exception using errcode = 'P0002', message = 'PROGRAM_NOT_FOUND'; end if;
  if selected_program.archived_at is not null or selected_program.visibility <> 'public' or selected_program.status not in ('registration-open', 'active', 'full') then
    raise exception using errcode = 'P0001', message = 'REGISTRATION_CLOSED';
  end if;
  if selected_program.registration_deadline < current_date then
    raise exception using errcode = 'P0001', message = 'REGISTRATION_CLOSED';
  end if;

  select count(*) into selected_count
  from public.program_sessions
  where id = any(selected_ids) and program_id = selected_program.id and status = 'scheduled' and date >= current_date;

  if selected_count <> cardinality(selected_ids) then
    raise exception using errcode = '22023', message = 'INVALID_SESSION_SELECTION';
  end if;

  select count(*) into confirmed_count
  from public.registrations
  where program_id = selected_program.id
    and archived_at is null
    and registration_status in ('confirmed', 'offer-sent');

  next_status := case when confirmed_count >= selected_program.capacity or selected_program.status = 'full' then 'waitlisted' else 'confirmed' end;
  next_payment := case when selected_program.price_cents = 0 then 'waived' else 'unpaid' end;
  select * into settings from public.workspace_settings where id = true;

  insert into public.registrations (
    public_reference, idempotency_key, source, program_id, child_first_name, child_last_name,
    date_of_birth, grade, skill_level, guardian_first_name, guardian_last_name, guardian_email,
    guardian_phone, emergency_name, emergency_relationship, emergency_phone, support_notes,
    needs_racket, parent_onsite, registration_status, payment_status
  ) values (
    private.make_public_reference(), idempotency_key, 'online', selected_program.id,
    trim(payload ->> 'child_first_name'), trim(payload ->> 'child_last_name'), (payload ->> 'date_of_birth')::date,
    trim(payload ->> 'grade'), trim(payload ->> 'skill_level'), trim(payload ->> 'guardian_first_name'),
    trim(payload ->> 'guardian_last_name'), lower(trim(payload ->> 'guardian_email')),
    trim(payload ->> 'guardian_phone'), trim(payload ->> 'emergency_name'),
    trim(payload ->> 'emergency_relationship'), trim(payload ->> 'emergency_phone'),
    trim(coalesce(payload ->> 'support_notes', '')), coalesce((payload ->> 'needs_racket')::boolean, false),
    coalesce((payload ->> 'parent_onsite')::boolean, false), next_status, next_payment
  ) returning * into new_registration;

  insert into public.registration_sessions (registration_id, session_id)
  select new_registration.id, unnest(selected_ids);

  insert into public.attendance (registration_id, session_id)
  select new_registration.id, unnest(selected_ids);

  insert into public.consents (registration_id, type, version, accepted, responded_at)
  values
    (new_registration.id, 'participation-waiver', settings.participation_waiver_version, true, now()),
    (new_registration.id, 'photo-video', settings.photo_video_version, coalesce((payload #>> '{consents,photo_video}')::boolean, false), now()),
    (new_registration.id, 'program-acknowledgment', settings.program_acknowledgment_version, true, now()),
    (new_registration.id, 'pickup-policy', settings.pickup_policy_version, true, now());

  insert into public.payments (registration_id, amount_cents, status, note)
  values (
    new_registration.id,
    selected_program.price_cents,
    next_payment,
    case when next_payment = 'waived' then 'Free Rookie Rackets program' else 'Payment is recorded manually by staff after receipt.' end
  );

  insert into public.activity_log (action, entity_type, entity_id, summary, metadata)
  values (
    'registration.submitted', 'registration', new_registration.id,
    'Online registration ' || new_registration.public_reference || ' was submitted for ' || selected_program.name || '.',
    jsonb_build_object('source', 'online', 'program_id', selected_program.id)
  );

  return jsonb_build_object(
    'registrationId', new_registration.id,
    'publicReference', new_registration.public_reference,
    'registrationStatus', new_registration.registration_status,
    'paymentStatus', new_registration.payment_status
  );
exception
  when unique_violation then
    select * into existing from public.registrations where registrations.idempotency_key = submit_registration.idempotency_key;
    if found then
      return jsonb_build_object(
        'registrationId', existing.id,
        'publicReference', existing.public_reference,
        'registrationStatus', existing.registration_status,
        'paymentStatus', existing.payment_status
      );
    end if;
    raise;
end;
$$;

create function public.log_activity(p_action text, p_entity_type text, p_entity_id uuid, p_summary text, p_metadata jsonb default '{}')
returns public.activity_log
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare result public.activity_log;
begin
  if not private.is_active_staff() then raise exception using errcode = '42501', message = 'STAFF_REQUIRED'; end if;
  insert into public.activity_log (actor_id, action, entity_type, entity_id, summary, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, left(p_summary, 500), coalesce(p_metadata, '{}'))
  returning * into result;
  return result;
end;
$$;

alter table public.staff_allowlist enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_support_staff enable row level security;
alter table public.coaches enable row level security;
alter table public.programs enable row level security;
alter table public.program_sessions enable row level security;
alter table public.session_coaches enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_sessions enable row level security;
alter table public.consents enable row level security;
alter table public.attendance enable row level security;
alter table public.payments enable row level security;
alter table public.organization_interactions enable row level security;
alter table public.projects enable row level security;
alter table public.project_contributors enable row level security;
alter table public.tasks enable row level security;
alter table public.finance_entries enable row level security;
alter table public.files enable row level security;
alter table public.activity_log enable row level security;

create policy staff_allowlist_admin_select on public.staff_allowlist for select to authenticated using (private.is_admin());
create policy staff_allowlist_admin_insert on public.staff_allowlist for insert to authenticated with check (private.is_admin());
create policy staff_allowlist_admin_update on public.staff_allowlist for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy staff_allowlist_admin_delete on public.staff_allowlist for delete to authenticated using (private.is_admin());

create policy staff_profiles_staff_select on public.staff_profiles for select to authenticated using (private.is_active_staff());
create policy staff_profiles_admin_update on public.staff_profiles for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy workspace_staff_select on public.workspace_settings for select to authenticated using (private.is_active_staff());
create policy workspace_admin_update on public.workspace_settings for update to authenticated using (private.is_admin()) with check (private.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations', 'organization_support_staff', 'coaches', 'programs', 'program_sessions',
    'session_coaches', 'registrations', 'registration_sessions', 'consents', 'attendance', 'payments',
    'organization_interactions', 'projects', 'project_contributors', 'tasks', 'finance_entries', 'files'
  ] loop
    execute format('create policy %I_staff_select on public.%I for select to authenticated using (private.is_active_staff())', table_name, table_name);
    execute format('create policy %I_staff_insert on public.%I for insert to authenticated with check (private.is_active_staff())', table_name, table_name);
    execute format('create policy %I_staff_update on public.%I for update to authenticated using (private.is_active_staff()) with check (private.is_active_staff())', table_name, table_name);
    execute format('create policy %I_staff_delete on public.%I for delete to authenticated using (private.is_active_staff())', table_name, table_name);
  end loop;
end;
$$;

create policy activity_staff_select on public.activity_log for select to authenticated using (private.is_active_staff());
create policy activity_staff_insert on public.activity_log for insert to authenticated with check (private.is_active_staff() and actor_id = auth.uid());

revoke all on all tables in schema public from anon;
grant usage on schema public to anon, authenticated;
grant select on public.public_programs, public.public_program_sessions to anon, authenticated;
grant execute on function public.submit_registration(jsonb, uuid) to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.log_activity(text, text, uuid, text, jsonb) to authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_active_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;

create policy operations_files_staff_select
on storage.objects for select to authenticated
using (bucket_id = 'operations-private' and private.is_active_staff());

create policy operations_files_staff_insert
on storage.objects for insert to authenticated
with check (bucket_id = 'operations-private' and private.is_active_staff());

create policy operations_files_staff_update
on storage.objects for update to authenticated
using (bucket_id = 'operations-private' and private.is_active_staff())
with check (bucket_id = 'operations-private' and private.is_active_staff());

create policy operations_files_staff_delete
on storage.objects for delete to authenticated
using (bucket_id = 'operations-private' and private.is_active_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'operations-private',
  'operations-private',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'text/csv']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy operations_private_staff_select on storage.objects
for select to authenticated using (bucket_id = 'operations-private' and private.is_active_staff());
create policy operations_private_staff_insert on storage.objects
for insert to authenticated with check (bucket_id = 'operations-private' and private.is_active_staff());
create policy operations_private_staff_update on storage.objects
for update to authenticated using (bucket_id = 'operations-private' and private.is_active_staff())
with check (bucket_id = 'operations-private' and private.is_active_staff());
create policy operations_private_staff_delete on storage.objects
for delete to authenticated using (bucket_id = 'operations-private' and private.is_active_staff());

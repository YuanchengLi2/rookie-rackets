create table public.interest_signups (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique check (public_reference ~ '^RI-[A-Z0-9]{8}$'),
  idempotency_key uuid not null unique,
  parent_name text not null check (char_length(parent_name) between 1 and 160),
  phone text not null check (char_length(phone) between 7 and 32),
  email extensions.citext not null,
  child_name text not null check (char_length(child_name) between 1 and 160),
  grade text not null check (char_length(grade) between 1 and 40),
  school text not null check (char_length(school) between 1 and 160),
  workshop text not null check (char_length(workshop) between 1 and 120),
  referral text not null check (char_length(referral) between 1 and 160),
  comments text not null default '' check (char_length(comments) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'archived')),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create trigger interest_signups_set_updated_at
before update on public.interest_signups
for each row execute function private.set_updated_at();

create function private.make_interest_reference()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare candidate text;
begin
  loop
    candidate := 'RI-' || upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 8));
    exit when not exists (select 1 from public.interest_signups where public_reference = candidate);
  end loop;
  return candidate;
end;
$$;

create function public.submit_interest_signup(payload jsonb, idempotency_key uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing public.interest_signups%rowtype;
  created public.interest_signups%rowtype;
begin
  select * into existing
  from public.interest_signups
  where interest_signups.idempotency_key = submit_interest_signup.idempotency_key;

  if found then
    return jsonb_build_object('interestId', existing.id, 'publicReference', existing.public_reference);
  end if;

  insert into public.interest_signups (
    public_reference, idempotency_key, parent_name, phone, email, child_name,
    grade, school, workshop, referral, comments
  ) values (
    private.make_interest_reference(), idempotency_key,
    trim(payload ->> 'parent_name'), trim(payload ->> 'phone'), lower(trim(payload ->> 'email')),
    trim(payload ->> 'child_name'), trim(payload ->> 'grade'), trim(payload ->> 'school'),
    trim(payload ->> 'workshop'), trim(payload ->> 'referral'), trim(coalesce(payload ->> 'comments', ''))
  ) returning * into created;

  insert into public.activity_log (action, entity_type, entity_id, summary, metadata)
  values (
    'interest.submitted', 'interest_signup', created.id,
    'Website interest signup ' || created.public_reference || ' was submitted for ' || created.child_name || '.',
    jsonb_build_object('source', 'website', 'workshop', created.workshop)
  );

  return jsonb_build_object('interestId', created.id, 'publicReference', created.public_reference);
exception
  when unique_violation then
    select * into existing
    from public.interest_signups
    where interest_signups.idempotency_key = submit_interest_signup.idempotency_key;
    if found then
      return jsonb_build_object('interestId', existing.id, 'publicReference', existing.public_reference);
    end if;
    raise;
end;
$$;

alter table public.interest_signups enable row level security;
create policy interest_signups_staff_select on public.interest_signups for select to authenticated using (private.is_active_staff());
create policy interest_signups_staff_update on public.interest_signups for update to authenticated using (private.is_active_staff()) with check (private.is_active_staff());
create policy interest_signups_staff_delete on public.interest_signups for delete to authenticated using (private.is_active_staff());

revoke all on public.interest_signups from anon;
grant select, update, delete on public.interest_signups to authenticated;
grant all privileges on public.interest_signups to service_role;
revoke execute on function public.submit_interest_signup(jsonb, uuid) from public;
grant execute on function public.submit_interest_signup(jsonb, uuid) to anon, authenticated, service_role;
revoke execute on function private.make_interest_reference() from public, anon, authenticated;
grant execute on function private.make_interest_reference() to service_role;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'staff_profiles', 'workspace_settings', 'organizations', 'organization_support_staff', 'coaches',
    'programs', 'program_sessions', 'session_coaches', 'registrations', 'registration_sessions',
    'consents', 'attendance', 'payments', 'organization_interactions', 'projects', 'project_contributors',
    'tasks', 'finance_entries', 'files', 'activity_log', 'interest_signups'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;

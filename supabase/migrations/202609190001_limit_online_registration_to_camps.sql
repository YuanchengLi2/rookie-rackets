create or replace function private.enforce_online_registration_program_type()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_type text;
begin
  if new.source = 'online' then
    select type into selected_type
    from public.programs
    where id = new.program_id;

    if selected_type is distinct from 'camp' then
      raise exception using
        errcode = 'P0001',
        message = 'PROGRAM_NOT_PUBLICLY_REGISTERABLE';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_online_registration_program_type on public.registrations;
create trigger enforce_online_registration_program_type
before insert or update of source, program_id on public.registrations
for each row execute function private.enforce_online_registration_program_type();

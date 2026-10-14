update public.organizations
set name = 'Raleigh Boys Club',
    website = 'https://wakejohnstonbgc.org/raleigh-boys-club/'
where id = '10000000-0000-4000-8000-000000000001'
   or lower(name) in ('boys club raleigh', 'boys club of raleigh', 'raleigh boys club');

update public.programs
set name = 'Raleigh Boys Club Workshops',
    description = 'A recurring beginner workshop delivered exclusively for Raleigh Boys Club participants.',
    venue = 'Raleigh Boys Club',
    eligibility = 'Raleigh Boys Club participants in grades 3–6',
    what_to_bring = array['Athletic non-marking shoes', 'Water bottle'],
    image = '/images/raleigh-boys-club.webp',
    contact = 'Rookie Rackets team · teamrookierackets@gmail.com'
where slug = 'boys-club-fall';

update public.programs
set what_to_bring = array_replace(what_to_bring, 'Athletic shoes', 'Athletic non-marking shoes')
where visibility = 'public'
  and archived_at is null
  and 'Athletic shoes' = any(what_to_bring);

create or replace view public.public_programs
with (security_barrier = true)
as
select p.id, p.slug, p.name, p.type, p.description, p.venue, p.skill_level, p.eligibility,
       p.capacity, p.status, p.price_cents, p.registration_deadline, p.what_to_bring,
       p.equipment_provided, p.image, p.contact, p.organization_id,
       o.name as organization_name, o.website as organization_website
from public.programs p
left join public.organizations o on o.id = p.organization_id and o.archived_at is null
where p.visibility = 'public'
  and p.archived_at is null
  and p.status not in ('draft', 'archived');

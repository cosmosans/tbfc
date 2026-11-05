create table public.locations (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  address text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.matches
  add column location_id text references public.locations(id),
  add column pitch text check (pitch in ('1', '2', '3'));

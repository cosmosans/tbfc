create table public.standings_snapshots (
  season_id text primary key references public.seasons(id) on delete cascade,
  updated_on date not null,
  rows jsonb not null check (jsonb_typeof(rows) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.standings_snapshots enable row level security;
create policy "Members view standings" on public.standings_snapshots for select to authenticated using (public.can_view_club());
create policy "Editors manage standings" on public.standings_snapshots for all to authenticated
  using (public.can_edit_club()) with check (public.can_edit_club());

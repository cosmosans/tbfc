-- Run with the Supabase CLI after creating a project. The source CSV remains
-- immutable in the repository; its rows are imported only after review.
create extension if not exists pgcrypto;

create table public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

create table public.players (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  shirt_number text,
  active boolean not null default true,
  photo_url text,
  preferred_position text check (preferred_position in ('ST', 'CAM', 'CDM', 'LW', 'LB', 'RW', 'RB', 'GK')),
  secondary_position text check (secondary_position in ('ST', 'CAM', 'CDM', 'LW', 'LB', 'RW', 'RB', 'GK')),
  constraint distinct_player_positions check (secondary_position is null or preferred_position is null or secondary_position <> preferred_position),
  created_at timestamptz not null default now()
);

create table public.opponents (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  crest_url text not null default '',
  color text not null default '' check (color = '' or color ~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$'),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.seasons (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  notes text not null default '',
  starts_on date,
  created_at timestamptz not null default now()
);

create table public.matches (
  id text primary key default gen_random_uuid()::text,
  status text not null default 'completed' check (status in ('scheduled', 'completed')),
  opponent_id text references public.opponents(id),
  season_id text references public.seasons(id),
  season text not null,
  competition text not null default '',
  match_date date not null,
  opponent text not null,
  venue text not null default '',
  kickoff_local text not null default '',
  home_away text check (home_away in ('home', 'away')),
  goals_for integer not null default 0 check (goals_for >= 0),
  goals_against integer not null default 0 check (goals_against >= 0),
  shootout_for integer check (shootout_for >= 0),
  shootout_against integer check (shootout_against >= 0),
  constraint shootout_pair check ((shootout_for is null) = (shootout_against is null)),
  kit text not null default '',
  scorer_notes text not null default '',
  report text not null default '',
  source_row integer unique,
  source_score text,
  source_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.match_events (
  id text primary key default gen_random_uuid()::text,
  match_id text not null references public.matches(id) on delete cascade,
  player_id text references public.players(id) on delete set null,
  kind text not null check (kind in ('goal', 'assist', 'yellow_card', 'penalty_save', 'note')),
  minute integer check (minute >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table public.lineups (
  match_id text primary key references public.matches(id) on delete cascade,
  formation text not null default '1-2-3-1' check (formation in ('1-2-3-1', '1-3-3')),
  starter_ids text[] not null default '{}',
  bench_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.boards (
  match_id text primary key references public.matches(id) on delete cascade,
  markers jsonb not null default '[]'::jsonb,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create index matches_date_idx on public.matches(match_date desc);
create index matches_season_idx on public.matches(season);
create index matches_season_id_idx on public.matches(season_id);
create index matches_opponent_idx on public.matches(opponent_id);
create index events_match_idx on public.match_events(match_id);
create index events_player_idx on public.match_events(player_id);

-- Match scores and shootout scores determine W/D/L. Historical scorer notes do not become
-- invented match events. This view is safe from hand-maintained totals.
create view public.match_results with (security_invoker = true) as
select m.*,
  case when status = 'scheduled' then null
       when goals_for > goals_against then 'W'
       when goals_for < goals_against then 'L'
       when shootout_for > shootout_against then 'W'
       when shootout_for < shootout_against then 'L'
       else 'D' end as calculated_result
from public.matches m;

create view public.season_totals with (security_invoker = true) as
select s.id, s.name, count(m.id) as played,
  count(m.id) filter (where m.calculated_result = 'W') as wins,
  count(m.id) filter (where m.calculated_result = 'D') as draws,
  count(m.id) filter (where m.calculated_result = 'L') as losses,
  coalesce(sum(m.goals_for), 0) as goals_for,
  coalesce(sum(m.goals_against), 0) as goals_against
from public.seasons s left join public.match_results m on m.season_id = s.id and m.status = 'completed'
group by s.id, s.name;

create view public.player_event_totals with (security_invoker = true) as
select p.id, p.name, p.shirt_number,
  count(e.id) filter (where e.kind = 'goal') as recorded_goals,
  count(e.id) filter (where e.kind = 'assist') as recorded_assists,
  count(e.id) filter (where e.kind = 'yellow_card') as recorded_yellow_cards,
  count(e.id) filter (where e.kind = 'penalty_save') as recorded_penalty_saves
from public.players p left join public.match_events e on e.player_id = p.id
group by p.id, p.name, p.shirt_number;

create view public.opponent_totals with (security_invoker = true) as
select o.id, o.name, o.crest_url,
  count(m.id) as played,
  count(m.id) filter (where m.calculated_result = 'W') as tbfc_wins,
  count(m.id) filter (where m.calculated_result = 'D') as draws,
  count(m.id) filter (where m.calculated_result = 'L') as tbfc_losses,
  coalesce(sum(m.goals_for), 0) as tbfc_goals,
  coalesce(sum(m.goals_against), 0) as opponent_goals
from public.opponents o left join public.match_results m on m.opponent_id = o.id and m.status = 'completed'
group by o.id, o.name, o.crest_url;

create function public.can_edit_club() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships where user_id = auth.uid() and role in ('admin', 'editor'));
$$;

create function public.can_view_club() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships where user_id = auth.uid());
$$;

create function public.is_club_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships where user_id = auth.uid() and role = 'admin');
$$;

alter table public.memberships enable row level security;
alter table public.players enable row level security;
alter table public.opponents enable row level security;
alter table public.seasons enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.lineups enable row level security;
alter table public.boards enable row level security;

create policy "View own membership" on public.memberships for select to authenticated using (user_id = auth.uid());
create policy "Admin manages memberships" on public.memberships for all to authenticated
  using (public.is_club_admin()) with check (public.is_club_admin());

create policy "Members view players" on public.players for select to authenticated using (public.can_view_club());
create policy "Editors manage players" on public.players for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());
create policy "Members view opponents" on public.opponents for select to authenticated using (public.can_view_club());
create policy "Editors manage opponents" on public.opponents for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());
create policy "Members view seasons" on public.seasons for select to authenticated using (public.can_view_club());
create policy "Editors manage seasons" on public.seasons for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());
create policy "Members view matches" on public.matches for select to authenticated using (public.can_view_club());
create policy "Editors manage matches" on public.matches for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());
create policy "Members view events" on public.match_events for select to authenticated using (public.can_view_club());
create policy "Editors manage events" on public.match_events for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());
create policy "Members view lineups" on public.lineups for select to authenticated using (public.can_view_club());
create policy "Editors manage lineups" on public.lineups for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());
create policy "Members view boards" on public.boards for select to authenticated using (public.can_view_club());
create policy "Editors manage boards" on public.boards for all to authenticated using (public.can_edit_club()) with check (public.can_edit_club());

alter table public.match_events
  add column team text check (team in ('tbfc', 'opponent')),
  add column own_goal boolean not null default false,
  add column team_goal boolean not null default false;

create or replace view public.player_event_totals with (security_invoker = true) as
select p.id, p.name, p.shirt_number,
  count(e.id) filter (where e.kind = 'goal' and not e.own_goal and coalesce(e.team, 'tbfc') = 'tbfc') as recorded_goals,
  count(e.id) filter (where e.kind = 'assist') as recorded_assists,
  count(e.id) filter (where e.kind = 'yellow_card') as recorded_yellow_cards,
  count(e.id) filter (where e.kind = 'penalty_save') as recorded_penalty_saves
from public.players p left join public.match_events e on e.player_id = p.id
group by p.id, p.name, p.shirt_number;

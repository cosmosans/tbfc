alter table public.match_events
  add column opponent_player_name text,
  drop constraint match_events_kind_check,
  add constraint match_events_kind_check
    check (kind in ('goal', 'assist', 'yellow_card', 'penalty_kick', 'penalty_save', 'missed_penalty', 'note'));

alter table public.match_events
  drop constraint match_events_kind_check,
  add constraint match_events_kind_check
    check (kind in ('goal', 'assist', 'yellow_card', 'penalty_kick', 'penalty_save', 'note'));

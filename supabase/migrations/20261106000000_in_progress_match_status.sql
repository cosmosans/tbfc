alter table public.matches drop constraint matches_status_check;
alter table public.matches add constraint matches_status_check
  check (status in ('scheduled', 'in_progress', 'completed'));

create or replace view public.match_results with (security_invoker = true) as
select m.*,
  case when status <> 'completed' then null
       when goals_for > goals_against then 'W'
       when goals_for < goals_against then 'L'
       when shootout_for > shootout_against then 'W'
       when shootout_for < shootout_against then 'L'
       else 'D' end as calculated_result
from public.matches m;

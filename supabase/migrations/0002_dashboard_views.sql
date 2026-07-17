-- Dashboard access: safe, read-only exposure of impact data to the anon role.
-- No phone numbers, no full names. Everything else stays locked.
--
-- Design: base tables keep RLS on. The service role (Edge Functions) bypasses RLS.
-- The dashboard uses the publishable/anon key and can read ONLY the safe columns of
-- `profiles` (first name, trade, has-CV, timestamp) plus three convenience views.
-- `users`, `conversations`, and `matches` are never exposed to the anon key.

-- First name only, derived once and stored, so full_name is never exposed.
alter table public.profiles
  add column if not exists first_name text
  generated always as (split_part(coalesce(full_name, ''), ' ', 1)) stored;

-- Explicitly lock the sensitive tables to the API roles.
revoke all on public.users         from anon, authenticated;
revoke all on public.conversations from anon, authenticated;
revoke all on public.matches       from anon, authenticated;

-- profiles: expose ONLY safe columns to the API roles.
revoke all on public.profiles from anon, authenticated;
grant select (id, user_id, first_name, role_trade, cv_pdf_path, created_at)
  on public.profiles to anon, authenticated;

-- Row visibility for the dashboard (all rows are public impact data).
drop policy if exists dashboard_read_profiles on public.profiles;
create policy dashboard_read_profiles
  on public.profiles for select
  to anon, authenticated
  using (true);

-- Read-only views (security_invoker = true → they respect the caller's RLS
-- and the column grants above; no SECURITY DEFINER escalation).
drop view if exists public.dashboard_profiles;
create view public.dashboard_profiles
with (security_invoker = true) as
select id, first_name, role_trade, (cv_pdf_path is not null) as has_cv, created_at
from public.profiles;

drop view if exists public.dashboard_stats;
create view public.dashboard_stats
with (security_invoker = true) as
select
  count(*)                                                       as total_profiles,
  count(*) filter (where cv_pdf_path is not null)                as total_cvs,
  count(distinct user_id) filter (where cv_pdf_path is not null) as people_with_cv,
  count(distinct user_id)                                        as people_reached
from public.profiles;

drop view if exists public.dashboard_trade_distribution;
create view public.dashboard_trade_distribution
with (security_invoker = true) as
select role_trade, count(*)::int as cnt
from public.profiles
where role_trade is not null and role_trade <> ''
group by role_trade
order by cnt desc;

grant usage on schema public to anon, authenticated;
grant select on public.dashboard_profiles           to anon, authenticated;
grant select on public.dashboard_stats              to anon, authenticated;
grant select on public.dashboard_trade_distribution to anon, authenticated;

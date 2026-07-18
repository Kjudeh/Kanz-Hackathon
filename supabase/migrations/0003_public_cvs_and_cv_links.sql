-- Make generated CVs downloadable from the dashboard.
--
-- NOTE ON PRIVACY: this makes the `cvs` bucket publicly readable. Paths are
-- unguessable UUIDs, which is acceptable for a demo, but CVs contain full names,
-- phone numbers and employers. Before real workers use this at scale, revert the
-- bucket to private and serve time-limited signed URLs from a protected endpoint
-- instead (see docs/SETUP.md).

update storage.buckets set public = true where id = 'cvs';

-- Expose the CV path (not just the has_cv flag) so the dashboard can build a link.
drop view if exists public.dashboard_profiles;
create view public.dashboard_profiles
with (security_invoker = true) as
select
  p.id,
  p.first_name,
  p.role_trade,
  (p.cv_pdf_path is not null) as has_cv,
  p.cv_pdf_path,
  p.created_at
from public.profiles p;

grant select on public.dashboard_profiles to anon, authenticated;

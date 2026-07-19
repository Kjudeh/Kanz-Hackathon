-- 0005_delivery_status.sql
--
-- Records whether an outbound WhatsApp message was actually accepted by Twilio.
--
-- Why this exists: outbound replies were written to `conversations` BEFORE the
-- Twilio send was attempted, and send errors were caught and logged to a console
-- stream that Supabase's log API does not expose. The result was a silent class
-- of failure — the database, the dashboard and the logs all looked completely
-- healthy while nothing was being delivered to users.
--
-- This was found in production when a Twilio trial account hit its 50-messages-
-- per-day cap (error 63038): the agent transcribed, reasoned and replied
-- correctly, and every reply was discarded at the last hop with no visible trace.

alter table public.conversations
  add column if not exists delivery_status text not null default 'n/a',
  add column if not exists delivery_detail text,
  add column if not exists provider_sid   text;

comment on column public.conversations.delivery_status is
  'n/a for inbound; pending -> sent | failed for outbound.';
comment on column public.conversations.delivery_detail is
  'Provider error text when delivery_status = failed.';
comment on column public.conversations.provider_sid is
  'Twilio message SID when the send was accepted.';

-- Cheap lookup of the only rows anyone ever wants to find in a hurry.
create index if not exists conversations_delivery_failed_idx
  on public.conversations (created_at desc)
  where delivery_status = 'failed';

-- Ops view: the last 24 hours of delivery failures, newest first.
-- Not granted to anon or authenticated — service role only, like the base table.
drop view if exists public.delivery_failures;
create view public.delivery_failures
with (security_invoker = true) as
select
  c.created_at,
  c.user_id,
  u.whatsapp_number,
  c.medium,
  left(c.transcript, 120) as preview,
  c.delivery_detail
from public.conversations c
join public.users u on u.id = c.user_id
where c.delivery_status = 'failed'
  and c.created_at > now() - interval '24 hours'
order by c.created_at desc;

revoke all on public.delivery_failures from anon, authenticated;

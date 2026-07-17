-- Wathefti initial schema (PRD §6)

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text unique not null,
  display_name text,
  state text not null default 'interviewing'
    check (state in ('interviewing','profile_complete','cv_sent','practice_mode')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text,
  role_trade text,
  employers jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  achievement text,
  raw_extracted jsonb,
  cv_pdf_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  medium text not null check (medium in ('voice','text')),
  transcript text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  job_family text not null,
  score numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_user on public.profiles(user_id);
create index if not exists idx_profiles_created on public.profiles(created_at desc);
create index if not exists idx_profiles_role on public.profiles(role_trade);
create index if not exists idx_conversations_user_created on public.conversations(user_id, created_at desc);
create index if not exists idx_matches_user on public.matches(user_id);
create index if not exists idx_users_created on public.users(created_at desc);

-- RLS: deny-by-default. Edge Functions use the service role (bypasses RLS);
-- the dashboard reads only through safe views (see 0002).
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.matches enable row level security;

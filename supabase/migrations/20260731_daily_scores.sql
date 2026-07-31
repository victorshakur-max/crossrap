create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  player_name text not null,
  challenge_date date not null,
  score integer not null check (score >= 0),
  duration_seconds integer not null check (duration_seconds > 0),
  hints_used integer not null default 0,
  completed_at timestamptz not null default now(),
  unique(challenge_date, player_id)
);

create index if not exists daily_scores_ranking
  on public.daily_scores(challenge_date, score desc, duration_seconds asc, completed_at asc);

alter table public.daily_scores enable row level security;

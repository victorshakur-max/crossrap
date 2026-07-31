create extension if not exists "pgcrypto";

create type word_difficulty as enum ('Fácil', 'Médio', 'Difícil', 'Lendário');

create table public.words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  hint text not null,
  category text not null check (category in ('Rap Nacional','Rap Internacional','História','Álbuns','Música','MCs','Battle Rap','Beatmakers','Graffiti','Breaking','DJ','Curiosidades')),
  difficulty word_difficulty not null default 'Médio',
  country text,
  source text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique(word, hint)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  xp integer not null default 0,
  level integer not null default 1,
  daily_streak integer not null default 0,
  last_played_on date,
  created_at timestamptz not null default now()
);

create table public.game_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null,
  category text,
  score integer not null,
  duration_seconds integer not null,
  completed_words integer not null,
  total_words integer not null,
  puzzle_seed text not null,
  completed_at timestamptz not null default now()
);

create index game_results_ranking on public.game_results(score desc, duration_seconds asc);
alter table public.words enable row level security;
alter table public.profiles enable row level security;
alter table public.game_results enable row level security;
create policy "approved words are public" on public.words for select using (approved = true);
create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "results are public" on public.game_results for select using (true);
create policy "users insert own results" on public.game_results for insert with check (auth.uid() = user_id);

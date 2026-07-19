-- =============================================================================
-- A3 — Recommendations App: core schema
-- Mirrors docs/ARCHITECTURE.md §2. Postgres / Supabase.
-- =============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- users — public profile, 1:1 with auth.users
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text,
  avatar          text,
  invite_code     text not null unique,                 -- 6-char, shared to connect
  expo_push_token text,
  created_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- friendships — one row per pair, canonicalised so user_a < user_b
-- -----------------------------------------------------------------------------
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.users (id) on delete cascade,
  user_b     uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_ordered_pair check (user_a < user_b),
  constraint friendships_unique_pair  unique (user_a, user_b)
);
create index if not exists friendships_user_a_idx on public.friendships (user_a);
create index if not exists friendships_user_b_idx on public.friendships (user_b);

-- -----------------------------------------------------------------------------
-- items — cache of external (Google Books) content; user-generated possible later
-- -----------------------------------------------------------------------------
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null default 'book' check (category in ('book','show','movie','site')),
  source      text not null default 'google_books',
  source_id   text,
  title       text not null,
  authors     text[] not null default '{}',
  cover_url   text,
  description text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  constraint items_source_unique unique (source, source_id)
);

-- -----------------------------------------------------------------------------
-- recommendations — one row per (item, sender, recipient). sender null = self-add
-- -----------------------------------------------------------------------------
create table if not exists public.recommendations (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.items (id) on delete cascade,
  sender_id    uuid references public.users (id) on delete set null,
  recipient_id uuid not null references public.users (id) on delete cascade,
  note         text check (note is null or char_length(note) <= 140),
  created_at   timestamptz not null default now()
);
-- Dedupe: a friend can only send the same item to the same person once.
create unique index if not exists recommendations_sent_unique
  on public.recommendations (item_id, sender_id, recipient_id)
  where sender_id is not null;
-- Dedupe: a self-added item appears once on a user's own TBR.
create unique index if not exists recommendations_selfadd_unique
  on public.recommendations (item_id, recipient_id)
  where sender_id is null;
create index if not exists recommendations_recipient_idx on public.recommendations (recipient_id);
create index if not exists recommendations_sender_idx    on public.recommendations (sender_id);
create index if not exists recommendations_item_idx      on public.recommendations (item_id);

-- -----------------------------------------------------------------------------
-- rec_status — lifecycle for a recommendation (1:1). Auto-created on rec insert.
-- -----------------------------------------------------------------------------
create table if not exists public.rec_status (
  id                uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null unique references public.recommendations (id) on delete cascade,
  status            text not null default 'to_read'
                      check (status in ('to_read','started','finished','not_for_me')),
  reaction          text check (reaction in ('loved','liked','not_for_me')),
  reaction_note     text,
  updated_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- notifications — in-app inbox; push fan-out handled by push-fanout Edge Function
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users (id) on delete cascade,
  type              text not null
                      check (type in ('rec_received','rec_started','rec_finished','friend_added')),
  recommendation_id uuid references public.recommendations (id) on delete cascade,
  actor_id          uuid references public.users (id) on delete set null,  -- who caused it
  read              boolean not null default false,
  created_at        timestamptz not null default now()
);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read, created_at desc);

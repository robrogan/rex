-- ============================================================
-- A3 one-shot setup: run this whole file once in the Supabase
-- SQL editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Equivalent to applying migrations/ in order + seed.sql.
-- ============================================================

-- >>>>>>>>>> migrations/20260719000001_schema.sql
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

-- >>>>>>>>>> migrations/20260719000002_functions_triggers.sql
-- =============================================================================
-- A3 — functions, triggers, and RPCs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- generate_invite_code() — unique 6-char code (no ambiguous chars: 0/O, 1/I)
-- -----------------------------------------------------------------------------
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.users where invite_code = code);
  end loop;
  return code;
end;
$$;

-- -----------------------------------------------------------------------------
-- handle_new_user() — create a public profile whenever an auth user is created
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, display_name, invite_code)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    ),
    public.generate_invite_code()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- are_friends() — order-independent friendship check (used by RLS)
-- -----------------------------------------------------------------------------
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where (user_a = least(a, b) and user_b = greatest(a, b))
  );
$$;

-- -----------------------------------------------------------------------------
-- new recommendation → create rec_status + notify the recipient (if sent)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_recommendation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rec_status (recommendation_id) values (new.id)
  on conflict (recommendation_id) do nothing;

  if new.sender_id is not null then
    insert into public.notifications (user_id, type, recommendation_id, actor_id)
    values (new.recipient_id, 'rec_received', new.id, new.sender_id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_recommendation_created on public.recommendations;
create trigger on_recommendation_created
  after insert on public.recommendations
  for each row execute function public.handle_new_recommendation();

-- -----------------------------------------------------------------------------
-- status change → notify the original sender when recipient starts/finishes
-- -----------------------------------------------------------------------------
create or replace function public.handle_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.recommendations%rowtype;
begin
  new.updated_at := now();

  if new.status is distinct from old.status and new.status in ('started','finished') then
    select * into rec from public.recommendations where id = new.recommendation_id;
    if rec.sender_id is not null then
      insert into public.notifications (user_id, type, recommendation_id, actor_id)
      values (
        rec.sender_id,
        case when new.status = 'started' then 'rec_started' else 'rec_finished' end,
        rec.id,
        rec.recipient_id
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_rec_status_updated on public.rec_status;
create trigger on_rec_status_updated
  before update on public.rec_status
  for each row execute function public.handle_status_change();

-- -----------------------------------------------------------------------------
-- redeem_invite_code() — connect two users by code; notifies both.
-- SECURITY DEFINER so the caller never needs SELECT on a stranger's user row.
-- -----------------------------------------------------------------------------
create or replace function public.redeem_invite_code(code text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  friend public.users%rowtype;
  lo uuid;
  hi uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  select * into friend from public.users
  where invite_code = upper(trim(code));

  if not found then
    raise exception 'invalid invite code';
  end if;

  if friend.id = me then
    raise exception 'you cannot add yourself';
  end if;

  lo := least(me, friend.id);
  hi := greatest(me, friend.id);

  insert into public.friendships (user_a, user_b)
  values (lo, hi)
  on conflict (user_a, user_b) do nothing;

  -- notify both parties (best-effort; skip if already friends and rows exist)
  insert into public.notifications (user_id, type, actor_id)
  values (friend.id, 'friend_added', me), (me, 'friend_added', friend.id);

  return friend;
end;
$$;

-- >>>>>>>>>> migrations/20260719000003_rls.sql
-- =============================================================================
-- A3 — Row Level Security
-- Principle (ARCHITECTURE §2): a user reads/writes only rows where they are the
-- owner, the sender, the recipient, or a friend-pair member. Items are a shared
-- public cache. Cross-user writes go through SECURITY DEFINER RPCs/triggers.
-- =============================================================================

alter table public.users            enable row level security;
alter table public.friendships      enable row level security;
alter table public.items            enable row level security;
alter table public.recommendations  enable row level security;
alter table public.rec_status       enable row level security;
alter table public.notifications    enable row level security;

-- ---- users -----------------------------------------------------------------
drop policy if exists users_select_self_or_friend on public.users;
create policy users_select_self_or_friend on public.users
  for select using (id = auth.uid() or public.are_friends(auth.uid(), id));

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- friendships -----------------------------------------------------------
drop policy if exists friendships_select_member on public.friendships;
create policy friendships_select_member on public.friendships
  for select using (auth.uid() in (user_a, user_b));

drop policy if exists friendships_delete_member on public.friendships;
create policy friendships_delete_member on public.friendships
  for delete using (auth.uid() in (user_a, user_b));

-- ---- items (shared cache; readable by all, writable by any signed-in user) --
drop policy if exists items_select_all on public.items;
create policy items_select_all on public.items
  for select using (true);

drop policy if exists items_insert_auth on public.items;
create policy items_insert_auth on public.items
  for insert with check (auth.uid() is not null);

drop policy if exists items_update_auth on public.items;
create policy items_update_auth on public.items
  for update using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---- recommendations -------------------------------------------------------
drop policy if exists recs_select_party on public.recommendations;
create policy recs_select_party on public.recommendations
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists recs_insert_valid on public.recommendations;
create policy recs_insert_valid on public.recommendations
  for insert with check (
    -- sent rec: I am the sender, recipient is a different, befriended user
    (sender_id = auth.uid()
      and recipient_id <> auth.uid()
      and public.are_friends(auth.uid(), recipient_id))
    -- self-add: no sender, I am the recipient
    or (sender_id is null and recipient_id = auth.uid())
  );

drop policy if exists recs_delete_owner on public.recommendations;
create policy recs_delete_owner on public.recommendations
  for delete using (
    auth.uid() = sender_id or (sender_id is null and recipient_id = auth.uid())
  );

-- ---- rec_status ------------------------------------------------------------
drop policy if exists recstatus_select_party on public.rec_status;
create policy recstatus_select_party on public.rec_status
  for select using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id
        and (r.recipient_id = auth.uid() or r.sender_id = auth.uid())
    )
  );

drop policy if exists recstatus_insert_recipient on public.rec_status;
create policy recstatus_insert_recipient on public.rec_status
  for insert with check (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.recipient_id = auth.uid()
    )
  );

drop policy if exists recstatus_update_recipient on public.rec_status;
create policy recstatus_update_recipient on public.rec_status
  for update using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.recipient_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.recipient_id = auth.uid()
    )
  );

-- ---- notifications ---------------------------------------------------------
drop policy if exists notif_select_own on public.notifications;
create policy notif_select_own on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists notif_update_own on public.notifications;
create policy notif_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============================================================================
-- Grants — RLS restricts rows; roles still need base table/function privileges.
-- (Supabase default-privileges usually cover this; explicit for clarity + local
-- testing parity.)
-- =============================================================================
grant usage on schema public to anon, authenticated;

grant select on public.items to anon;

grant select, insert, update, delete on
  public.users, public.friendships, public.items,
  public.recommendations, public.rec_status, public.notifications
to authenticated;

grant execute on function public.redeem_invite_code(text) to authenticated;
grant execute on function public.are_friends(uuid, uuid)   to anon, authenticated;

-- >>>>>>>>>> seed.sql
-- =============================================================================
-- A3 — seed data: 2 test users + 5 books + sample recommendations
-- Runs after migrations (e.g. `supabase db reset`). Idempotent.
-- Test logins (email OTP or password): password for both = "password123"
--   Rob  <rob@example.com>   invite code ROB123
--   Leul <leul@example.com>  invite code LEUL42
-- =============================================================================

-- ---- auth users (the on_auth_user_created trigger creates public.users) -----
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-0000000a0001', 'authenticated', 'authenticated',
   'rob@example.com', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"display_name":"Rob"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000',
   '00000000-0000-0000-0000-0000000a0002', 'authenticated', 'authenticated',
   'leul@example.com', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"display_name":"Leul"}', now(), now())
on conflict (id) do nothing;

-- ---- deterministic invite codes for the two founders -----------------------
update public.users set invite_code = 'ROB123',  display_name = 'Rob'
  where id = '00000000-0000-0000-0000-0000000a0001';
update public.users set invite_code = 'LEUL42', display_name = 'Leul'
  where id = '00000000-0000-0000-0000-0000000a0002';

-- ---- connect them as friends (ordered pair a<b) ----------------------------
insert into public.friendships (user_a, user_b)
select least(a, b), greatest(a, b)
from (select '00000000-0000-0000-0000-0000000a0001'::uuid a,
             '00000000-0000-0000-0000-0000000a0002'::uuid b) p
on conflict (user_a, user_b) do nothing;

-- ---- 5 books (matches the Figma mockups) -----------------------------------
insert into public.items (id, category, source, source_id, title, authors, cover_url, description, tags)
values
  ('00000000-0000-0000-0000-0000000b0001', 'book', 'google_books', 'gb_oathbringer',
   'Oathbringer', array['Brandon Sanderson'],
   'https://books.google.com/books/content?id=oathbringer&printsec=frontcover&img=1',
   'Book three of The Stormlight Archive. The war for the fate of Roshar continues.',
   array['Epic Fantasy','Magic','Adventure']),
  ('00000000-0000-0000-0000-0000000b0002', 'book', 'google_books', 'gb_wayofkings',
   'The Way of Kings', array['Brandon Sanderson'],
   'https://books.google.com/books/content?id=wayofkings&printsec=frontcover&img=1',
   'Book one of The Stormlight Archive.',
   array['Epic Fantasy','Magic','Adventure']),
  ('00000000-0000-0000-0000-0000000b0003', 'book', 'google_books', 'gb_butter',
   'Butter', array['Asako Yuzuki'],
   'https://books.google.com/books/content?id=butter&printsec=frontcover&img=1',
   'A novel of food and murder, inspired by a true story.',
   array['Fiction','Mystery','Thriller']),
  ('00000000-0000-0000-0000-0000000b0004', 'book', 'google_books', 'gb_tuberculosis',
   'Everything Is Tuberculosis', array['John Green'],
   'https://books.google.com/books/content?id=tuberculosis&printsec=frontcover&img=1',
   'The history and persistence of our deadliest infection.',
   array['Nonfiction','History','Science']),
  ('00000000-0000-0000-0000-0000000b0005', 'book', 'google_books', 'gb_theguest',
   'The Guest', array['Emma Cline'],
   'https://books.google.com/books/content?id=theguest&printsec=frontcover&img=1',
   'A young woman drifts through the end of a Long Island summer.',
   array['Contemporary','Fiction'])
on conflict (source, source_id) do nothing;

-- ---- recommendations (triggers auto-create rec_status + notifications) ------
-- Leul → Rob: Oathbringer
insert into public.recommendations (id, item_id, sender_id, recipient_id, note)
values ('00000000-0000-0000-0000-0000000c0001',
        '00000000-0000-0000-0000-0000000b0001',
        '00000000-0000-0000-0000-0000000a0002',
        '00000000-0000-0000-0000-0000000a0001',
        'You have to read this one next.')
on conflict do nothing;

-- Rob self-adds The Way of Kings to his own TBR (sender null)
insert into public.recommendations (id, item_id, sender_id, recipient_id, note)
values ('00000000-0000-0000-0000-0000000c0002',
        '00000000-0000-0000-0000-0000000b0002',
        null,
        '00000000-0000-0000-0000-0000000a0001',
        null)
on conflict do nothing;

-- Rob → Leul: Butter
insert into public.recommendations (id, item_id, sender_id, recipient_id, note)
values ('00000000-0000-0000-0000-0000000c0003',
        '00000000-0000-0000-0000-0000000b0003',
        '00000000-0000-0000-0000-0000000a0001',
        '00000000-0000-0000-0000-0000000a0002',
        'Dark and delicious.')
on conflict do nothing;


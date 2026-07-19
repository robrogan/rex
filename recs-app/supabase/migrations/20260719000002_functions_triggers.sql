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

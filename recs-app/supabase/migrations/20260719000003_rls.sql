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

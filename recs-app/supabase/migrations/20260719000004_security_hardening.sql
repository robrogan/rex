-- =============================================================================
-- A3 — security & performance hardening
-- Addresses Supabase advisor findings after first deploy of migrations 1-3:
--   1. SECURITY DEFINER functions not meant for direct RPC calls were reachable
--      via the public REST API because Postgres grants EXECUTE to PUBLIC by
--      default. Triggers invoke their function via the trigger mechanism, not a
--      privilege-checked call, so revoking PUBLIC execute does not affect them.
--   2. generate_invite_code() was missing `set search_path`, unlike the other
--      functions (mutable search_path lint).
--   3. All RLS policies re-evaluated auth.uid() per row instead of once per
--      query. Wrapping calls as (select auth.uid()) is the Supabase-documented
--      fix — logic is unchanged, only evaluation is cached per statement.
-- are_friends() keeps its existing explicit grant to anon+authenticated — that
-- was a deliberate choice in migration 3 (used for public share-page friend
-- checks), not a default-grant leftover, so it is untouched here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Revoke unnecessary public RPC exposure
-- -----------------------------------------------------------------------------
revoke execute on function public.handle_new_user()          from public;
revoke execute on function public.handle_new_recommendation() from public;
revoke execute on function public.handle_status_change()      from public;

revoke execute on function public.redeem_invite_code(text) from public;
grant  execute on function public.redeem_invite_code(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Pin search_path on generate_invite_code (logic unchanged)
-- -----------------------------------------------------------------------------
create or replace function public.generate_invite_code()
returns text
language plpgsql
set search_path = public
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
-- 3. Re-create RLS policies with auth.uid() wrapped in (select ...)
-- -----------------------------------------------------------------------------

-- ---- users -----------------------------------------------------------------
drop policy if exists users_select_self_or_friend on public.users;
create policy users_select_self_or_friend on public.users
  for select using (id = (select auth.uid()) or public.are_friends((select auth.uid()), id));

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---- friendships -------------------------------------------------------------
drop policy if exists friendships_select_member on public.friendships;
create policy friendships_select_member on public.friendships
  for select using ((select auth.uid()) in (user_a, user_b));

drop policy if exists friendships_delete_member on public.friendships;
create policy friendships_delete_member on public.friendships
  for delete using ((select auth.uid()) in (user_a, user_b));

-- ---- items -------------------------------------------------------------------
drop policy if exists items_insert_auth on public.items;
create policy items_insert_auth on public.items
  for insert with check ((select auth.uid()) is not null);

drop policy if exists items_update_auth on public.items;
create policy items_update_auth on public.items
  for update using ((select auth.uid()) is not null) with check ((select auth.uid()) is not null);

-- ---- recommendations ----------------------------------------------------------
drop policy if exists recs_select_party on public.recommendations;
create policy recs_select_party on public.recommendations
  for select using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);

drop policy if exists recs_insert_valid on public.recommendations;
create policy recs_insert_valid on public.recommendations
  for insert with check (
    (sender_id = (select auth.uid())
      and recipient_id <> (select auth.uid())
      and public.are_friends((select auth.uid()), recipient_id))
    or (sender_id is null and recipient_id = (select auth.uid()))
  );

drop policy if exists recs_delete_owner on public.recommendations;
create policy recs_delete_owner on public.recommendations
  for delete using (
    (select auth.uid()) = sender_id or (sender_id is null and recipient_id = (select auth.uid()))
  );

-- ---- rec_status ----------------------------------------------------------------
drop policy if exists recstatus_select_party on public.rec_status;
create policy recstatus_select_party on public.rec_status
  for select using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id
        and (r.recipient_id = (select auth.uid()) or r.sender_id = (select auth.uid()))
    )
  );

drop policy if exists recstatus_insert_recipient on public.rec_status;
create policy recstatus_insert_recipient on public.rec_status
  for insert with check (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.recipient_id = (select auth.uid())
    )
  );

drop policy if exists recstatus_update_recipient on public.rec_status;
create policy recstatus_update_recipient on public.rec_status
  for update using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.recipient_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.recipient_id = (select auth.uid())
    )
  );

-- ---- notifications ---------------------------------------------------------------
drop policy if exists notif_select_own on public.notifications;
create policy notif_select_own on public.notifications
  for select using (user_id = (select auth.uid()));

drop policy if exists notif_update_own on public.notifications;
create policy notif_update_own on public.notifications
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

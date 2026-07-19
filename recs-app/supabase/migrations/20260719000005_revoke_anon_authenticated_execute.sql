-- =============================================================================
-- A3 — follow-up to 20260719000004: Supabase grants EXECUTE directly to
-- anon/authenticated via default privileges at function-creation time,
-- separate from the PUBLIC grant already revoked in 20260719000004. That
-- migration alone did not fully close the RPC-exposure advisor findings —
-- this one does.
-- =============================================================================

-- Trigger functions should not be directly callable by anyone. Trigger
-- execution bypasses function-level EXECUTE checks entirely, so this has no
-- effect on the on_auth_user_created / on_recommendation_created /
-- on_rec_status_updated triggers still firing normally.
revoke execute on function public.handle_new_user()          from anon, authenticated;
revoke execute on function public.handle_new_recommendation() from anon, authenticated;
revoke execute on function public.handle_status_change()      from anon, authenticated;

-- redeem_invite_code should only be callable by authenticated (it already
-- checks auth.uid() internally, but removing anon access tightens the exposed
-- API surface rather than relying on that internal check alone).
revoke execute on function public.redeem_invite_code(text) from anon;
-- authenticated keeps execute (granted in migration 3/4) — the function's
-- intended public entry point.

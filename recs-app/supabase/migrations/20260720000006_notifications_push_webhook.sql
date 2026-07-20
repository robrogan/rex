-- =============================================================================
-- A7/A8 — close the push-delivery loop.
--
-- The A2/A3 DB triggers already write public.notifications rows on new
-- recommendation / status change. This migration adds the missing link:
-- on INSERT into notifications, POST the row to the `push-fanout` Edge Function,
-- which reads the recipient's expo_push_token and sends the Expo push.
--
--   notifications INSERT  ->  handle_notification_push (trigger)
--                         ->  net.http_post  ->  /functions/v1/push-fanout
--                         ->  https://exp.host/--/api/v2/push/send
--
-- Deploy the function separately:  supabase functions deploy push-fanout
-- (In this project it was deployed via the Supabase MCP; verify_jwt = true.)
-- =============================================================================

-- pg_net gives Postgres an async HTTP client (net.http_post). Its API functions
-- live in the dedicated `net` schema regardless of the extension's home schema.
-- Install into `extensions` (Supabase-recommended) to avoid the
-- `extension_in_public` linter warning.
-- (On the live project this first landed in `public`; migration 0007 relocates
-- it. Fresh setups get it in `extensions` directly from here.)
create extension if not exists pg_net with schema extensions;

create or replace function public.handle_notification_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://mipdevkjokgaamnulqvr.supabase.co/functions/v1/push-fanout',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- The anon key is a valid Supabase JWT, so it passes the Edge Function's
      -- verify_jwt check. It is NOT secret: it already ships in the mobile
      -- client. The function uses the injected service-role key internally.
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcGRldmtqb2tnYWFtbnVscXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzE0NDgsImV4cCI6MjEwMDA0NzQ0OH0.B5gnvEyv0tUcps1kENsdX108WoqiUcPl-7yXNWDDD1M'
    ),
    -- Shape matches the push-fanout WebhookPayload interface exactly.
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notifications',
      'record', to_jsonb(new)
    )
  );
  return new;
end;
$$;

-- Consistent with the migration 4/5 hardening: trigger functions must not be
-- callable via /rest/v1/rpc. Trigger execution bypasses EXECUTE checks, so the
-- trigger below still fires normally.
revoke execute on function public.handle_notification_push() from public, anon, authenticated;

drop trigger if exists on_notification_created on public.notifications;
create trigger on_notification_created
  after insert on public.notifications
  for each row execute function public.handle_notification_push();

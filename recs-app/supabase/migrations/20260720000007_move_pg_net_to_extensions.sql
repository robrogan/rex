-- =============================================================================
-- Clear the `extension_in_public` security advisory introduced when migration
-- 0006 first enabled pg_net (it landed in `public`). pg_net is not relocatable,
-- so move it by drop + recreate into the `extensions` schema.
--
-- Safe: pg_net's API functions live in the dedicated `net` schema regardless of
-- the extension's home schema, so handle_notification_push()'s net.http_post()
-- call stays valid (re-verified: notification INSERT -> sent:true after the
-- move). No pg_net traffic is pending at this stage.
--
-- On a fresh database this is effectively a no-op: migration 0006 already
-- creates pg_net in `extensions`.
-- =============================================================================

drop extension if exists pg_net;
create extension pg_net with schema extensions;

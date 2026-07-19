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

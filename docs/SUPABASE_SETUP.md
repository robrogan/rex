# Connecting the Supabase backend (A3)

All the A3 code is written and verified — this is the ~10-minute manual step to
point it at a live database. Everything lives in `recs-app/supabase/`.

## What's already built
- `supabase/migrations/` — the full schema, row-level security, and triggers.
- `supabase/seed.sql` — 2 test users (Rob, Leul) + 5 books + sample recs.
- `supabase/functions/push-fanout/` — Expo push Edge Function (finished in A7).
- App wiring: `src/lib/supabase.ts`, `src/lib/auth.tsx` (email OTP), typed
  `src/types/database.ts`, React Query.

Verified against Postgres 16 before handoff: 21/21 checks — migrations apply,
triggers create statuses + notifications, and RLS correctly isolates users
(user A cannot read user B's private rows).

---

## Step 1 — Create the project
1. Go to https://supabase.com → sign in → **New project**.
2. Name it (e.g. `recs-app`), pick a region near you, set a **database password**
   (save it), and create. Free tier is fine.

## Step 2 — Get your keys into `.env`
1. In the project: **Project Settings → API**.
2. In `recs-app/`, copy `.env.example` to `.env` and fill in:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<the anon / publishable key>
   ```
   `.env` is gitignored — never commit it, and never put the `service_role` key here.

## Step 3 — Apply the schema + seed
Pick **one** path.

### Path A — Dashboard (no tools, easiest)
1. Open **SQL Editor** in the Supabase dashboard.
2. Paste and **Run** each file in `recs-app/supabase/migrations/` **in order**
   (`…000001` → `…000002` → `…000003`).
3. Paste and **Run** `recs-app/supabase/seed.sql`.

### Path B — Supabase CLI (repeatable)
```bash
npm i -g supabase
cd recs-app
supabase link --project-ref <your-ref>   # paste the DB password when asked
supabase db push                         # applies migrations/
supabase db execute --file supabase/seed.sql
```

## Step 4 — Run the app
```bash
cd recs-app
npm install
npx expo start
```
Scan the QR with Expo Go. The app now shows the real sign-in screen. Enter your
email, get the 6-digit code, and you're in. (Seeded test logins: `rob@example.com`
/ `leul@example.com`, invite codes `ROB123` / `LEUL42`.)

> Auth uses **email OTP** (6-digit codes) rather than magic links — most reliable
> in Expo Go before a deep-link domain exists. Confirm **Authentication → Providers
> → Email** is enabled (it is by default).

## Step 5 — Push notifications (optional now; finished in A7)
```bash
supabase functions deploy push-fanout
```
Then add a **Database Webhook** on `INSERT` of `public.notifications` pointing at
the function. Wiring + final notification copy land in brief A7.

---

## Notes for whoever picks up A4–A7
- Regenerate exact types after the project exists:
  `supabase gen types typescript --project-id <ref> > src/types/database.ts`.
- Cross-user writes go through the `redeem_invite_code(code)` RPC and DB triggers
  (SECURITY DEFINER), so clients never need broad table grants.
- RLS summary: users see only their own row + friends'; recommendations/statuses/
  notifications are visible only to the sender/recipient; `items` are public-read
  (shared book cache, also supports the A9 public share pages).

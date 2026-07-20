# Build Progress

| Brief | Status | Notes |
|---|---|---|
| A1 Scaffold | ✅ Done 2026-07-18 | Expo SDK 57, expo-router, TS strict, theme tokens from Figma, S1–S12 placeholder routes, eas.json (dev/preview/prod), ESLint+Prettier. Verified: tsc clean, eslint clean, `expo export --platform web` bundles all routes. App name/slug placeholder "Recs App (working title)" pending D1. |
| A2 Design system | ✅ Done 2026-07-19 | 8 components in `src/components/` (`Avatar`, `TabPill`, `PrimaryButton`/`SecondaryButton`, `SearchBar`, `TagChip`, `RecBadge`, `BookCard`) + barrel `index.ts`, matched to the Figma MVP Drafts `mvp/*` kit and the original Home/Detail card. Hidden `/dev/components` gallery renders every state. Theme reconciled (violet card outline, `description` 16/24, kit-accurate `radii`/`type` tokens). tsc + eslint clean; `expo export --platform web` bundles `/dev/components`. See "A2 design system built" below. |
| A3 Backend | ✅ Done 2026-07-19 | SQL migrations (schema/RLS/triggers/hardening), seed (2 users + 5 books), `push-fanout` Edge Function stub, `config.toml`; client wiring `lib/supabase.ts` + `lib/auth.tsx` (email OTP) + React Query + typed `types/database.ts`; functional OTP sign-in. **Live Supabase project connected** (ref `mipdevkjokgaamnulqvr`), migrations 1-5 + seed applied directly via the Supabase MCP and verified (row counts match seed exactly, triggers fire). Test logins in `recs-app/TEST_LOGINS.local.md` (gitignored, not in repo — ask Rob if you need them). See "Supabase backend connected & hardened" below. |
| A4 Search/detail | ✅ Done 2026-07-19 | Google Books search (`lib/googleBooks.ts`) + canonical-work dedupe (D5), `lib/items.ts` shared upsert primitive (A5 reuses `ensureItem`), `useBookSearch`/`useDebouncedValue` hooks, S4 search screen (`search.tsx`) + S5 detail (`item/[id].tsx`) with a live **Add-to-my-TBR** (U7, self-recommendation). Zero new deps. tsc + eslint clean; web export bundles all 21 routes. **Live search unverifiable from the build sandbox** (its egress is attributed to a zero-quota GCP project → 429); needs an on-device check by Rob. Canonicalize + RLS/trigger write-path verified offline. See "A4 search & detail built" below. |
| A5 Friends/send | ✅ Done 2026-07-19 | **Connection half** (`lib/friends.ts` + S7 `friends.tsx` + S11 `friend/[id].tsx`, U3/U4/U14) **and send half** (`lib/send.ts` + S6 `share.tsx` + U15 on book detail, U6/U6b). Invite-code connect via `redeem_invite_code`; multi-select send w/ note + toast; "Copy public link" (placeholder domain). Added `expo-clipboard`. See "A5 friends foundation built" + "Core-loop wave" below. |
| A6 TBR/status | ✅ Done 2026-07-19 | `lib/tbr.ts` (grouped TBR reads + status mutation) + S3 `(tabs)/tbr.tsx` (category pills, search, BookCard list, per-card status) + S9 `status.tsx` (To read→Started→Finished/Not for me + reaction/note). Status change writes all rec rows for the book; DB trigger fanouts the ping. `lib/embed.ts` fixes PostgREST to-one/to-many embed handling (incl. a latent `friends.ts` bug). |
| A7 Notifications | 🟡 In-app done 2026-07-19 | `lib/notifications.ts` + S8 `(tabs)/inbox.tsx` (read state, mark-read/all, deep-link) work fully on live data. `usePushRegistration` writes `expo_push_token`, but **push delivery needs a dev build (A8)** — fails soft in Expo Go/web/sim. Added `expo-notifications`. |
| A9 Web share pages | ⬜ | |
| A8 Builds | ⬜ | |

---

## Design reference (Figma) — added 2026-07-19

Figma **screen drafts** (DEFERRED_TASKS #3, not A2) are done. This is the visual source of truth A2 must match, and feeds A4/A5/A6.

- **File:** Recommendation-App-Designs, key `T4qrt18lCu5elAPofAz2jm`. **New page `MVP Drafts`** (existing pages untouched): device drafts for **S2** (sign up/in), **S4** (search results + editions), **S6** (share sheet + success toast over dimmed detail), **S7** (friends + invite code), **S8** (notifications/inbox, incl. the "ping"), **S9** (status + reaction sheet).
- **Local `mvp/*` component kit** (parked off-canvas on that page) maps ~1:1 to A2 code components: `mvp/Pill` (variant State=Default/Active) → `TabPill`; `mvp/Button` → `PrimaryButton`; `mvp/Avatar` → `Avatar`; `mvp/Input` → `SearchBar`/fields; `mvp/Book Thumb` → cover placeholder in `BookCard`.
- **`BookCard`, `TagChip`, `RecBadge`** were NOT drafted as standalone Figma components — they already exist on the **original** pages (Home → "Initial" TBR list, and Book Detail). Match those for the "3+ Friendos"/stacked-avatar "+N" treatment.
- **Tokens** confirmed against `theme.ts`: bg `#4B0082`, font `#EE82EE`, fontOnPrimary `#F6F5F5`, primary400 `#FFA500`, primary800 `#241C47`, description `#F5C4DE` (now also a Figma color variable + a `description` Goudy text style).

**A2 flags to reconcile with Figma when coding:**
- **Active pill/button labels use DARK text** (`primary800`) on the orange fill — matches the existing "Books" tab — not white/`fontOnPrimary`.
- **Card/row outlines** in the drafts are **translucent violet** (`font` @ ~40–55% opacity), a pale lavender — `theme.ts` currently sets `cardOutline: '#F5C4DE'` (pink). Match Figma unless Rob prefers pink.
- **`description` type** renders at **16/24** in the drafts vs `type.description` = 18 in `theme.ts`; align the size.
- `theme.ts` `success`/`info` (`#00FF00`/`#0000FF`) are placeholders, not from the Figma variable set.

---

## Supabase backend connected & hardened — added 2026-07-19

The A3 backend went from "code done, needs a live project" to fully connected and verified.

- **Project:** `mipdevkjokgaamnulqvr` (matches `EXPO_PUBLIC_SUPABASE_URL` in `.env`). Connected via the Supabase MCP server (already configured in root `.mcp.json`); OAuth was a one-time browser approval.
- **Applied directly to the live project** (and mirrored to `supabase/migrations/` + `supabase/setup.sql` on disk so a fresh project can reproduce this exactly): migrations `...000001_schema` → `...000003_rls` as originally written, plus two new hardening migrations, `...000004_security_hardening` and `...000005_revoke_anon_authenticated_execute`, then `seed.sql`.
- **Verified:** row counts match `seed.sql` exactly (2 users, 1 friendship, 5 items, 3 recommendations, 3 rec_status, 2 notifications); `pg_policies` confirms all 15 RLS policies exist post-hardening.
- **Why the hardening migrations exist:** Supabase's advisor flagged two things after the first deploy —
  1. *SECURITY DEFINER RPC exposure.* Postgres/Supabase grant `EXECUTE` on new functions to `PUBLIC` **and** directly to `anon`/`authenticated` by default. This made the trigger functions (`handle_new_user`, `handle_new_recommendation`, `handle_status_change`) and `redeem_invite_code` callable via `/rest/v1/rpc/...` even though only `redeem_invite_code` was meant to be a public entry point. Fixed by explicitly revoking `EXECUTE` from `public`, `anon`, and `authenticated` on the three trigger functions (trigger execution bypasses these checks entirely, so this doesn't affect trigger behavior), and revoking `anon` (only) from `redeem_invite_code`, leaving `authenticated` — its intended caller. `are_friends()` keeps its original `anon, authenticated` grant untouched — that one was a deliberate choice in migration 3 (used for public share-page friend checks), not a default-grant leftover.
  2. *RLS performance.* All 15 policies called `auth.uid()` unwrapped, which Postgres re-evaluates per row instead of once per query. Re-created every policy with `auth.uid()` wrapped as `(select auth.uid())` — the Supabase-documented fix, logic unchanged. Confirmed via `get_advisors` that all `auth_rls_initplan` warnings are gone post-migration.
  - Also pinned `search_path = public` on `generate_invite_code()` (the one function missing it, matching the others).
  - **Not touched, and not a problem:** `unindexed_foreign_keys` and `unused_index` INFO-level advisories — noise from a freshly-seeded, unqueried database, not a real signal at this stage. `auth_leaked_password_protection` (WARN) is an Auth dashboard toggle unrelated to these migrations, not addressed here — low priority since the app uses email OTP, not passwords, for real users (only the seeded test accounts have passwords).
- **Test logins:** `recs-app/TEST_LOGINS.local.md` (gitignored — emails, passwords, invite codes for the two seeded accounts). Not in the repo; ask Rob directly if you need them for testing.
- **GitHub:** repo is live at `github.com/robrogan/rex`, this session's changes are pushed to `main`.

---

## A2 design system built — added 2026-07-19

Reusable component library in `recs-app/src/components/`, matched to the Figma **MVP Drafts** `mvp/*` kit (file `T4qrt18lCu5elAPofAz2jm`, page id `54663:553`) and the original Home/Book-Detail card. Theme-token-only — no hardcoded colors. Built on branch `a2-design-system`.

**Components** (+ barrel `src/components/index.ts` so A4–A6 import from `../components`):
- `Avatar` — dark disc, 2px orange ring, initials fallback (mvp/Avatar).
- `TabPill` — active = orange fill + dark label; inactive = violet outline; disabled dims + "soon" (mvp/Pill, r20).
- `PrimaryButton` / `SecondaryButton` — pixel label; orange fill / violet outline (mvp/Button, r16).
- `SearchBar` — dark fill, violet outline, 🔍 glyph (mvp/Input, r12).
- `TagChip` — plain Pixelify word (the drafts render tags without chrome).
- `RecBadge` — heavily-overlapped stacked avatars (3px reveal) + "Name +N" / "3+ Friendos" pixel label.
- `BookCard` — cover (solid placeholder + 📚, or image) + `RecBadge` + Crimson-Pro-Light 22/24 **orange** title + wrapped `TagChip`s; asymmetric "book-spine" corners (8/8/8/2) + M3-ish shadow.

**Gallery:** `src/app/dev/components.tsx` → route `/dev/components` (hidden, not linked from any screen). Registered in the root `Stack`; `AuthGate` lets `dev/*` through without a session so it's reachable during dev.

**Theme reconciliations** (`src/lib/theme.ts` — resolves the earlier "A2 flags"):
- `cardOutline` → translucent violet `rgba(238,130,238,0.45)` (was pink `#F5C4DE`) — Rob's call, matches the drafts.
- `type.description` → 16/24 (was 18) — matches the Figma `description` text style.
- Added `type.cardTitle` (Crimson Pro 22/24 orange), `type.author` (Manrope 15/19), `type.meta` (Goudy 14/18) from the S4 row, and `colors.coverPlaceholder`.
- `radii` re-scaled to the kit values: `{ xs:2, sm:8, md:12, lg:16, xl:20, pill:999 }`.

**Fonts:** unchanged — the 4 finalized families (Crimson Pro, Manrope, Pixelify Sans, Goudy Bookletter 1911) were already installed + loaded in `_layout.tsx` (A1). The original card's Roboto Slab title was **not** adopted; the newer S4 draft uses Crimson Pro, so `BookCard` uses the design-system serif. No new font/dependency added.

**Config fix (pre-existing A3 gap):** excluded `supabase/functions` (the Deno edge function) from `tsconfig.json` and `eslint.config.js` — it's checked by Deno, not the Expo toolchain. Without this, root `tsc`/`eslint` failed on `Deno` globals + `https://esm.sh` imports.

**Verified:** `tsc --noEmit` clean; `eslint .` clean; `expo export --platform web` bundles all 21 routes incl. `/dev/components` (server-rendered with no error). The final pixel-level side-by-side vs Figma is a device/Expo-Go check for Rob — it needs the real native font rendering.

---

## A5 friends foundation built — added 2026-07-19

The **connection half of brief A5** (U3/U4/U14), built on branch `a5-friends` **in parallel with A4** (search/detail) — deliberately zero file overlap with A4's `search.tsx` / `item/[id].tsx` / `lib/googleBooks.ts`. Theme-token-only, reuses A2 components.

**Data layer — `src/lib/friends.ts`** (React Query over Supabase, typed via `types/database.ts`):
- `useMyProfile()` — my `users` row (invite code for S7).
- `useFriends()` — my `friendships` rows → the "other" user ids → their `users` rows (all reads scoped by existing RLS). Sorted by name.
- `useRedeemInviteCode()` — mutation calling the A3 `redeem_invite_code(code)` RPC (uppercases input to match its `upper(trim())`); invalidates `['friends']`; the RPC's raised exceptions surface as friendly inline errors.
- `useRecsBetween(friendId)` (U14) — `recommendations` filtered with `.or(and(...),and(...))` for both directions, nested `items` + `rec_status`, split into `{ sent, received }` each carrying current status/reaction.

**S7 — `src/app/(tabs)/friends.tsx`** (replaced placeholder): invite-code card with native **Share** (RN `Share`) + **Copy** (`expo-clipboard`); connect-by-code input (auto-uppercase, maxLength 6) with success/error states; friends list rows (`Avatar` + name) deep-linking to `/friend/[id]`; loading/empty/error states throughout.

**S11 — `src/app/friend/[id].tsx`** (replaced placeholder): friend header (`Avatar` + name from the cached friends list, sets the stack header title via `<Stack.Screen>`); two groups "You sent {name}" / "{name} sent you", each a compact cover-thumb row with title/author/note and a status pill (To read / Started / Finished / Not for me, + reaction glyph on finish). Per-group empty states.

**Dependency added:** `expo-clipboard` (`npx expo install`, SDK-57-pinned, Expo Go compatible) for the copy-code button.

**Deferred to post-A4** (both hang off A4's book-detail screen): S6 send-a-rec share sheet + success toast, and the U15 "Recommended to…" affordance.

**Verified:** `tsc --noEmit` clean; `eslint .` clean (lone warning is in generated `.expo/types/router.d.ts`, gitignored); `expo export --platform web` bundles `/friends` + `/friend/[id]`. Query correctness confirmed against the **live** seed via the Supabase MCP: invite codes `ROB123`/`LEUL42`; `useRecsBetween(Rob↔Leul)` = You sent → *Butter*, they sent → *Oathbringer* (both `to_read`); the null-sender self-add is correctly excluded from the pair view. On-device Expo Go check (fonts, native Share sheet) is Rob's to run with a seeded login from `TEST_LOGINS.local.md`.

---

## A4 search & detail built — added 2026-07-19

Search → book detail → add-to-TBR, the first slice of the core loop. Branch `a4-search-detail` off `main`. Decisions this session: **canonical work only** (D5 — no edition picker), **lazy DB writes** (a book is written to `items` only on action, never on view), and **"Add to my TBR" (U7) included** so the screen is a working standalone loop.

**New files**
- `src/lib/googleBooks.ts` — `searchVolumes` / `fetchVolume` (endpoint `/books/v1/volumes`, `country=US` required, optional `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY`), normalize (https-ify covers, strip page-curl, cap categories to 3 tags), and `canonicalize()` — groups by normalized *title|firstAuthor*, keeps the most complete volume per group, preserves first-seen order. Pure, no React.
- `src/lib/items.ts` — the **A5-shared** DB primitive: `volumeToItemInsert`, `ensureItem` (upsert on `items(source, source_id)`), `addToTbr` (self-recommendation, `sender_id = null`; swallows `23505` for idempotency). Standalone so the parallel A5 branch reconciles cleanly.
- `src/hooks/useDebouncedValue.ts` (350ms) + `src/hooks/useBookSearch.ts` (`useInfiniteQuery`, min 2 chars, canonicalized across pages).

**Screens**
- `src/app/search.tsx` (S4) — `SearchBar` + `FlatList` of `BookCard`-in-`Pressable`; idle / loading / empty / error-retry states; infinite scroll. Taps navigate to `/item/gb:<volumeId>`.
- `src/app/item/[id].tsx` (S5) — dual-form loader: `gb:<volumeId>` → Google Books API; a bare uuid → `items` row (so A6 TBR items and A9 share links resolve in the same screen). Real layout (cover, title, author, `TagChip`s, description) + a live **Add-to-my-TBR** `PrimaryButton` (`useMutation` → `addToTbr`, invalidates `['tbr']`). **Left untouched for A5/A6:** the Share/status stub `<Link>`s and a marked U15 stub — so A5's send sheet + "Recommended to…" layer on with minimal conflict.

**No `package.json` change** (Google Books is plain `fetch`; React Query + expo-image already present) — one fewer collision point with A5.

**Verified**
- `tsc --noEmit` clean; `eslint .` clean (same generated-`router.d.ts` warning); `expo export --platform web` bundles all 21 routes incl. `/search` + `/item/[id]`.
- `canonicalize()` exercised offline on 8 synthetic Oathbringer editions → collapses to 1 canonical work (most-complete winner), order preserved, distinct title/author variants correctly kept separate. **Known trade-off:** a subtitle variant (e.g. *"Oathbringer (Book Three…)"*) forms its own group — acceptable for the MVP's deliberately-simple D5 approach.
- Add-to-TBR write path verified by RLS policy + trigger (no live-DB mutation): `recs_insert_valid` explicitly permits `(sender_id is null and recipient_id = auth.uid())`; `items_insert/update_auth` permit the upsert; `handle_new_recommendation` auto-creates `rec_status('to_read')` and skips notification for a null sender; `recommendations_selfadd_unique` gives idempotency.

**⚠️ Not verified — needs Rob on-device:** live Google Books search. The build sandbox's network egress is attributed to a Google Cloud project with a per-day Books quota of **0**, so every call 429s here regardless of code. On a real phone / residential network the keyless endpoint works within the normal unauthenticated limit. Acceptance check for Rob (Expo Go, seeded login): search **"oathbringer"** → one entry (not many editions) with covers → tap → detail renders → **Add to my TBR** flips to "On your TBR ✓"; confirm a `recommendations` row (`sender_id NULL`) + `rec_status('to_read')` appear. If quota bites in real use, drop a key into `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY`.

---

## Core-loop wave (A5-send, A6, A7, S10) — added 2026-07-19

Built on `main` after A4 landed, completing the send → receive → status → ping loop.
Theme-token-only, reuses A2 components, disjoint files from A4. New deps:
`expo-clipboard`, `expo-notifications` (both SDK-57 pinned, Expo Go compatible).

- **A6 TBR + status.** `lib/tbr.ts` groups a user's `recommendations` (recipient = me)
  into one card per book with combined recommenders; `useSetStatus` writes every rec row
  for the book. S3 `(tabs)/tbr.tsx` (pills, search link, cards, per-card status entry);
  S9 `status.tsx` sheet (reaction + note on Finished). `lib/embed.ts` normalizes
  PostgREST to-one vs to-many embeds — also fixed a latent `friends.ts` bug where
  `rec_status` was read as an array (`[0]`) but comes back as an object, so status could
  silently be null.
- **A5 send (S6).** `lib/send.ts` (`useSendRecommendations`, 23505 → "already sent";
  `useRecommendedTo` for U15). `share.tsx` resolves the route id → item uuid (ensuring
  fresh `gb:` books via A4's `ensureItem`), multi-selects friends, sends w/ note + toast,
  and copies a public link. Book detail (A4's screen) now passes the item param to
  `/share` and renders the U15 "Recommended to…" badge.
- **A7 inbox (S8).** `lib/notifications.ts` + `(tabs)/inbox.tsx`: live in-app inbox with
  read state, mark-read/all, and deep-links. `usePushRegistration` (mounted in
  `(tabs)/_layout.tsx`) registers the Expo token but **push delivery is gated on A8**
  (dev build + store accounts); it fails soft everywhere else.
- **S10 profile.** `(tabs)/profile.tsx`: edit display name + avatar (`useUpdateProfile`),
  show/copy invite code, sign out.

**Shared status/reaction copy** lives in `lib/status.ts`; the public share domain in
`lib/config.ts` — both are placeholders pending Rob (see `docs/DECISIONS_NEEDED.md`, the
new single home for input Rob still owes: app name, theme, voice/copy, avatars, domain).

**Verified:** `tsc --noEmit` clean; `eslint .` clean (0 errors; lone warning is generated
`.expo/types/router.d.ts`); `expo export --platform web` bundles all 21 routes. Every new
query checked against the **live seed** via the Supabase MCP (TBR grouping, recs-between,
inbox, invite codes, FK-embed shapes). On-device Expo Go pass (fonts, native Share, push)
remains Rob's, with a seeded login from `TEST_LOGINS.local.md`.

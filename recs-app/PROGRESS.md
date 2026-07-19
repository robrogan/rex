# Build Progress

| Brief | Status | Notes |
|---|---|---|
| A1 Scaffold | ✅ Done 2026-07-18 | Expo SDK 57, expo-router, TS strict, theme tokens from Figma, S1–S12 placeholder routes, eas.json (dev/preview/prod), ESLint+Prettier. Verified: tsc clean, eslint clean, `expo export --platform web` bundles all routes. App name/slug placeholder "Recs App (working title)" pending D1. |
| A2 Design system | ✅ Done 2026-07-19 | 8 components in `src/components/` (`Avatar`, `TabPill`, `PrimaryButton`/`SecondaryButton`, `SearchBar`, `TagChip`, `RecBadge`, `BookCard`) + barrel `index.ts`, matched to the Figma MVP Drafts `mvp/*` kit and the original Home/Detail card. Hidden `/dev/components` gallery renders every state. Theme reconciled (violet card outline, `description` 16/24, kit-accurate `radii`/`type` tokens). tsc + eslint clean; `expo export --platform web` bundles `/dev/components`. See "A2 design system built" below. |
| A3 Backend | ✅ Done 2026-07-19 | SQL migrations (schema/RLS/triggers/hardening), seed (2 users + 5 books), `push-fanout` Edge Function stub, `config.toml`; client wiring `lib/supabase.ts` + `lib/auth.tsx` (email OTP) + React Query + typed `types/database.ts`; functional OTP sign-in. **Live Supabase project connected** (ref `mipdevkjokgaamnulqvr`), migrations 1-5 + seed applied directly via the Supabase MCP and verified (row counts match seed exactly, triggers fire). Test logins in `recs-app/TEST_LOGINS.local.md` (gitignored, not in repo — ask Rob if you need them). See "Supabase backend connected & hardened" below. |
| A4 Search/detail | ⬜ | |
| A5 Friends/send | ⬜ | |
| A6 TBR/status | ⬜ | |
| A7 Notifications | ⬜ | |
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

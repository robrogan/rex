# Build Progress

| Brief | Status | Notes |
|---|---|---|
| A1 Scaffold | ✅ Done 2026-07-18 | Expo SDK 57, expo-router, TS strict, theme tokens from Figma, S1–S12 placeholder routes, eas.json (dev/preview/prod), ESLint+Prettier. Verified: tsc clean, eslint clean, `expo export --platform web` bundles all routes. App name/slug placeholder "Recs App (working title)" pending D1. |
| A2 Design system | ⬜ Not started (code) | Component code not begun (`src/components/` has only `Screen.tsx`). **Figma reference is now ready** (2026-07-19): `MVP Drafts` page + `mvp/*` kit + `description` token — build the A2 components to match it. See "Design reference (Figma)" below. |
| A3 Backend | 🟨 Code done 2026-07-19 · needs live project | SQL migrations (schema/RLS/triggers), seed (2 users + 5 books), `push-fanout` Edge Function stub, `config.toml`; client wiring `lib/supabase.ts` + `lib/auth.tsx` (email OTP) + React Query + typed `types/database.ts`; functional OTP sign-in. Verified vs Postgres 16: 21/21 checks — migrations apply, triggers fire, RLS isolates users (A can't read B's rows), dedupe + notification fan-out work. **Remaining (needs Rob):** create the free Supabase project, set `.env`, apply migrations + seed. See `docs/SUPABASE_SETUP.md`. |
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

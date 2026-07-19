# Agent Build Briefs — Recommendations App MVP (name TBD; "Rainbow" is a theme, not the name)

Each brief is self-contained and hand-off ready. Every agent should first read `MVP_SPEC.md` and `ARCHITECTURE.md` in this folder. Dependency order: A1 → A2 → (A3 ∥ A4) → A5 → A6 → A7 → A8. A3 can run in parallel with A1/A2.

Conventions for all briefs: TypeScript strict; Expo Router; theme tokens only (no hardcoded colors); every screen must run in Expo Go on both iOS and Android; commit per brief; update a `PROGRESS.md` at the repo root when done.

---

## A1 — Scaffold the app
Create a new Expo (latest SDK) TypeScript project named per D1 decision (placeholder: `rainbow`). Set up: Expo Router with route groups `(auth)` and `(tabs)`; placeholder screens for S1–S10 from `MVP_SPEC.md` §4; `lib/theme.ts` token file (colors/type/spacing per `ARCHITECTURE.md` §5); ESLint + Prettier; EAS config (`eas.json`) with development/preview profiles. Acceptance: `npx expo start` runs; navigation between all placeholder screens works on both platforms.

## A2 — Design system components
Implement in `components/`, matching the Figma export (screenshots in project knowledge): `BookCard` (cover, title, tag chips, recommender badge with stacked avatars "+N"), `TagChip`, `TabPill` (active = orange fill, inactive = outlined), `SearchBar`, `PrimaryButton`/`SecondaryButton` (pixel-style label face), `RecBadge`, `Avatar`. Build a hidden `/dev/components` gallery screen rendering all states. Fonts: serif display + pixel-style label face — pick free Google Fonts equivalents (e.g., a high-contrast serif + a pixel/mono face), load via `expo-font`, document choices. Acceptance: gallery screen matches the Figma look side-by-side.

## A3 — Backend (Supabase)
Create Supabase project; write SQL migrations for the schema in `ARCHITECTURE.md` §2; enable email (magic link or OTP) auth; RLS policies per §2 notes; DB triggers + Edge Function stub `push-fanout` for notification events; seed script with 2 test users and 5 books. Store keys in `.env` via `expo-constants`/EAS secrets — never commit. Acceptance: RLS verified with two test users (user A cannot read user B's private rows); seed loads.

## A4 — Search & book detail
`lib/googleBooks.ts` wrapper for Google Books `/volumes` search (debounced, paginated, canonical-work granularity per D5); search results screen S4 using `BookCard`; book detail screen S5 matching Figma (cover, title, author, tag chips, description, recommenders + notes). On selection, upsert into `items`. Acceptance: search "oathbringer" → detail screen renders with real data on both platforms.

## A5 — Friends, profiles & send-a-rec
Friends screen S7: show my invite code (share sheet), enter a code to connect, list friends. Friend profile S11: friend details + "recs between us" affordance (what I sent them / they sent me, with statuses) per U14. Send flow S6: from book detail, bottom sheet → multi-select friends → optional note (140 chars) → send → success toast; sheet also offers "Copy link" (public URL per A9). Book detail gains the "Recommended to…" avatar affordance (U15). Handle duplicate rec (same sender/item/recipient) gracefully. Acceptance: two test accounts connect via code; rec appears for recipient; both relational affordances render.

## A6 — TBR list & statuses
Home screen S3 exactly per Figma: header art + "What's next on your TBR?", category TabPills (Books active; Shows/Movies/Sites disabled with a subtle "soon"), search bar, BookCard list grouped/sorted by newest. Status sheet S9: To Read → Started → Finished / Not for me, with reaction (loved/liked/not for me + optional note) on finish. Group multiple recommenders of the same item ("Nick +1"). Acceptance: full status lifecycle persists and re-renders correctly.

## A7 — Notifications
Register Expo push tokens on login (store on `users`); implement `push-fanout` Edge Function: on new recommendation → push recipients; on status → started/finished → push sender with reaction summary; notification copy from D3 copy sheet. In-app inbox screen S8 backed by `notifications` table with read state. Acceptance: physical-device test — send rec from account A, push arrives on device B; finish on B, ping arrives on A.

## A9 — Public web share pages & deep links
Public route `/item/{id}` (Expo Router web output, or minimal Next.js if cleaner): renders static item content (title, cover, author, description) for anyone; dynamic content (ratings, comments, friend activity) replaced by a sign-up prompt. Supabase public read policy on static `items` fields only. Universal links/App Links so the URL opens the app when installed. "Copy link" in the S6 share sheet produces this URL. Acceptance: URL opens in an incognito browser showing static content + sign-up prompt; same URL on a phone with the app installed deep-links to the in-app detail screen.

## A8 — Builds & distribution
EAS production-ish builds: iOS → TestFlight (needs Rob's Apple Developer account), Android → internal testing track or direct APK for Leul. App icon + splash from the Figma flying-books illustration (export/request asset). Write `INSTALL.md` with exact steps for both founders. Acceptance: both founders have the app installed from a distributable build, push notifications work on both.

---

## Handoff notes for the orchestrator
- Give each agent this file + `MVP_SPEC.md` + `ARCHITECTURE.md` + the Figma export images.
- A2 and A6 benefit from direct Figma access (Figma MCP) to extract exact tokens — otherwise use the PNG/PDF exports in project knowledge.
- Founder-blocking decisions (D1, D3, D5 in `DISCOVERY_BRIEFS.md`) should be resolved before A1, A7, A4 respectively; placeholders are acceptable if noted in PROGRESS.md.

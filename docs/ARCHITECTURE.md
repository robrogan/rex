# Technical Architecture — Recommendations App MVP (name TBD)

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| App | React Native + Expo (SDK latest), TypeScript | One codebase → native iOS + Android; Expo Go for instant on-phone preview; EAS for store builds |
| Navigation | Expo Router | File-based, standard |
| State/data | React Query + Supabase JS client | Simple, cache-friendly |
| Backend | Supabase (Postgres + Auth + Realtime + Edge Functions) | Free tier fits MVP; auth, DB, and row-level security in one place; no server to run |
| Book data | Google Books API (`/volumes?q=`) | Free, no key required for basic search, covers included |
| Push | Expo Push Notifications + Supabase Edge Function trigger | Works on both platforms with one API |
| Builds | EAS Build → TestFlight (iOS) + internal track/APK (Android) | Two-founder distribution |
| Public share pages | Expo Router web output (same codebase) or a minimal Next.js site; `/item/{id}` renders static content (title, cover, description) publicly; dynamic content gated behind sign-up | TikTok-style link sharing is the adoption engine — no walled garden |
| Deep links | Universal links / App Links so a shared URL opens the app if installed, web page if not | Standard `expo-linking` + associated domains |

Verify current versions/quotas at build time (agents should check Expo + Supabase docs; do not trust this doc for version numbers).

## 2. Data model

```
users            id, display_name, avatar, invite_code (unique 6-char), expo_push_token, created_at
friendships      id, user_a, user_b, created_at            -- one row per pair, a<b
items            id, category ('book'), source ('google_books'), source_id,
                 title, authors[], cover_url, description, tags[], created_at
                 -- cache of external data; user-generated items possible later
recommendations  id, item_id, sender_id (nullable = self-added), recipient_id,
                 note, created_at
rec_status       id, recommendation_id, status ('to_read'|'started'|'finished'|'not_for_me'),
                 reaction ('loved'|'liked'|'not_for_me' null), reaction_note, updated_at
notifications    id, user_id, type ('rec_received'|'rec_started'|'rec_finished'),
                 recommendation_id, read, created_at
```

Notes:
- "Nick +1 / 3+ Friendos" UI = multiple `recommendations` rows for the same `item_id` + `recipient_id`; group in the query.
- Self-added TBR items are `recommendations` with `sender_id = null`.
- Row-level security: users read/write only rows where they are sender, recipient, or friend-pair member.

## 3. Key flows

**Send a rec:** search Google Books → upsert `items` → insert `recommendations` (one per recipient) → DB trigger → Edge Function sends Expo push to each recipient → insert `notifications`.

**Status change:** recipient updates `rec_status` → trigger → push to sender ("Leul finished the book you recommended!") when status = started/finished → insert sender `notifications`.

**Friend connect:** user enters friend's invite code → insert `friendships` (both users notified).

**Public share:** detail page share sheet offers (a) send to registered friends in-app, or (b) copy public URL `https://<domain>/item/{id}`. URL renders static item data for anyone; ratings/comments/activity render only for signed-in users, with a sign-up prompt. Requires a public read policy on `items` (static fields only) — recommendation/status/activity tables stay private.

**Relational sent-tracking queries:** friend profile → `recommendations WHERE (sender, recipient) = (me, friend) OR (friend, me)` joined to status; book detail → `recommendations WHERE sender = me AND item = this` for the "Recommended to…" affordance.

## 4. Project structure (target)

```
app/            # expo-router screens: (auth)/, (tabs)/index (TBR), search, book/[id], friends, inbox
components/     # BookCard, TagChip, RecBadge, StatusSheet, ...
lib/            # supabase.ts, googleBooks.ts, notifications.ts, theme.ts
supabase/       # migrations/, functions/ (push-fanout)
```

## 5. Theming (exact tokens extracted from the Figma file's variables)

- Colors ("rainbow" theme): `bg-color #4B0082` (field), `Primary 400 #FFA500` (orange accent), `Primary 800 #241C47`, `font #EE82EE` (violet text), `font on primary #F6F5F5`, description text `#F5C4DE`.
- Type styles: `Title` = Crimson Pro Light 60/60, letter-spacing −3; `body` = Manrope Medium 18/22; `action` (buttons/tags/tabs) = Pixelify Sans Regular 18; long description passages use Goudy Bookletter 1911.
- All four families are free Google Fonts — load via `expo-font`.
- Theme system: light / dark / rainbow are planned user-selectable themes ("Welcome, choose a path" screen). Light/dark = restrained minimal palettes; rainbow = the vibrant style above. MVP ships one.
- Components: 1px light-outlined cards on purple, pill tab buttons (active = orange fill), tag chips, stacked-avatar "+N" recommender badge.
- Implement as a single `theme.ts` token file so the post-MVP light/dark/rainbow picker is a token swap, not a rewrite.

## 6. Platform-specific notes

- iOS push requires an Apple Developer account ($99/yr) and a real device (Rob's iPhone).
- Android: back-button handling and edge-to-edge insets need a QA pass.
- Expo Go is fine for development; push notifications need a development build (EAS) to fully test.

## 7. Costs (MVP)

Supabase free tier: $0 · Google Books: $0 · Expo/EAS free tier: $0 (build queue is slower) · Apple: $99/yr · Google Play: $25 once.

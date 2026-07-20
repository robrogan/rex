# Decisions Needed — for Rob (pick up when you start giving input)

The foundation is being built to spec with sensible placeholders. This file is the
single place where your input is genuinely needed — nothing here blocks further
plumbing, but each affects the final feel. Grouped by "quick taste call" vs
"blocked on you". Referenced against `DISCOVERY_BRIEFS.md` decision IDs where they exist.

## A. Still open from the original discovery briefs
- **D1 — App name & slug.** Still `"Recs App (working title)"` (placeholder in `app.json`).
  Everything else that says "Recs" / the share domain flows from this.
- **Theme for MVP.** One theme ships; the vibrant purple "rainbow" is what's coded now
  (`lib/theme.ts`). Confirm rainbow for MVP (light/dark come later as a token swap).
- **D3 — Copy / voice.** All user-facing strings are placeholder-grade: inbox lines
  ("Leul sent you Oathbringer"), status labels ("To read/Started/Finished/Not for me"),
  reactions ("Loved it/Liked it"), the send toast ("Sent to 2 friends! 🎉"), empty
  states. Centralized in `lib/status.ts` + the screens. Hand me your voice and I'll do a
  pass.
- **D5 — Search granularity.** A4 collapses editions to one "canonical work" per book.
  Worth eyeballing with real searches to confirm it feels right.

## B. New taste calls surfaced while building the foundation
1. **Public share domain.** `lib/config.ts` `PUBLIC_BASE_URL` is `https://example.com`
   (placeholder). The "Copy public link" button and the A9 web pages need the real
   domain — tied to D1. Set `EXPO_PUBLIC_PUBLIC_BASE_URL` once it exists.
2. **Status when >1 friend recommends the same book.** The TBR shows **one card per
   book** ("Nick +1"); changing its status writes **all** the underlying recommendation
   rows so the card stays coherent. Confirm that's what you want (vs. a separate status
   per sender).
3. **Avatars.** Profile (S10) currently accepts an **emoji or an image URL** as the
   avatar; `Avatar` falls back to initials. Options for MVP: emoji-only picker, real
   photo upload (needs Supabase Storage), or leave as the text field. Your call.
4. **Reactions.** The status sheet offers a reaction (loved / liked / not for me) only
   when you mark a book **Finished**; choosing the **Not for me** status auto-sets that
   reaction. Confirm you don't want reactions on other states.
5. **Status entry from a book's detail page.** Updating status lives on the **TBR list**
   (where the recommendation exists). From a book's detail page the "Update status" link
   shows a hint to open it from your TBR. Fine, or should detail-page status work for
   books already on your TBR?
6. **Naming/labels.** Tabs are **TBR / Friendos / Inbox / Me**, with "friendo" copy
   throughout, and categories **Books** (active) + Shows/Movies/Sites ("soon"). Keep,
   rename, or reorder?

## C. Blocked on accounts / hardware (you + brief A8)
- **Push notification delivery.** The code is in place — devices register an Expo push
  token, and DB triggers fan out on send / status-change — but actually *delivering* a
  push needs a **development build** plus an **Apple Developer account ($99/yr)** and
  **Google Play ($25 once)**. The in-app inbox works today without any of that.
- **On-device visual QA.** Real fonts + native feel need Expo Go on your phone (seeded
  login in `recs-app/TEST_LOGINS.local.md`). This is the only way to confirm the pixel
  match to Figma.
- **Accounts to create** (from `PLAN.md` §1): Expo, Supabase (done), Apple Developer,
  Google Play.

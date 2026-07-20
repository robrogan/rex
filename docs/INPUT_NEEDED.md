# Input Needed — Rob's decision & action backlog

> Single place for everything that's waiting on **you** (Rob), so agents can keep building foundation without blocking. Updated 2026-07-19 after A4. Each item says what it blocks and what "done" looks like. Cross-refs: original decisions in `DISCOVERY_BRIEFS.md`, briefs in `AGENT_BRIEFS.md`, code state in `recs-app/PROGRESS.md`.

## Where the build stands (2026-07-19)
Foundation on `main`: **A1** scaffold · **A2** design system · **A3** backend (live Supabase, hardened) · **A4** search + book detail + add-to-TBR · **A5** *partial* (friends/invite-code/recs-between-us; send-sheet + "Recommended to…" deferred to sit on A4's detail screen). Remaining core-loop work — **A6** TBR/status home, rest of **A5**, **A7** notifications — plus **A9** share pages and **A8** builds. See the "Remaining foundation" table at the bottom.

---

## A. Decisions that unblock build work

### D1 — App name, bundle identity, domain, theme  *(blocks: final identity, A8 builds, A9 domain)*
Still open. Everything currently uses placeholders (`name: "Recs App (working title)"`, `slug: recs-app`, `scheme: recsapp`, GitHub repo `rex`).
- [ ] **Name** (can be temporary — just pick one everything hardcodes).
- [ ] **Bundle IDs** for the stores (e.g. `com.<you>.<app>` iOS / Android) — needed before A8.
- [ ] **Domain** you'd accept for share links (`https://<domain>/item/{id}`) — needed before A9's links are real.
- [ ] **Theme for MVP:** confirm rainbow-first (yes/no). Light/dark + the picker stay deferred.
- *Done = one line in a shared note: name + bundle id + domain + theme.*

### D3 — The "gratifying ping" copy  *(blocks: A7 final notification text)*
The notification is the product's soul. Draft the real strings (2–3 voices, pick one) for: rec received · rec started · rec finished (+ reaction) · optional gentle nudge. **Placeholder copy is already live** in `supabase/functions/push-fanout/index.ts` (`messageFor`), so A7 can be built and just swap strings.
- *Done = a copy sheet; I'll drop it into `messageFor`.*

### D2 — Inspiration for the still-undesigned screens  *(informs: A5 send-sheet, A6 home, A8 icon/splash, S8 inbox, S9 status sheet)*
2–3 reference screenshots per screen (Letterboxd, StoryGraph, Beli, Airbuds, iMessage share sheet…) + one line on what you like. Feeds Figma drafts I can then match.
- *Done = a folder/FigJam board of refs.*

### D5 — Edition granularity  *(A4)*  ✅ **DECIDED: canonical work only** — no edition picker. Implemented.

---

## B. Taste / customization calls (no rush — flagged so you can shape them)

- [ ] **Home / TBR screen (A6)** — this is the screen you'll most want to design. I've deliberately *not* built it yet so you can define it first. When ready: grouping, sort order, the "Nick +1" stacked-recommender treatment, empty state.
- [ ] **A4 search-result rows** — currently reuse the big `BookCard`. The Figma S4 draft has a more compact row; say the word if you want the compact version.
- [ ] **Canonical dedup edge case** — search dedup keys on *title + first author*, so a subtitled edition (e.g. *"Oathbringer (Book Three of the Stormlight Archive)"*) shows as its own entry alongside plain *"Oathbringer."* Fine for MVP? If you want tighter merging, that's a tuning pass.
- [ ] **Reaction UX (A6/A7)** — loved / liked / not-for-me + optional note: how prominent, when prompted.

---

## C. Accounts & paid setup you must create  *(blocks: A7 device push, A8 builds)*

- [ ] **Apple Developer account** ($99/yr) — required for TestFlight + iOS push on your iPhone.
- [ ] **Google Play Console** ($25 once) — internal testing track / APK for Leul.
- [ ] **Expo/EAS account** — free tier fine; needed for `eas build`.
- [ ] *(optional)* **Google Books API key** — search works keyless, but the shared keyless quota is low. If you hit rate limits, create a key (Cloud Console → enable "Books API" → API key) and set `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` in `.env` (already wired + documented in `.env.example`).
- Supabase — ✅ already set up + connected.

---

## D. On-device verification handoffs (things I can't test from the build sandbox)

- [ ] **A4 live search** — the build sandbox's network is on a zero-quota Google Cloud egress, so every Books API call 429s here regardless of code. On your phone (Expo Go, seeded login from `recs-app/TEST_LOGINS.local.md`): search **"oathbringer"** → one entry with a cover → tap → detail renders → **Add to my TBR** flips to "On your TBR ✓". Logic (dedup, DB write path via RLS+triggers) is verified offline; only the live network call is unverified.
- [ ] **A5 friends** — Expo Go check of the invite-code share sheet + fonts (per its PROGRESS note).
- [ ] **A7 push** — requires a real device + an EAS dev build (Expo Go can't fully do push).

---

## Remaining foundation — what's safe to build now vs. waiting on you

| Brief | Buildable now without you? | Blocked on |
|---|---|---|
| A5 rest (send-sheet, U15) | ✅ yes (sits on A4 detail) | — (in flight by another agent) |
| A6 TBR/status home | ⚠️ functionally yes, but **design-heavy** | your taste calls (B) — recommend you define it first |
| A7 notifications | 🟡 client token-registration + webhook wiring buildable; **needs device to verify** + D3 for final copy | device (C), D3 copy |
| A9 share pages + deep links | 🟡 web page + `lib/links.ts` buildable; the public-read `items` policy is **already done** | domain (D1) for real URLs |
| A8 builds & distribution | ❌ no | Apple/Google/EAS accounts (C), D1 bundle ids |

**Note on parallel agents:** builds are currently running in a shared working tree, so I've kept A4 to isolated files and committed early to avoid clobbering in-flight work. If you want heavier parallel build-out, isolated git worktrees per agent would remove the collision risk.

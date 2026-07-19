# Recommendations App (name TBD) — MVP Master Plan

> Naming note: "Rainbow" is NOT the app name — it's one of three planned color themes (light / dark / rainbow). Light and dark are restrained, minimal palettes; rainbow is the high-saturation vibrant style seen in the current purple Figma screens. App name is still an open decision (D1).

> A social recommendation tracker. Search a book, send it to a friend, get a gratifying ping when they actually follow through.
>
> **Team:** Rob (iPhone) + Leul (Android) + Claude/agents
> **Stack decision:** React Native + Expo — one codebase, native app on both platforms
> **MVP scope:** Books only. Other categories (Shows, Movies, Sites) visible as disabled tabs.
> **First milestone:** A working app installed on both founders' phones where they can send each other book recommendations and mark them done.

---

## 1. Where we are today

| Asset | Status |
|---|---|
| Concept & core loop ("Follow through / A better friendship / Search and Send") | ✅ Clearly articulated in Figma onboarding cards |
| Market research + SWOT | ✅ Done (concept-stage) |
| Monetization brainstorm | ✅ Done (no decision needed for MVP — correctly deferred) |
| Visual direction | 🟡 "Rainbow" purple theme + light/dark/rainbow theme-picker concept; typography and button styles explored |
| Screens designed | 🟡 3 of ~9: onboarding cards, home/browse ("What's next on your TBR?"), book detail |
| Name | ❌ Open. "Rainbow" = theme name, "Read.um" = placeholder. Real name needed (D1) |
| Flows (send rec, receive rec, mark finished, friend connect) | ❌ Not designed |
| Data model / architecture | ❌ Not defined → drafted in `ARCHITECTURE.md` |
| Code | ❌ None |

## 2. The core loop (what the MVP must prove)

1. Rob searches a book → sends it to Leul with an optional note.
2. Leul sees it on his TBR list (in-app + push notification).
3. Leul marks it **Started** → **Finished**, adds a quick reaction.
4. Rob gets the gratifying ping: "Leul finished the book you recommended!"

Everything not needed for this loop is out of scope (see `MVP_SPEC.md` §5).

## 3. Phased roadmap

### Phase 0 — Decisions & discovery (this week, humans)
- Rob + Leul: pick the app name, and pick which single theme ships in the MVP (rainbow is furthest along; light/dark + the picker come post-MVP). → `DISCOVERY_BRIEFS.md`
- Rob + Leul: gather inspiration screenshots for the 6 missing screens (send flow, TBR states, notifications). → `DISCOVERY_BRIEFS.md`
- Claude: everything in Phase 1 can start in parallel — no blocking dependency on the name.

### Phase 1 — Foundations (agents, ~parallel)
- **A1: Scaffold** Expo app: navigation, theming tokens from Figma, EAS setup so both phones can install builds. → `AGENT_BRIEFS.md#a1`
- **A2: Design system** in code: colors, type (serif display + pixel-style labels), buttons, book card, tag chips — matched to the Figma export. → `AGENT_BRIEFS.md#a2`
- **A3: Backend** setup (Supabase): schema from `ARCHITECTURE.md`, auth, row-level security. → `AGENT_BRIEFS.md#a3`
- Rob/Leul: create free accounts the project needs — Expo, Supabase, Apple Developer ($99/yr, needed for TestFlight/push on iPhone), Google Play ($25 one-time). Google Books API needs no key for basic search.

### Phase 2 — Core loop build (agents, sequential-ish)
- **A4: Search & book detail** — Google Books API, matches existing Figma screens.
- **A5: Send-a-rec flow** — pick friend → add note → send. Friend connect via invite code (simplest possible: share a 6-char code).
- **A6: TBR list & statuses** — home screen from Figma, To Read / Started / Finished, reactions.
- **A7: Notifications** — Expo push: "new rec received," "friend finished your rec."
- **A9: Public web share pages** — copyable `/item/{id}` URLs: static content public, dynamic content behind sign-up; deep links into the app. This is the adoption engine (TikTok-style sharing).

### Phase 3 — On phones (founders + one agent)
- **A8: Builds & install** — EAS build, TestFlight (Rob) + APK/internal track (Leul).
- Rob + Leul: dogfood for 2 weeks. Send each other real recommendations. Log friction in a shared note.

### Phase 4 — Iterate (repeat)
- Fix the top 5 friction items, then invite 3–5 real friends each ("3+ Friendos" is literally in your UI — go get them).

## 4. Who does what

| Owner | Responsibilities |
|---|---|
| **Rob & Leul** | Name decision, design inspiration, account setup, dogfooding, recruiting test friends, taste calls on UI |
| **Claude (this session, on request)** | Any doc in this pack, decision matrices, Figma work via the Figma MCP (can generate the 6 missing screens in your existing style), API research |
| **Build agents** | Briefs A1–A8 in `AGENT_BRIEFS.md` — each is self-contained and hand-off ready |

## 5. Cross-platform reality check (your worry, addressed)

React Native + Expo means you write the app once in TypeScript and it compiles to a real native app on both iOS and Android — not a website in a wrapper. Expo Go lets both of you preview work-in-progress on your own phones by scanning a QR code within minutes of the first commit. The main platform-specific costs are: Apple's $99/yr developer account, and ~1 day of per-platform polish (safe areas, back-button behavior on Android). For a 2-person MVP this is the lowest-risk path by a wide margin.

## 6. Risks

- **Empty-app problem:** the app is only fun with ≥2 people. Mitigation: MVP is built for you two, and public share URLs (A9) let recs reach non-users, pulling them toward sign-up.
- **Scope creep:** chain-reaction maps, gamification, themes, monetization are all documented and all deferred. The MVP spec's out-of-scope list is the contract.
- **Name/branding drift:** decide once in Phase 0; agents will hardcode it everywhere.

## 7. File map

| File | Purpose |
|---|---|
| `PLAN.md` | This file — the roadmap |
| `MVP_SPEC.md` | Product spec: stories, screens, out-of-scope |
| `ARCHITECTURE.md` | Stack, data model, APIs, notifications |
| `DISCOVERY_BRIEFS.md` | Concrete homework for Rob & Leul |
| `AGENT_BRIEFS.md` | Copy-paste-ready prompts for build agents (A1–A8) |

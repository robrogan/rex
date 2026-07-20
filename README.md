# Recommendations App

Track the recommendations friends give you, follow through on them, and give your friends the satisfaction of knowing you did.

Recommenders get a gratifying ping when their pick lands. Recipients get one place for every "you HAVE to read this" instead of forgotten dinner conversations.

---

## 🤖 For AI collaborators (Claude & other LLMs) — read this first

If you're an AI agent helping someone work on this repo, read this whole section before touching anything. It tells you what to read, who you're working with, and the rules for two people (and two AI agents) sharing one codebase.

### Who's who

- **Rob** (`robrogan`) — owner, **product designer**, and the person whose decisions are final on anything to do with product, naming, visual design, and copy. Rob also drives his **own Claude instance** on this repo, so at any moment there may be **two AI agents committing to the same project**.
- **Leul** — collaborator. If you're reading this on Leul's machine, **you are Leul's agent.** Rob's design work is the visual source of truth; treat Figma and the docs below as the spec, not something to reinvent.

### Read these, in this order

1. **`recs-app/PROGRESS.md`** — the living build log. Start here: it's the single most current picture of *what already exists*, what's verified, and what's still Rob-only. Every build wave is logged here.
2. **`docs/MVP_SPEC.md`** — the product: one-liner, user stories, screen inventory (S1–S12), the core loop.
3. **`docs/ARCHITECTURE.md`** — stack, data model, key flows.
4. **`docs/AGENT_BRIEFS.md`** — the A1–A9 build briefs and their dependency order.
5. **`docs/DECISIONS_NEEDED.md`** and **`docs/INPUT_NEEDED.md`** — decisions and actions that are **Rob's to make** (app name, public domain, theme, voice/copy, avatars). The code ships **placeholders** for these on purpose. **Do not invent them.**
6. **`recs-app/AGENTS.md`** — ⚠️ this project is on **Expo SDK 57**. Read the exact versioned docs (`https://docs.expo.dev/versions/v57.0.0/`) before writing app code; Expo's API has changed across versions.
7. **`recs-app/QUICKSTART_LEUL.md`** — how to actually run the app on a phone (Expo Go).
8. **Figma** — visual source of truth. File `Recommendation-App-Designs`, key `T4qrt18lCu5elAPofAz2jm`, page **MVP Drafts** covers all 12 screens. Match it; don't freelance the visuals — that's Rob's lane.

### Rules for two people on one repo

- **The Supabase backend is LIVE and SHARED.** Both Rob's and Leul's `.env` point at the **same** production project (`mipdevkjokgaamnulqvr`) — same data, same auth. Schema changes are applied *directly* to that live DB (historically via the Supabase MCP). So: **migrations and SQL affect everyone immediately.** Never run a destructive migration, reset, or seed without explicit sign-off from Rob. Mirror every schema change to `recs-app/supabase/migrations/` on disk so it's reproducible.
- **Secrets are not in the repo.** `.env` (Supabase keys) and `recs-app/TEST_LOGINS.local.md` (seeded test accounts) are gitignored. Leul gets both **from Rob directly** — don't commit them, don't paste them into chat logs or PRs.
- **Branch per unit of work; land on `main`.** Work happens on a branch (e.g. `a9-web-share`), then merges to `main`. When two agents build in parallel, **keep file overlap near zero** — that's how the A4/A5 waves stayed conflict-free (they deliberately touched disjoint files). Before starting something big, check `git log` and `PROGRESS.md` so you're not colliding with Rob's agent.
- **Communicate through the repo.** `PROGRESS.md` + clear commit messages are how the two agents (and two humans) stay in sync. Log what you built, what you verified, and what's left — the way every existing entry does.
- **Verify before you claim done.** The bar used throughout this project: `tsc --noEmit` clean, `eslint .` clean, and `expo export --platform web` bundles all routes. Some things (live Google Books search, push delivery, on-device fonts) **can't be verified in a sandbox** and are explicitly left as on-device checks for Rob — flag those rather than asserting they work.
- **Product/design/naming decisions belong to Rob.** If something needs the app name, a real domain, a theme choice, or user-facing copy and you only have a placeholder, leave the placeholder and note it in `docs/DECISIONS_NEEDED.md` — don't decide it yourself.

---

## Repo structure

```
recs-app/   Expo (React Native + TypeScript) app — see recs-app/README.md and recs-app/INSTALL.md
docs/       Product spec, architecture, plan, and setup docs
```

## Docs

- [`recs-app/PROGRESS.md`](recs-app/PROGRESS.md) — **current build state** (read this first for "what exists")
- [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md) — product spec, user stories, screen inventory
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, data model, key flows
- [`docs/AGENT_BRIEFS.md`](docs/AGENT_BRIEFS.md) — A1–A9 build briefs + dependency order
- [`docs/DECISIONS_NEEDED.md`](docs/DECISIONS_NEEDED.md) / [`docs/INPUT_NEEDED.md`](docs/INPUT_NEEDED.md) — open decisions/actions owned by Rob
- [`docs/PLAN.md`](docs/PLAN.md) — build plan
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — backend setup
- [`docs/DEFERRED_TASKS.md`](docs/DEFERRED_TASKS.md) — explicitly out of scope for MVP
- [`recs-app/QUICKSTART_LEUL.md`](recs-app/QUICKSTART_LEUL.md) — run the app on your phone

## Stack

React Native + Expo (TypeScript, **SDK 57**), Expo Router, React Query, Supabase (Postgres + Auth + Realtime + Edge Functions), Google Books API for search, Expo Push Notifications.

## Getting started

See [`recs-app/INSTALL.md`](recs-app/INSTALL.md) for setup and [`recs-app/QUICKSTART_LEUL.md`](recs-app/QUICKSTART_LEUL.md) for the phone-preview walkthrough, then [`recs-app/README.md`](recs-app/README.md) for day-to-day Expo commands.

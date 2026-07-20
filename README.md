# Recommendations App

Track the recommendations friends give you, follow through on them, and give your friends the satisfaction of knowing you did.

Recommenders get a gratifying ping when their pick lands. Recipients get one place for every "you HAVE to read this" instead of forgotten dinner conversations.

---

## 🤖 For AI collaborators (Claude & other LLMs) — read this first

If you're an AI agent helping work on this repo, read this whole section before touching anything. It tells you what to read and the rules for a shared codebase that multiple people (and multiple AI agents) commit to. **Figma and the docs below are the spec — treat them as the source of truth, not something to reinvent.**

### Read these, in this order

1. **`recs-app/PROGRESS.md`** — the living build log. Start here: it's the single most current picture of *what already exists*, what's verified, and what's still pending human action. Every build wave is logged here.
2. **`docs/MVP_SPEC.md`** — the product: one-liner, user stories, screen inventory (S1–S12), the core loop.
3. **`docs/ARCHITECTURE.md`** — stack, data model, key flows.
4. **`docs/AGENT_BRIEFS.md`** — the A1–A9 build briefs and their dependency order.
5. **`docs/DECISIONS_NEEDED.md`** and **`docs/INPUT_NEEDED.md`** — decisions and actions that are the **team's to make** (app name, public domain, theme, voice/copy, avatars). The code ships **placeholders** for these on purpose. **Do not invent them.**
6. **`recs-app/AGENTS.md`** — ⚠️ this project is on **Expo SDK 57**. Read the exact versioned docs (`https://docs.expo.dev/versions/v57.0.0/`) before writing app code; Expo's API has changed across versions.
7. **`recs-app/QUICKSTART_LEUL.md`** — how to actually run the app on a phone (Expo Go).
8. **Figma** — visual source of truth. File `Recommendation-App-Designs`, key `T4qrt18lCu5elAPofAz2jm`, page **MVP Drafts** covers all 12 screens. Match it; don't freelance the visuals.

### Rules for collaborating on this repo

- **The Supabase backend is LIVE and SHARED.** Every collaborator's `.env` points at the **same** production project (`mipdevkjokgaamnulqvr`) — same data, same auth. Schema changes are applied *directly* to that live DB (historically via the Supabase MCP). So: **migrations and SQL affect everyone immediately.** Never run a destructive migration, reset, or seed without coordinating with the team first. Mirror every schema change to `recs-app/supabase/migrations/` on disk so it's reproducible.
- **Secrets are not in the repo.** `.env` (Supabase keys) and `recs-app/TEST_LOGINS.local.md` (seeded test accounts) are gitignored. Get them from a teammate who already has them — don't commit them, don't paste them into chat logs or PRs.
- **Branch per unit of work; land on `main`.** Work happens on a branch, then merges to `main`. When multiple agents build in parallel, **keep file overlap near zero** — that's how the A4/A5 waves stayed conflict-free (they deliberately touched disjoint files). Before starting something big, check `git log` and `PROGRESS.md` so you're not colliding with another agent's work.
- **Communicate through the repo.** `PROGRESS.md` + clear commit messages are how everyone stays in sync. Log what you built, what you verified, and what's left — the way every existing entry does.
- **Verify before you claim done.** The bar used throughout this project: `tsc --noEmit` clean, `eslint .` clean, and `expo export --platform web` bundles all routes. Some things (live Google Books search, push delivery, on-device fonts) **can't be verified in a sandbox** and are explicitly left as on-device checks for a human — flag those rather than asserting they work.
- **Product, design, and naming decisions belong to the team, not the agent.** If something needs the app name, a real domain, a theme choice, or user-facing copy and you only have a placeholder, leave the placeholder and note it in `docs/DECISIONS_NEEDED.md` — don't decide it yourself.

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
- [`docs/DECISIONS_NEEDED.md`](docs/DECISIONS_NEEDED.md) / [`docs/INPUT_NEEDED.md`](docs/INPUT_NEEDED.md) — open product decisions still to be made
- [`docs/PLAN.md`](docs/PLAN.md) — build plan
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — backend setup
- [`docs/DEFERRED_TASKS.md`](docs/DEFERRED_TASKS.md) — explicitly out of scope for MVP
- [`recs-app/QUICKSTART_LEUL.md`](recs-app/QUICKSTART_LEUL.md) — run the app on your phone

## Stack

React Native + Expo (TypeScript, **SDK 57**), Expo Router, React Query, Supabase (Postgres + Auth + Realtime + Edge Functions), Google Books API for search, Expo Push Notifications.

## Getting started

See [`recs-app/INSTALL.md`](recs-app/INSTALL.md) for setup and [`recs-app/QUICKSTART_LEUL.md`](recs-app/QUICKSTART_LEUL.md) for the phone-preview walkthrough, then [`recs-app/README.md`](recs-app/README.md) for day-to-day Expo commands.

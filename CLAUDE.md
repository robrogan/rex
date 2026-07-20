# Project instructions for AI agents

**Read the "🤖 For AI collaborators" section of [`README.md`](README.md) before doing anything.** It covers who's who (Rob = owner/product designer with his own Claude instance; you may be Leul's agent), which docs to read and in what order, and the rules for two people + two AI agents sharing one repo.

Fast facts:
- **Shared LIVE Supabase backend** (`mipdevkjokgaamnulqvr`) — both `.env`s hit the same production DB. Never run destructive SQL/migrations/resets without Rob's sign-off; mirror schema changes to `recs-app/supabase/migrations/`.
- **Secrets** (`.env`, `recs-app/TEST_LOGINS.local.md`) are gitignored — get them from Rob, never commit them.
- **Expo SDK 57** — read `recs-app/AGENTS.md` and the versioned Expo docs before writing app code.
- **Current state** lives in `recs-app/PROGRESS.md`. **Product/naming/design decisions are Rob's** — code uses placeholders (see `docs/DECISIONS_NEEDED.md`); don't invent them.
- **Verify before claiming done:** `tsc --noEmit`, `eslint .`, `expo export --platform web`.

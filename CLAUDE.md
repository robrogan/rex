# Project instructions for AI agents

**Read the "🤖 For AI collaborators" section of [`README.md`](README.md) before doing anything.** It covers which docs to read and in what order, and the rules for a shared repo that multiple people and AI agents commit to. Figma and the docs are the spec — don't reinvent them.

Fast facts:
- **Shared LIVE Supabase backend** (`mipdevkjokgaamnulqvr`) — every `.env` hits the same production DB. Never run destructive SQL/migrations/resets without coordinating with the team; mirror schema changes to `recs-app/supabase/migrations/`.
- **Secrets** (`.env`, `recs-app/TEST_LOGINS.local.md`) are gitignored — get them from a teammate, never commit them.
- **Expo SDK 57** — read `recs-app/AGENTS.md` and the versioned Expo docs before writing app code.
- **Current state** lives in `recs-app/PROGRESS.md`. **Product/naming/design decisions belong to the team** — code uses placeholders (see `docs/DECISIONS_NEEDED.md`); don't invent them.
- **Verify before claiming done:** `tsc --noEmit`, `eslint .`, `expo export --platform web`.

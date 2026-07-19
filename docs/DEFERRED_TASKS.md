# Deferred Tasks — pick up after token limits reset

Context: 2026-07-18 session was Fable-only (other models capped at 93% utilization). These items were deferred because they're better suited to parallel/other-model agents, not because they're blocked.

1. **Parallel build fan-out (A1–A8, A9)** — once limits reset, the briefs in `AGENT_BRIEFS.md` can be dispatched to separate agents in dependency order (A1 → A2 → A3∥A4 → A5 → A6 → A7 → A9 → A8) instead of built serially.
2. **Independent verification pass** — a separate agent should review the plan pack + any code produced this session with fresh eyes (spec/architecture consistency, RLS policy audit).
3. ~~**Figma screen drafts (S2, S4, S6–S9)**~~ — ✅ Done 2026-07-19. Drafted on the new **MVP Drafts** page (S2, S4, S6, S7, S8, S9) with a local `mvp/*` component kit + a `description` color variable & Goudy text style; existing pages untouched. Now the visual reference for A2/A4/A5/A6 — see `recs-app/PROGRESS.md` → "Design reference (Figma)".
4. **Bulk asset work** — exporting/optimizing the flying-books illustration, app icon variants, splash screens.

Figma kickoff prompt (for Claude Code once write access works):
> Read docs/PLAN.md, docs/MVP_SPEC.md, and docs/ARCHITECTURE.md. Then use the Figma MCP to create a new page called "MVP Drafts" in the Recommendation-App-Designs file (don't touch existing pages) and draft screens S2, S4, S6, S7, S8, S9 per the spec, using the file's existing color variables and type styles, adding missing tokens as variables.

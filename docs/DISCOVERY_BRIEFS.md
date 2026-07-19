# Discovery Briefs — homework for Rob & Leul

Each brief is small, time-boxed, and directly unblocks a build task. Split them however you like; suggested owners are just a starting point.

## D1 — Name & identity decision (Rob + Leul, 30 min, blocks nothing but touches everything)
Clarified: "Rainbow" is a color theme (alongside light and dark), and "Read.um" was a placeholder — so the app has no name yet. Decide together:
1. A working name (fine if temporary — just pick one everything uses).
2. Quick check: is the name available as an iOS/Android app name and a domain you'd accept?
3. Which single theme ships in the MVP (rainbow is the most-developed; light/dark + picker deferred). Yes/no on rainbow-first.

**Output:** one line in a shared note: name + theme confirmation.

## D2 — Inspiration board for the 6 missing screens (Leul suggested, 1–2 hrs)
Screens needing design: sign-in, search results, send-a-rec sheet, friends/invite code, notifications inbox, status+reaction sheet.
Collect 2–3 screenshots per screen from apps whose treatment you admire (Letterboxd, Goodreads/StoryGraph, Beli, Airbuds, iMessage share sheets are good hunting grounds). Note *what specifically* you like ("Beli's friend-ranking sheet slides up and keeps context behind it").

**Output:** a folder or FigJam board of screenshots + one-line notes. Claude can then generate matching Figma screens in your existing style via the Figma integration.

## D3 — The "gratifying ping" (Rob suggested, 1 hr, high leverage)
The notification is your product's soul. Draft the actual copy for each:
- Friend received your rec
- Friend started it
- Friend finished it (+ their reaction)
- Gentle nudge on an untouched rec (opt-in? how often? your research doc warns about annoyance)
Write 2–3 candidate voices (earnest / playful / minimal) for the same event and pick one.

**Output:** a copy sheet — feeds directly into build brief A7.

## D4 — Friend test script (either, 45 min, needed by Phase 4)
Write 5 questions to ask your first 3–5 test friends after a week of use, e.g.: Did you open it without a notification prompting you? What did you do when a friend recommended something in person — did you reach for the app? What felt like homework?

**Output:** short script + list of committed test friends.

## D5 — Edition-picking behavior (either, 30 min, informs A4)
Your Figma copy says "choose the right version." Decide how much edition detail matters for MVP: exact edition (ISBN-level) vs. just "the book" (canonical work). Recommendation: canonical work for MVP — edition-picking adds real search UX cost.

**Output:** one-line decision.

## Decisions Claude needs before the relevant build brief starts
| Decision | Blocks |
|---|---|
| D1 name | A1 scaffold (bundle ID, app name) |
| D3 notification copy | A7 notifications |
| D5 edition granularity | A4 search |
| D2 inspiration | Design of the 6 missing screens |

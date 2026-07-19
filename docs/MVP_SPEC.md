# MVP Product Spec — Recommendations App (name TBD)

## 1. One-liner
Track the recommendations friends give you, follow through on them, and give your friends the satisfaction of knowing you did.

## 2. Users & core value
- **Recommender:** wants to know their suggestion landed ("gratifying little ping").
- **Recipient:** wants one place for every "you HAVE to read this" instead of forgotten dinner conversations.
- Both roles are the same person at different moments — the app must make both effortless.

## 3. User stories (MVP)

**Onboarding & account**
- U1: As a new user, I see the 3 concept cards (Follow through / A better friendship / Search and Send) and can sign up with email.
- U2: As a user, I have a display name and avatar (emoji or photo).

**Friends**
- U3: As a user, I can share a short invite code; entering a friend's code connects us.
- U4: As a user, I can see my friend list.

**Search & send**
- U5: As a user, I can search books by title/author (Google Books) and pick the right edition.
- U6: As a user, I can send a book to one or more registered friends with an optional short note — via a bottom sheet on the detail page that dismisses with a success toast.
- U6b: As a user, I can instead copy a public URL to the detail page and share it anywhere (text, social, etc.).
- U6c: As a non-registered recipient, opening that URL shows a web page with static content (title, cover, description); dynamic content (ratings, comments, friend activity) prompts sign-up. Low-friction adoption is the goal — no walled garden.
- U7: As a user, I can also add a book to my own TBR without a sender.

**TBR (home)**
- U8: As a user, my home screen is my TBR list showing cover, title, tags, and who recommended it (matches the existing "What's next on your TBR?" Figma screen, including the "Nick +1" stacked-recommender treatment).
- U9: As a user, I can filter by category tab — Books active; Shows/Movies/Sites visible but disabled ("soon").
- U10: As a user, I can set status: **To Read → Started → Finished** (or **Not for me**).

**The ping (the whole point)**
- U11: As a recommender, I get a push notification when my friend starts or finishes something I sent.
- U12: As a finisher, I can attach a quick reaction (loved it / liked it / not for me + optional note) that the recommender sees.

**Book detail**
- U13: As a user, tapping a book shows detail (cover, author, tags, description, who recommended it and their note) — matches existing Figma detail screen.

**Relational "sent" tracking (not a plain sent-folder list)**
- U14: As a user, a friend's profile page shows a visual affordance revealing everything I've recommended *to them* (and they to me), with statuses.
- U15: As a user, a book's detail page shows a compact avatar/collapsed affordance revealing who I've recommended *this book* to ("Recommended to Leul").

## 4. Screen inventory

| # | Screen | Design status |
|---|---|---|
| S1 | Onboarding cards (3) | ✅ Designed |
| S2 | Sign up / sign in | ❌ Needs design |
| S3 | Home / TBR list | ✅ Designed |
| S4 | Search results | 🟡 Partially (search bar exists on home) |
| S5 | Book detail | ✅ Designed |
| S6 | Share sheet on detail (send to friends + note, OR copy public link; success toast) | ❌ Needs design |
| S7 | Friends list + invite code | ❌ Needs design |
| S8 | Notifications/inbox list | ❌ Needs design |
| S9 | Status change + reaction sheet | ❌ Needs design |
| S10 | Minimal profile/settings | ❌ Needs design |
| S11 | Friend profile (with "recs between us" affordance, U14) | ❌ Needs design |
| S12 | Public web detail page (static content + sign-up prompt for dynamic, U6c) | ❌ Needs design |

S5 book detail additionally gains the U15 "Recommended to…" affordance.

Missing screens should reuse the established language: purple field, serif display type, pixel-style labels/tags, outlined cards, orange accent.

## 5. Explicitly OUT of scope for MVP
- Shows, Movies, Sites categories (tabs shown, disabled)
- Theme picker (light / dark / rainbow) — MVP ships one theme; light and dark are restrained palettes, rainbow is the vibrant high-saturation style from the current Figma screens
- Chain-reaction / social impact map
- Points, badges, streaks, challenges, digests, anniversary reminders
- Public content, feeds, comments, or any many-to-many social graph beyond direct friends
- Monetization of any kind
- Goodreads/Letterboxd/Spotify integrations
- (Sharing to non-users IS in scope via public URLs — see U6b/U6c)

## 6. Success criteria for the MVP
- Rob and Leul each send ≥5 real recommendations in 2 weeks of dogfooding.
- At least one full loop completes: send → notification → finished → reaction → ping received.
- Both agree the ping feels good enough to invite friends.

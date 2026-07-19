# Recommendations App

Track the recommendations friends give you, follow through on them, and give your friends the satisfaction of knowing you did.

Recommenders get a gratifying ping when their pick lands. Recipients get one place for every "you HAVE to read this" instead of forgotten dinner conversations.

## Repo structure

```
recs-app/   Expo (React Native + TypeScript) app — see recs-app/README.md and recs-app/INSTALL.md
docs/       Product spec, architecture, plan, and setup docs
```

## Docs

- [`docs/MVP_SPEC.md`](docs/MVP_SPEC.md) — product spec, user stories, screen inventory
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, data model, key flows
- [`docs/PLAN.md`](docs/PLAN.md) — build plan
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — backend setup
- [`docs/DEFERRED_TASKS.md`](docs/DEFERRED_TASKS.md) — explicitly out of scope for MVP

## Stack

React Native + Expo (TypeScript), Expo Router, React Query, Supabase (Postgres + Auth + Realtime + Edge Functions), Google Books API for search, Expo Push Notifications.

## Getting started

See [`recs-app/INSTALL.md`](recs-app/INSTALL.md) for setup, and [`recs-app/README.md`](recs-app/README.md) for day-to-day Expo commands.

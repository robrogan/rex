# Builds & Distribution (A8)

How to turn this repo into installable apps on Rob's iPhone and Leul's Android — and
make push notifications actually deliver.

> **Expo Go vs. a real build.** Day-to-day dev still uses Expo Go (`npm start`, see
> `PREVIEW.md`). But Expo Go **cannot** receive remote push (removed in SDK 53) and
> can't run custom native config. For dogfooding + push you need a **standalone build**,
> which is what this doc produces.

---

## What's already done (in the repo / backend)

- **Native identity is set** — `app.json` has `ios.bundleIdentifier` / `android.package`
  = `com.robrogan.recs`. This is permanent-ish (changing it = a new app in the stores), so
  it's a neutral id independent of the final display name. The display `name` is still a
  placeholder and can change anytime.
- **`expo-notifications` plugin** is configured (notification icon + brand color).
- **`eas.json`** has three profiles: `development` (dev client), **`preview`** (the
  dogfood build — Android APK + iOS ad-hoc), and `production` (store submit).
- **Push backend is live** — the `push-fanout` Edge Function is deployed and a DB trigger
  on `notifications` INSERT invokes it. Verified end-to-end at the DB level (a test
  notification produced a `sent:true` from Expo). The only missing piece is a **real
  device token**, which only exists once a standalone build is installed and grants
  notification permission.

So everything below is **Rob's to run** — it needs interactive login and paid accounts.

---

## One-time account setup

| Account | Cost | Needed for |
|---|---|---|
| **Expo** (expo.dev) | free | all EAS builds |
| **Apple Developer Program** | $99/yr | iOS builds, TestFlight, iOS push. ~1 day to approve — start this early. |
| **Google Play Developer** | $25 once | only if you want the Play internal track. Direct APK needs nothing. |

---

## Step 1 — EAS CLI + login (once)

```bash
npm i -g eas-cli          # or use: npx eas-cli@latest <cmd>
eas login                 # your Expo account
```

## Step 2 — Link the project (once)

```bash
cd ~/Documents/Websites/"Recommendations app"/recs-app
eas init
```

`eas init` creates the EAS project and **writes `extra.eas.projectId` into `app.json`**.

> ✅ **Commit that change.** `src/lib/notifications.ts` already reads
> `Constants.expoConfig?.extra?.eas?.projectId` when minting the Expo push token — so once
> the projectId exists, push registration Just Works in the build. No code change needed.

---

## Step 3 — Android now (fastest path, no paid account)

```bash
eas build -p android --profile preview
```

- First run asks to generate an **Android Keystore** — say **yes** (EAS manages it) — and
  sets up the **FCM** credential for push — accept the EAS-managed flow.
- When it finishes, EAS gives a URL to a downloadable **`.apk`**.
- Send that link/file to **Leul** → he taps it on his phone → "install from unknown
  source" → done. No Play account, no Expo Go.

Optional later — Play internal track (needs the $25 account):
```bash
eas submit -p android --profile production   # after a production build
```

## Step 4 — iOS, in parallel (needs Apple Developer)

1. Enroll in the **Apple Developer Program** first — approval can take ~a day.
2. Build (EAS creates the certs, provisioning profile, and APNs push key for you):
   ```bash
   eas build -p ios --profile preview
   ```
   - Log in with your Apple ID when prompted; accept the EAS-managed credentials.
   - For **ad-hoc** install, register the iPhone when prompted (`eas device:create`).
3. **TestFlight** (nicer for ongoing installs):
   ```bash
   eas build -p ios --profile production
   eas submit -p ios --profile production
   ```
   Fill the `submit.production.ios` placeholders in `eas.json` first
   (`appleId`, `ascAppId`, `appleTeamId`). Then accept the TestFlight invite on the phone.

---

## Step 5 — Verify push end-to-end (the A8 acceptance)

The backend chain is already live, so this only needs the two installed builds:

1. Install the build on **both** phones and **grant notification permission** on first
   launch (this is what registers each device's Expo token to your `users` row).
2. From **account A**, send a recommendation to **account B**.
   → B's phone gets a **"New recommendation"** push.
3. On **B**, mark that book **Finished**.
   → A's phone gets a **"They finished it!"** push.

Seeded logins for testing are in `TEST_LOGINS.local.md` (gitignored).

---

## Troubleshooting

- **No push arrives:** confirm the phone granted notification permission, and that
  `users.expo_push_token` is populated for that account (a build + one launch sets it).
  Expo Go will never receive push — must be the standalone build.
- **iOS build fails on credentials:** re-run with `eas credentials` to inspect/repair the
  push key + provisioning profile.
- **Wrong SDK / native mismatch:** these builds are pinned to Expo SDK 57; don't mix with
  an older Expo Go.
- **Bundle id already in use:** if `com.robrogan.recs` collides on the App Store, pick
  another reverse-DNS id and update `app.json` **before** the first iOS build.

---

## A9 — public share pages & deep links (finish)

The A9 **core is built** (see `PROGRESS.md` → "A9 public share pages (core)"): the public
`/item/{id}` page renders static book content to signed-out visitors with a sign-up CTA, the
deep-link config is in `app.json`, and the `.well-known/` verification templates are copied
into the web export. What remains needs the real domain + your build credentials.

**Prereq:** pick the public domain (ties to the app name **D1**; see
`docs/DECISIONS_NEEDED.md` §B1). Everything below uses `<domain>` for it.

1. **Set the domain everywhere it's placeholdered:**
   - `EXPO_PUBLIC_PUBLIC_BASE_URL=https://<domain>` in `.env` (drives the "Copy public link"
     button via `lib/config.ts`).
   - `app.json` → `ios.associatedDomains`: `"applinks:<domain>"` (replace `PLACEHOLDER_DOMAIN`).
   - `app.json` → `android.intentFilters[0].data.host`: `<domain>` (replace `PLACEHOLDER_DOMAIN`).
2. **Fill the `.well-known/` files** (`public/.well-known/`, see their `README.md`):
   - `apple-app-site-association`: replace `PLACEHOLDER_TEAMID` with your **Apple Developer
     Team ID** → `"<TEAMID>.com.robrogan.recs"`.
   - `assetlinks.json`: replace `PLACEHOLDER_SHA256_CERT_FINGERPRINT` with the Android signing
     cert **SHA-256** from `eas credentials` (Android keystore).
3. **Rebuild** so the native builds pick up the association config (`eas build` again — the
   verification files are read by the OS from the hosted domain, but the app-side domain must
   match). A `.well-known` change alone only needs a re-host, not a rebuild; an `app.json`
   host/Team-ID change needs a rebuild.
4. **Host the web export at `<domain>`:** `npx expo export --platform web` → deploy `dist/`
   to any static host (must serve `/.well-known/apple-app-site-association` and
   `/.well-known/assetlinks.json` as JSON over HTTPS **with no redirect**, and route
   `/item/*` to the exported `item/[id].html`).
5. **Acceptance (from the A9 brief):** open a `https://<domain>/item/<uuid>` link in an
   **incognito browser** → static book content + sign-up prompt, no login wall. Open the same
   URL on a phone **with the app installed** → it deep-links to the in-app detail screen.

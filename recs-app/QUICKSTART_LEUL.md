# Quickstart — running the app on your phone (Leul)

The app is React Native + Expo. You preview it on your Android phone with **Expo Go** — no
Android Studio, no build. There are two ways in.

---

## Option A — Just look at what Rob is running (30 seconds, no code)

When Rob wants you to see something live, he runs `npm run start:tunnel` and sends you a URL
that looks like `exp://xxxx.exp.direct`.

1. Install **Expo Go** from the Play Store.
2. Open **Expo Go** → **Enter URL manually** → paste the link.

That's it — you're looking at Rob's dev server from your own network, anywhere. Use this for
quick "does this look right?" checks. (It only works while Rob's server is running.)

---

## Option B — Run it yourself on your own network (for real testing)

Do this when you want to poke at the app independently, on your own Wi-Fi.

### 1. Install the tools (one time)
- **Node.js** LTS (v20+): https://nodejs.org
- **Git**: https://git-scm.com
- **Expo Go** on your Android phone (Play Store)

### 2. Get the code
```bash
git clone https://github.com/robrogan/rex.git
cd rex/recs-app
```

### 3. Add the backend keys (one time)
The Supabase keys aren't in the repo (they're gitignored). Copy the template and fill it in:
```bash
cp .env.example .env
```
Then open `.env` and paste the two values **from Rob**:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```
These point at the same shared live backend Rob uses, so you'll see the same data (and can
send each other recs once that flow is built).

### 4. Install dependencies
```bash
npm install
```

### 5. Start it
```bash
npm start
```
Scan the QR **from inside the Expo Go app** (Android's camera won't open it directly).
Your phone and laptop need to be on the same Wi-Fi. If the QR won't connect (some routers
block device-to-device), use:
```bash
npm run start:tunnel
```
Save a file and the phone hot-reloads in a second or two.

### Signing in
Use email sign-in (you'll get a 6-digit code), or ask Rob for a seeded test login. On the
sign-in screen, tap **🎨 Components (dev)** to see the design-system gallery.

---

## If something breaks
- **QR won't connect on the same Wi-Fi** → `npm run start:tunnel`.
- **Weird bundling errors / stale cache** → `npx expo start -c`.
- **"Project is incompatible with this version of Expo Go"** → update the Expo Go app; this
  project is on **SDK 57**.
- **`.env` not picked up** → stop the server and restart it after editing `.env`.

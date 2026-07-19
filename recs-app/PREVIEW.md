# Previewing the app on your phone

The app is React Native + Expo, so you preview it on a real phone with **Expo Go** — no
build, no cable. `npx expo start` serves over your Mac's **LAN IP** (not `localhost`), and
the QR code carries that address, so your phone reaches it over Wi-Fi.

> `localhost` / `expo start --web` is only for a quick look in a **desktop browser**. Phones
> use Expo Go via the QR code.

## One-time setup
- **Rob (iPhone):** install **Expo Go** from the App Store.
- **Leul (Android):** install **Expo Go** from the Play Store.

## Same Wi-Fi (fastest)
```bash
cd recs-app
npm start          # = expo start
```
- **iPhone:** scan the QR with the **Camera** app → opens in Expo Go.
- **Android:** scan the QR from **inside the Expo Go app**.

Save a file and the phone hot-reloads in a second or two. Requires phone + Mac on the same
network (and the network not blocking device-to-device traffic).

## Different networks / restrictive Wi-Fi (Leul remote, guest/corporate Wi-Fi)
```bash
cd recs-app
npm run start:tunnel   # = expo start --tunnel
```
Routes through a public tunnel so it works across any network. Slightly slower. The first
run offers to install `@expo/ngrok` — say yes. This is the default when you're not in the
same room.

## Seeing the design-system gallery (A2)
In **dev builds** the sign-in screen shows a **🎨 Components (dev)** link → opens
`/dev/components`, which renders every component in all states. (The link is hidden in
production via `__DEV__`.) You can also deep-link directly: `exp://<mac-ip>:8081/--/dev/components`.

## When Expo Go stops being enough
Expo Go covers everything through **A6**. You'll switch to an **EAS development build**
(installed once per phone, then Metro connects the same way) at:
- **A7 — push notifications:** Expo Go no longer supports remote push (removed in SDK 53).
- Any point we add a custom native module or config plugin.

That build path is also the A8 "installable TestFlight / APK" story. See `docs/AGENT_BRIEFS.md#a8`.

## Troubleshooting
- **QR won't connect on same Wi-Fi:** the network is isolating devices → use `npm run start:tunnel`.
- **Stuck bundling / stale cache:** `npx expo start -c` (clears the Metro cache).
- **"Something went wrong" in Expo Go:** confirm the Expo Go app's SDK matches this project (SDK 57).

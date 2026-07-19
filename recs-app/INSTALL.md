# Run the app (first time)

Requires Node 20+ on your Mac (`node -v`; install from nodejs.org if missing).

```bash
cd ~/Documents/Websites/"Recommendations app"/recs-app
npm install
npx expo start
```

Then:
- **Rob (iPhone):** install "Expo Go" from the App Store, scan the QR code in the terminal.
- **Leul (Android):** install "Expo Go" from Google Play, scan the same QR code (same Wi-Fi, or run `npx expo start --tunnel`).

You'll land on the onboarding placeholder; every screen S1–S12 exists as a navigable placeholder in the rainbow theme. `npm run typecheck` and `npm run lint` verify changes.

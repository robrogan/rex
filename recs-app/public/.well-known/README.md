# `.well-known` — universal / app-link verification (A9)

Expo copies everything in `public/` verbatim into the static web export
(`expo export --platform web` → `dist/`), so these files are served from the site
root once the web build is hosted at the real domain. They let the OS verify that
`https://<domain>/item/…` links may open the installed app instead of the browser.

**Both files ship with placeholders that Rob must fill before deep links verify.**

## `apple-app-site-association` (iOS Universal Links)
- No file extension, `application/json`, served over HTTPS with **no redirect**.
- Replace `PLACEHOLDER_TEAMID` with the **Apple Developer Team ID**
  (App Store Connect → Membership, or `eas credentials`). Result:
  `"appIDs": ["ABCDE12345.com.robrogan.recs"]`.
- Must match `ios.associatedDomains` in `app.json` (also placeholdered — set both).

## `assetlinks.json` (Android App Links)
- Served at `/.well-known/assetlinks.json`, `application/json`.
- Replace `PLACEHOLDER_SHA256_CERT_FINGERPRINT` with the **SHA-256 fingerprint of the
  signing cert** for the installed build. Get it from `eas credentials`
  (Android → the keystore's SHA-256), colon-separated hex.
- `package_name` is already correct (`com.robrogan.recs`); must match
  `android.intentFilters` in `app.json`.

## Domain
The host in `app.json` (`ios.associatedDomains` / `android.intentFilters`) is
`PLACEHOLDER_DOMAIN` — set it to the real public domain (ties to app name **D1**;
see `docs/DECISIONS_NEEDED.md` §B1) and to `EXPO_PUBLIC_PUBLIC_BASE_URL`.

See `BUILD.md` → "A9 — public share pages & deep links" for the full finish checklist.

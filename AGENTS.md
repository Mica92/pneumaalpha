# Project architecture rules

- Keep `app.pneuma.alpha` as the Capacitor application ID so existing mobile installations remain update-compatible.
- Keep legacy internal filenames, component symbols, CSS animation names, storage keys, and database identifiers unless a migration is explicitly required; user-facing branding is Kionas.
- Centralize the public brand and canonical origin in `src/lib/site.ts` as `SITE_NAME = "Kionas"` and `SITE_URL = "https://kionas.app"` to prevent metadata drift.

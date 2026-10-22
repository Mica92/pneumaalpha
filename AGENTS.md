
# Project architecture rules

- Keep `app.pneuma.alpha` as the Capacitor application ID so existing mobile installations remain update-compatible.
- Keep legacy internal filenames, component symbols, CSS animation names, storage keys, and database identifiers unless a migration is explicitly required; user-facing branding is Kionas.
- Centralize the public brand and canonical origin in `src/lib/site.ts` as `SITE_NAME = "Kionas"` and `SITE_URL = "https://kionas.app"` to prevent metadata drift.
- Keep `/dialogos` as an Outlet layout, with its catalog in the index leaf and dialogue state keyed by tradition; this lets detail routes render without mixing conversations.
- Keep `/mesa` as a redirect to `/comparar` and retain shared roundtable functions; comparison still depends on them.
- Render generated ontological answers through ReactMarkdown and share the scoped ontology-response reading styles with curated answers so both formats remain visually consistent.

- Share dialogue selection and history rules through client-safe helpers, with regression tests, so catalog handoffs and request limits stay consistent.

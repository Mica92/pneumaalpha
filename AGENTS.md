
# Project architecture rules

- Keep `app.pneuma.alpha` as the Capacitor application ID so existing mobile installations remain update-compatible.
- Keep legacy internal filenames, component symbols, CSS animation names, storage keys, and database identifiers unless a migration is explicitly required; user-facing branding is Kionas.
- Centralize the public brand and canonical origin in `src/lib/site.ts` as `SITE_NAME = "Kionas"` and `SITE_URL = "https://kionas.app"` to prevent metadata drift.
- Keep `/dialogos` as an Outlet layout, with its catalog in the index leaf and dialogue state keyed by tradition; this lets detail routes render without mixing conversations.
- Keep `/mesa` as a redirect to `/comparar` and retain shared roundtable functions; comparison still depends on them.
- Render generated ontological answers through ReactMarkdown and share the scoped ontology-response reading styles with curated answers so both formats remain visually consistent.

- Share dialogue selection and history rules through client-safe helpers, with regression tests, so catalog handoffs and request limits stay consistent.
- The institutional site is moving to a separate Kionas Website project; add no new marketing pages here, and remove `_site` code only via `docs/separation/platform-cleanup.patch` once that site is published, so the app bundle and mobile export contain only the product.
- Keep the public institutional site under the `_site` pathless layout (scoped `.institutional` styles) and the signed-in app home at `/app`; app-internal home links target `/app` while legal and 404 links stay on `/`.
- Store institutional demo/pilot requests only through the server function with honeypot, fill-time and per-IP-hash limits; the table has no public insert policy and only admins can read it.
- Keep every external statistic and citation on the institutional site in `src/lib/evidence.ts` (with population, year, source URL and caveat) and render it through the shared evidence components, so the home page and `/evidencia` never drift apart.

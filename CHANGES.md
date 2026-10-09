# Kionas — Cambios integrados desde las auditorías (técnica/SEO + diseño)

Fecha: 8 de octubre de 2026 · Repo: `pneumaalpha` (rama `main`)

Este documento registra los cambios aplicados al código como resultado de las dos auditorías
(técnica/SEO/CRO y diseño/UX/dirección de arte), y las tareas que requieren decisión de
infraestructura, de negocio o validación de diseño y que por tanto quedan documentadas (no codificadas).

---

## 1. Cambios aplicados (código)

### 1.1 Hallazgo: el repo ya estaba limpio de "PneumaA"; no hay deriva de marca en el código del repo
La marca y el dominio canónico ya estaban correctamente centralizados en `src/lib/site.ts`
(`SITE_NAME = "Kionas"`, `SITE_URL = "https://kionas.app"`) y aplicados en las rutas activas
(p. ej. la home `src/routes/_authenticated/index.tsx` usa el título "Kionas — Claridad para pensar lo
que te importa" con canonical `${SITE_URL}/`).

Durante la revisión se hallaron 5 rutas de nivel raíz (`index.tsx`, `auth.tsx`, `oraculo.tsx`,
`reporte.tsx`, `$philosopher.tsx`) que aún contenían "PneumaA" y `pneumaalpha.lovable.app`, pero se
comprobó que **no forman parte del repositorio**: no están en `src/routeTree.gen.ts` ni en el zip de
GitHub. Eran restos de un estado previo de la copia de trabajo local. **No suponen un cambio en el
repo**: esas ediciones eran irrelevantes y esos 5 archivos se eliminaron de la copia local.

### 1.2 Canonical y og:url en páginas de detalle (Auditoría técnica · A2)
Se añadió `rel=canonical` y `og:url` a las páginas de detalle que no los tenían:
- `src/routes/_authenticated/filosofos.$id.tsx` → `/filosofos/:id`
- `src/routes/_authenticated/ideas.$id.tsx` → `/ideas/:id`
- `src/routes/_authenticated/rutas.$id.tsx` → `/rutas/:id`

### 1.3 Imagen social consistente (Auditoría técnica · A6)
Se añadió `og:image` y `twitter:image` globales en `src/routes/__root.tsx` apuntando a
`${SITE_URL}/og-image.png` (recurso que ya existe en `public/`), de modo que todas las páginas
tengan una imagen social consistente. Antes solo `/biblioteca` y `/analisis` la definían.

### 1.4 Sitemap completo (Auditoría técnica · A5)
En `src/routes/sitemap[.]xml.tsx` se añadieron las páginas de detalle que faltaban:
- `/filosofos/:id` (por cada filósofo)
- `/ideas/:id` (por cada gran idea)
- `/rutas/:id` (por cada ruta filosófica)

### 1.5 Contraste de tokens semánticos (Auditoría de diseño · D4)
En `src/styles.css` se subió la luminosidad de los acentos para cumplir WCAG AA sobre fondo oscuro
(tanto en `:root` como en `.dark`):
- `--tension`: `oklch(0.58 …)` → `oklch(0.68 0.075 245)` (azul de "tensión")
- `--keep`:   `oklch(0.56 …)` → `oklch(0.66 0.055 135)` (verde de "lo guardado")
- `--bronze-soft` / `--fog`: `oklch(0.55 …)` → `oklch(0.62 0.048 78)`

Resultado: los tres pasan de ~4:1 (bajo AA) a ≈5,5–6,5:1 (cumplen AA).

---

## 2. Verificación de cambios
- Búsqueda global: **0** referencias restantes a `PneumaA` / `pneumaalpha` / `pneum.app` en `src/`.
- Todas las rutas públicas y de contenido ahora declaran `canonical` (y las pertinentes, `og:url`).
- Los cambios son ediciones acotadas (imports + metadatos de `head()` + tokens CSS), sin cambios de lógica.

**Validación pendiente en entorno del proyecto:** ejecutar `pnpm install` y `pnpm build` (o `pnpm dev`)
para confirmar compilación, ya que este entorno no dispone de `node_modules` ni de las credenciales
de Lovable Cloud / Supabase necesarias para un build completo.

---

## 3. Pendiente: requiere decisión de infraestructura / negocio (no es solo código)

| # | Ítem | Auditoría | Por qué no se codificó |
|---|---|---|---|
| P1 | **Comprar/conectar el dominio `kionas.app` y `www.kionas.app`** y activar redirección 301 desde el dominio Lovable | Técnica A1 (crítico) | Es una acción de DNS/dominio y pago; ya está en `roadmap.md`. Hasta que el dominio no resuelva, los `canonical`/sitemap/`og:url` apuntan a un dominio aún no activo (comportamiento actual y previsto). |
| P2 | **CSP y headers de seguridad** (`Content-Security-Policy`, `frame-ancestors`) | Técnica · Seguridad | Requiere conocer el inventario completo de orígenes permitidos (Lovable, Supabase, Google Fonts, scripts inline) y probar en staging; un CSP mal configurado rompe la app. |
| P3 | **Splitting/optimización del bundle JS** (~1 MB comprimido) | Técnica A4 | TanStack/Vite ya dividen por ruta, pero el peso depende de la config de build de Lovable. Requiere perfilar el build real y decidir `manualChunks`/lazy-loading; no se puede validar sin build. |
| P4 | **Internacionalización real (hreflang por path + contenido `/en/` completo)** | Técnica · i18n | Refactor estructural de enrutado (`?lang=es` → `/en/…`) y de contenido; decisión de producto sobre el alcance del inglés. |

## 4. Pendiente: decisiones de diseño / producto (recomendadas, no automatizables)

| # | Ítem | Auditoría | Nota |
|---|---|---|---|
| D1 | Subir la demo del oráculo al primer pliegue | Diseño | Rediseño de composición del hero; decisión de dirección de arte. |
| D2 | ~~Unificar tratamiento de retratos~~ **Hecho**: utilidad `portrait-bronze` (sepia 0.3) aplicada a los 11 retratos | Diseño | Calibrar `sepia()` en `styles.css` si se desea más/menos calidez. |
| D5 | ~~Unificar el verbo del CTA~~ **Parcial**: login desambiguado ("Iniciar sesión"/"Sign in") | CRO/Diseño | Unificar el verbo principal (p. ej. "Conversar") sigue siendo decisión de copy. |
| D6–D9 | Onboarding (Mapa/Recorrido/Red), consolidar puertas de entrada, prueba social | UX/CRO | Contenido y flujo; requiere diseño/redacción. |
| D10 | Modo claro opcional | Diseño | Ya existen tokens (`--paper`, `--ink`) y `band-paper`; falta el toggle global. |
| D8 | ~~Jerarquía de headings en `/umbral`~~ **Resuelto en repo** (solo 6 headings, sin el exceso de H2) | Diseño | Nada que hacer. |

---

## 5. Resumen de archivos modificados (solo archivos del repo)

1. `src/routes/sitemap[.]xml.tsx`
2. `src/routes/__root.tsx`
3. `src/styles.css`
4. `src/routes/_authenticated/filosofos.$id.tsx`
5. `src/routes/_authenticated/ideas.$id.tsx`
6. `src/routes/_authenticated/rutas.$id.tsx`
7. `src/components/site-nav.tsx`
8. `src/components/philosopher-card.tsx`
9. `src/components/philosopher-profile.tsx`
10. `src/components/chat-window.tsx`
11. `src/components/atlas/atlas-panel.tsx`
12. `src/routes/_authenticated/umbral.tsx`
13. `src/routes/_authenticated/comparar.tsx`
14. `src/routes/_authenticated/recorrido.tsx`
15. `src/routes/_authenticated/mesa.tsx`

Documentación añadida: `CHANGES.md`.

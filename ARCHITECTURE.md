# PneumaA — Esqueleto de la web

Mapa detallado de la aplicación: rutas, pantallas, bloques de UI, lógica de servidor, datos y canales externos. Documento de referencia; no describe trabajo pendiente.

Stack: TanStack Start (React 19 + Vite), Tailwind v4, Lovable Cloud (Postgres + Auth + pgvector), Lovable AI Gateway (`google/gemini-3-flash-preview`).

---

## 1. Árbol de rutas

```text
src/routes/
├── __root.tsx                          layout global
├── auth.tsx                            /auth              pública
├── privacy.tsx                         /privacy           pública
├── sitemap[.]xml.tsx                   /sitemap.xml       pública
├── api/public/telegram/webhook.ts      POST endpoint del bot (sin auth de sitio)
└── _authenticated/
    ├── route.tsx                       guarda de sesión (ssr:false + beforeLoad → /auth)
    ├── index.tsx                       /                  portada bento
    ├── $philosopher.tsx                /:philosopher      conversación
    ├── oraculo.tsx                     /oraculo           acento glaciar
    └── reporte.tsx                     /reporte           acento salvia
```

`src/routeTree.gen.ts` lo genera el plugin de TanStack Router; no se edita a mano.

### __root.tsx
- `head()`: título, descripción, Open Graph / Twitter, `theme-color #0b0f12`, metas de PWA en iOS.
- `links`: hoja de estilos, preconnect a Google Fonts, Sora + Manrope, `manifest.webmanifest`, favicon y apple-touch-icon.
- `shellComponent`: `<html lang="es">` con `HeadContent` y `Scripts`.
- `component`: `QueryClientProvider` → `I18nProvider` → `AuthProvider` → `<Outlet />` + `<Toaster theme="dark" position="top-center" />`. Suscribe `supabase.auth.onAuthStateChange` para invalidar router y queries.
- `notFoundComponent`: glifo griego respirando + "Silence — this path leads nowhere" + volver a inicio.
- `errorComponent`: mensaje "The thought has been interrupted" + botón *Resume* (`router.invalidate()` + `reset()`).

---

## 2. Pantalla por pantalla

### /auth — acceso
Archivo: `src/routes/auth.tsx`
- Glifo griego animado (`GreekGlyph`, cicla de alpha a omega, arranca determinista para evitar desajustes de hidratación).
- Título **Diálogo Alpha** y bajada: "Conversa con conciencias filosóficas. Interactúa con la lucidez de las ideas. Heidegger, Marx y Schopenhauer entre otros."
- Formulario correo + contraseña (registro / ingreso), errores por toast.
- Selector de idioma ES / EN y enlace a la política de privacidad.

### / — portada bento
Archivo: `src/routes/_authenticated/index.tsx`
- Cabecera: marca `PneumaMark` (PNEUMALPHA), H1 y bajada, accesos a Oráculo y Reporte.
- Dos tarjetas destacadas de mayor tamaño (primera celda cinematográfica `col-span-3 row-span-2`).
- Rejilla bento con todas las mentes: glifo, nombre, subtítulo y blurb, cada una con `aria-label` `"<nombre> — <subtítulo>"`; el conteo de mentes se deriva de `PHILOSOPHER_LIST.length`, nunca está escrito a mano.
- `InstallAppCard` (instalación PWA) y `TelegramCard` (vinculación por código de 6 dígitos).
- Pie: privacidad, cambio de idioma, cerrar sesión.

### /:philosopher — conversación
Archivos: `src/routes/_authenticated/$philosopher.tsx`, `src/components/chat-window.tsx`, `src/components/chat-engagement.tsx`
- `head()` por filósofo: título, descripción, `og:*`, canonical y JSON-LD `Person`.
- Si el id no existe, redirige a la portada.
- **Cabecera**: glifo, nombre y acciones (`HeaderAction` / `MenuItem`): limpiar conversación, migrar, historial completo, cerrar sesión.
- **Hilo**: `UserBubble` y `AssistantBody`, ambos memoizados para no re-renderizar mientras llegan tokens; `CorpusBadge` cuando la respuesta se apoya en el corpus indexado.
- **Guía conversacional** (`chat-engagement.tsx`): barra de temas, banner de dilema del día, chips de continuación y botón flotante de preguntas raíz.
- **Compositor**: textarea que crece solo, dictado por voz (`use-voice-dictation`), envío con Enter, auto-scroll inteligente (`behavior: "auto"` durante el streaming).
- **Panel Historial completo**: `loadFullHistory` con filtro por ese filósofo siempre activo.
- **Panel Migrar**: vista previa de los últimos 40 mensajes antes de moverlos a otra mente.
- Transporte de chat estabilizado con `useMemo` sobre `DefaultChatTransport`.

### /oraculo
Archivo: `src/routes/_authenticated/oraculo.tsx`
Campo libre (pregunta, frase, idea) → `matchPhilosopher` elige la mente adecuada → muestra elección, motivo y enlace directo a la conversación. Acento glaciar (azul).

### /reporte
Archivo: `src/routes/_authenticated/reporte.tsx`
`generateReport` analiza los últimos 120 mensajes del usuario y devuelve arquetipo, patrones de pensamiento, tensiones internas y temas recomendados a explorar. Acento salvia (verde).

### /privacy
Política de privacidad bilingüe: datos guardados, uso de IA, conservación, borrado y contacto.

### /sitemap.xml
Genera el sitemap con la portada, `/auth`, `/privacy` y una entrada por filósofo.

---

## 3. Capa de servidor

Todas son `createServerFn` de `@tanstack/react-start` en `src/lib/*.functions.ts` (módulos finos; la lógica pesada vive en `*.server.ts` o dentro del handler).

| Módulo | Función | Qué hace |
| --- | --- | --- |
| `chat.functions.ts` | `loadMessages` | Últimos 12 mensajes del filósofo (silencio fresco al abrir) |
| | `loadFullHistory` | Historial completo filtrado por filósofo |
| | `sendChat` | Arma prompt de sistema + memoria del usuario + fragmentos RAG y transmite la respuesta |
| | `clearConversation` | Borra el hilo visible |
| | `migrateConversation` | Traslada la conversación a otra mente |
| `oracle.functions.ts` | `matchPhilosopher` | Asigna filósofo a un texto libre |
| `report.functions.ts` | `generateReport` | Reporte psicológico sobre los últimos 120 mensajes |
| `rag.functions.ts` | `retrieveSources` | Búsqueda vectorial en el corpus |
| | `seedAquinasCorpus` | Indexa `aquinas-corpus.ts` con embeddings |
| | `countSources` | Cuenta fragmentos indexados |
| `telegram.functions.ts` | `createTelegramLinkCode` | Código de 6 dígitos para vincular |
| | `getTelegramLink` | Estado de la vinculación |
| | `unlinkTelegram` | Desvincula el chat |

Acceso al modelo centralizado en `src/lib/ai-gateway.ts`. Auth de servidor por `requireSupabaseAuth`; el token se adjunta desde `src/start.ts`.

---

## 4. Datos

| Tabla | Contenido |
| --- | --- |
| `messages` | Historial completo por usuario y filósofo (rol, texto, fecha) |
| `user_memory` | Notas persistentes del usuario que se inyectan al prompt |
| `philosopher_sources` | Corpus con embeddings (pgvector) — hoy Santo Tomás |
| `telegram_links` | Vínculo chat de Telegram ↔ usuario |
| `telegram_link_codes` | Códigos temporales de vinculación |

Todas con RLS por `auth.uid()` y sus `GRANT` correspondientes.

---

## 5. Las mentes

Definidas en `src/lib/philosophers.ts` (`PHILOSOPHERS`, `PHILOSOPHER_LIST`, `isPhilosopherId`). Cada entrada: `id`, `name`, `subtitle {es,en}`, `glyph`, `blurb {es,en}` y prompt de sistema.

| Glifo | id | Mente |
| --- | --- | --- |
| ∴ | `heidegger` | Martin Heidegger |
| ✦ | `schopenhauer` | Arthur Schopenhauer |
| ❧ | `james` | William James |
| ☤ | `nietzsche` | Friedrich Nietzsche |
| ⚒ | `marx` | Karl Marx |
| ⚖ | `bentham` | Jeremy Bentham |
| Ω | `pohlenz` | Max Pohlenz (estoicismo) |
| ◈ | `rationalism` | Racionalismo (Descartes, Spinoza, Leibniz, Malebranche) |
| ❋ | `pascal` | Blaise Pascal |
| ✟ | `kierkegaard` | Søren Kierkegaard |
| ☦ | `yannaras` | Christos Yannaras |
| ⧫ | `levinas` | Emmanuel Levinas |
| ✡ | `maimonides` | Maimónides |
| ✠ | `aquinas` | Santo Tomás de Aquino (con RAG) |

**Directiva de estilo global** aplicada a todas: respuestas breves (1–3 párrafos cortos), sin preámbulos ni listas, lenguaje directo y cierre obligatorio con una contrapregunta concreta.

---

## 6. Canales fuera de la web

- **PWA**: `public/manifest.webmanifest`, iconos de marca, metas en `__root.tsx`, `InstallAppCard` con el prompt de instalación.
- **Telegram** (`src/routes/api/public/telegram/webhook.ts` + `src/lib/telegram.server.ts`): comandos `/start`, `/ayuda`, `/vincular <código>`, `/con <mente>`, `/oraculo <texto>`. Sin vincular sólo abre las mentes libres; vinculado guarda el hilo en `messages`.
- **Capacitor** (`capacitor.config.ts`, `CAPACITOR.md`, `scripts/android-fingerprints.sh`): build de AAB con `applicationId app.pneuma.alpha` y extracción de huellas SHA1/SHA256.

---

## 7. Sistema visual

"Arrival fog" — `#0b0f12` fondo, `#1a2228` superficie, `#3a4a55` borde, `#a8b8c2` niebla, todo en oklch como tokens semánticos en `src/styles.css`. Sora para display (y alias de `font-serif`), Manrope para cuerpo. Etiquetas en mayúsculas con tracking 0.25–0.4em, bordes de un pelo, brillos glaciares suaves, sin acentos cálidos. Referencias: Blade Runner 2049, Dune, Arrival, Apple, Arc, minimalismo nórdico.

Bilingüe de punta a punta: todo texto pasa por `useI18n()` / `t()` (`src/lib/i18n.tsx`); los campos de los filósofos son `{es, en}` y se leen con `[lang]`.

---

## 8. Componentes propios

| Archivo | Rol |
| --- | --- |
| `pneuma-mark.tsx` | Marca PNEUMALPHA (cuñas apiladas + wordmark Sora bold), colores por variables CSS |
| `greek-glyph.tsx` | Indicador de carga que cicla letras griegas |
| `chat-window.tsx` | Pantalla de conversación completa |
| `chat-engagement.tsx` | Barra de temas, dilema, chips y preguntas raíz |
| `install-app.tsx` | Tarjeta de instalación PWA |
| `telegram-card.tsx` | Vinculación con el bot |
| `components/ui/*` | shadcn |

Hooks: `use-auth`, `use-mobile`, `use-voice-dictation`. Utilidades: `engagement.ts`, `error-capture.ts`, `error-page.ts`, `utils.ts`.

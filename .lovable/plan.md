# Esqueleto completo de PneumaA

Mapa detallado de toda la web tal como está hoy: rutas, pantallas, bloques de UI, lógica de servidor, datos y canales externos. Propongo dejarlo escrito en el repo como `ARCHITECTURE.md` para que sirva de referencia viva.

## 1. Árbol de rutas

```text
__root                     layout global (head, fuentes, Toaster, i18n, auth, manifest PWA)
├── /auth                  pública — acceso ("Diálogo Alpha")
├── /privacy               pública — política de privacidad bilingüe
├── /sitemap.xml           pública — sitemap generado
├── /api/public/telegram/webhook   endpoint público del bot
└── _authenticated         guarda de sesión (redirige a /auth antes de pintar)
    ├── /                  portada bento — las 13 mentes
    ├── /$philosopher      pantalla de conversación
    ├── /oraculo           el oráculo asigna filósofo (acento glaciar)
    └── /reporte           reporte psicológico (acento salvia)
```

## 2. Pantalla por pantalla

**/auth** — glifo griego animado, título "Diálogo Alpha", texto de bienvenida, correo + contraseña, cambio de idioma ES/EN, enlace a privacidad.

**/** (portada) — encabezado con marca PNEUMALPHA, H1 y bajada, dos tarjetas destacadas, rejilla bento con las 13 mentes (glifo, nombre, subtítulo, blurb), tarjeta de instalación PWA, tarjeta de vinculación con Telegram, pie con privacidad e idioma.

**/$philosopher** — cabecera con glifo, nombre y acciones (limpiar, migrar, historial completo, salir); hilo de mensajes con burbujas de usuario y cuerpo del filósofo; distintivo de corpus cuando hay RAG; barra de temas, banner de dilema, chips de continuación y botón flotante de preguntas raíz; compositor que crece solo, dictado por voz y auto-scroll inteligente. Paneles deslizables: historial completo filtrado por ese filósofo, y migración con vista previa de los últimos 40 mensajes.

**/oraculo** — campo libre (pregunta, frase, idea), la IA elige la mente adecuada, muestra la elección con motivo y enlace directo a la conversación.

**/reporte** — analiza los últimos 120 mensajes y devuelve arquetipo, patrones de pensamiento, tensiones y temas recomendados.

## 3. Capa de servidor (server functions)

- `chat.functions`: `loadMessages` (últimos 12), `loadFullHistory`, `sendChat` (prompt + memoria + RAG, streaming), `clearConversation`, `migrateConversation`.
- `oracle.functions`: `matchPhilosopher`.
- `report.functions`: `generateReport`.
- `rag.functions`: `retrieveSources`, `seedAquinasCorpus`, `countSources`.
- `telegram.functions`: `createTelegramLinkCode`, `getTelegramLink`, `unlinkTelegram`.

Todas contra el gateway de IA con `google/gemini-3-flash-preview`.

## 4. Datos

`messages`, `user_memory`, `philosopher_sources` (embeddings del corpus de Aquino), `telegram_links`, `telegram_link_codes`.

## 5. Las mentes (13)

heidegger ∴ · schopenhauer ✦ · james ❧ · nietzsche ☤ · marx ⚒ · bentham ⚖ · pohlenz Ω · rationalism ◈ · pascal ❋ · kierkegaard ✟ · yannaras ☦ · levinas ⧫ · maimonides ✡ · aquinas ✠

Cada una define nombre, subtítulo, glifo, blurb y prompt de sistema, más una directiva de estilo global: respuestas breves, sin preámbulo, cerrando con una contrapregunta.

## 6. Canales fuera de la web

- **PWA**: manifiesto, iconos, tarjeta de instalación.
- **Telegram**: comandos `/start`, `/ayuda`, `/vincular`, `/con <mente>`, `/oraculo <texto>`.
- **Capacitor**: configuración para AAB con `app.pneuma.alpha`.

## 7. Sistema visual

"Arrival fog": #0b0f12 / #1a2228 / #3a4a55 / #a8b8c2. Sora display + Manrope cuerpo. Etiquetas en mayúsculas con tracking amplio, bordes de un pelo, brillos glaciares suaves. Todo el texto pasa por `t()` (ES/EN).

## Qué haría al aprobar

Crear `ARCHITECTURE.md` en la raíz con este esqueleto ampliado (incluyendo nombres de archivo por bloque), sin tocar código de la app.

# Llevar PneumaA fuera de la web

Dos canales, en orden: primero **app instalable (PWA)**, después **bot de Telegram**.

## Fase 1 — App instalable (PWA)

Hoy el proyecto no tiene manifiesto ni íconos (`public/` solo contiene `llms.txt` y `robots.txt`), así que no es instalable.

Qué se agrega:

- Ícono de la app en varios tamaños (192, 512 y apple-touch), generados a partir de la marca PneumaA con la paleta "Arrival fog" (`#0b0f12` de fondo).
- `public/manifest.webmanifest` con nombre "PneumaA", `display: standalone`, color de tema `#0b0f12` y `start_url: /`.
- Etiquetas en el `head` de la raíz: `manifest`, `theme-color`, `apple-touch-icon` y favicon.
- Una tarjeta discreta en la página inicial: "Instalar PneumaA" que aparece solo cuando el navegador ofrece la instalación (y, en iPhone, una nota breve de "Compartir → Añadir a inicio").

Resultado: el usuario tiene el ícono en su teléfono o escritorio y abre PneumaA a pantalla completa, sin barra del navegador. No incluye modo sin conexión (eso requiere service worker y no se pide aquí).

## Fase 2 — Bot de Telegram

Permite conversar con los filósofos desde Telegram, sin abrir la web.

Flujo:

1. Conectar el conector de Telegram de Lovable (el bot se crea con BotFather; la clave la guarda Lovable, no se escribe en el código).
2. Endpoint público `/api/public/telegram/webhook` que recibe los mensajes, valida la firma secreta de Telegram y responde.
3. Vinculación de cuenta: en la web aparece un código de 6 dígitos; el usuario escribe `/vincular 123456` en el bot. Así el chat de Telegram queda asociado a su cuenta y las conversaciones se guardan en el mismo historial que la web.
4. Comandos: `/filosofos` lista las mentes disponibles, `/con heidegger` elige con quién hablar, y luego todo lo que escriba se responde con la voz de ese filósofo. `/oraculo <texto>` sugiere el filósofo adecuado.
5. Sin vincular cuenta, el bot solo permite Heidegger y Pohlenz (los libres) y pide vincularse para el resto.

### Detalles técnicos

- Nueva tabla `public.telegram_links` (`chat_id` único, `user_id`, `current_philosopher`, `linked_at`) y `public.telegram_link_codes` (código, `user_id`, expiración), ambas con RLS y GRANTs; el webhook escribe con clave privilegiada tras validar la firma.
- Los mensajes del bot se insertan en la tabla `messages` existente con el mismo `user_id` y `philosopher`, reutilizando el prompt de `src/lib/philosophers.ts` y el modelo actual (`google/gemini-3-flash-preview`).
- El webhook responde de inmediato a Telegram y envía la respuesta del filósofo con `sendMessage` vía el gateway del conector.
- Se mantiene el `STYLE_DIRECTIVE` (respuestas cortas + contrapregunta), que encaja bien con un chat móvil.

## Sobre WhatsApp

WhatsApp Business API exige una cuenta de Meta Business verificada, un número dedicado y aprobación de plantillas; es un proceso de días y con costo por conversación. Recomiendo Telegram primero y evaluar WhatsApp después, cuando el bot ya esté probado.

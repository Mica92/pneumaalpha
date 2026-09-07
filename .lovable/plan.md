# Pagos con Lemon Squeezy (reemplazo de Paddle)

Informe previo y plan de implementación. Nada cambia hasta que apruebes.

## A. Qué se conserva tal cual

- Autenticación actual (sesión anónima + Google). No se toca.
- El `user_id` de la cuenta sigue siendo el identificador principal del comprador.
- Diseño, textos, planes y precios: Mensual US$5,50 · Semestral US$26 · Vitalicio US$36 (51 cupos).
- Muro de 12 mensajes gratis y la tabla de uso.
- Correo de confirmación de compra ya existente.

## B. Tablas

Se reutiliza la tabla existente de suscripciones y la de uso. Solo se agregan columnas nuevas:

- `ls_customer_id`, `ls_subscription_id`, `ls_order_id`, `ls_variant_id`, `ls_status`.
- Índices únicos sobre `ls_subscription_id` y `ls_order_id` para que un webhook repetido no duplique filas.
- No se crean tablas nuevas. Las columnas antiguas de Paddle quedan sin uso (no se borran, para no perder el historial).

## C. Punto de entrada del webhook

En esta app el backend vive en el propio servidor de la web (TanStack), no en funciones Edge de Supabase; usar una Edge Function aquí duplicaría infraestructura sin beneficio. El webhook será:

`/api/public/payments/lemon` (misma ruta pública ya usada hoy para pagos)

Hace:
1. Verifica la firma `X-Signature` (HMAC-SHA256 del cuerpo crudo con el signing secret) antes de leer nada.
2. Lee `meta.custom_data.user_id` y `meta.custom_data.plan`.
3. Escribe el estado con privilegios de servidor (nunca desde el navegador).

Eventos cubiertos:

| Evento | Efecto |
|---|---|
| `order_created` (vitalicio) | Acceso permanente, sin fecha de vencimiento; respeta el tope de 51 cupos |
| `subscription_created` / `subscription_updated` / `subscription_resumed` | Premium activo + fecha de renovación |
| `subscription_cancelled` | Sigue activo hasta la fecha pagada, luego expira |
| `subscription_expired` / `subscription_paused` | Premium desactivado |
| `subscription_payment_failed` | Marca el pago fallido; no revoca de inmediato |
| `subscription_payment_refunded` / `order_refunded` | Revoca el acceso (incluido el vitalicio) |

## D. Frontend que se modifica

- Ventana emergente de pago en la misma página (Lemon.js overlay), tal como funciona hoy.
- `/planes` y el selector de plan dentro del chat: mismos botones y textos, cambia solo el motor de pago por detrás.
- Se elimina el código de Paddle (script, hook, funciones de servidor, webhook y banner de modo prueba se adaptan a Lemon Squeezy).
- Los textos legales (términos, reembolsos, uso de IA, contacto) pasan a nombrar a Lemon Squeezy como vendedor registrado.

## E. Secretos y configuración

Te pediré, en un formulario seguro, tres valores:

1. `LEMON_SQUEEZY_API_KEY` — clave de API de tu tienda.
2. `LEMON_SQUEEZY_WEBHOOK_SECRET` — el mismo texto que pegues en el webhook de Lemon Squeezy.
3. `LEMON_SQUEEZY_STORE_ID` — el número de tu tienda.

Además necesito, escritos en el chat (no son secretos), los tres **variant ID** de los productos: mensual, semestral y vitalicio.

Ningún secreto queda en el navegador ni en el código.

## F. Cómo se enlaza tu usuario con el cliente de Lemon Squeezy

1. Al pulsar "Pagar", el servidor comprueba sesión, que no haya ya una suscripción activa y que queden cupos vitalicios.
2. El servidor crea el checkout en Lemon Squeezy con `custom_data = { user_id, plan }` y el correo del usuario ya rellenado.
3. Se abre la ventana emergente con esa URL.
4. Al pagar, el webhook devuelve ese mismo `user_id` y se guarda junto al customer/subscription/order de Lemon Squeezy.
5. El acceso Premium se lee siempre desde la base de datos en el servidor; el navegador nunca puede concederlo.

## Detalles técnicos

- `src/lib/lemon.server.ts`: cliente de la API (`https://api.lemonsqueezy.com/v1`) y verificación de firma.
- `src/lib/billing.shared.ts`: `PLAN_PRICE_IDS` pasa a `PLAN_VARIANT_IDS`.
- `src/lib/billing.functions.ts`: `prepareCheckout` devuelve la URL de checkout en vez de un price id.
- `src/hooks/use-lemon-checkout.ts` reemplaza a `use-paddle-checkout.ts`; carga `https://app.lemonsqueezy.com/js/lemon.js` y abre `LemonSqueezy.Url.Open(url)`.
- `src/routes/api/public/payments/lemon.ts`: webhook con verificación de firma en tiempo constante e idempotencia por `ls_subscription_id` / `ls_order_id`.
- Migración SQL: columnas nuevas + índices únicos; sin cambios de RLS (la tabla ya es de solo lectura para el dueño y escritura solo desde el servidor).
- Se eliminan `src/lib/paddle.ts`, `src/lib/paddle.server.ts`, `src/utils/payments.functions.ts` y el webhook de Paddle.

## Orden de trabajo

1. Migración de columnas.
2. Backend: cliente, checkout y webhook.
3. Frontend: hook y pantallas de planes.
4. Retiro de Paddle y ajuste de textos legales.
5. Te doy la URL del webhook para pegarla en Lemon Squeezy y probamos una compra real de prueba.

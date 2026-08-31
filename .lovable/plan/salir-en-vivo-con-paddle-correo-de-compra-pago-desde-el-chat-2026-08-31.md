# Salir en vivo con Paddle + correo de compra + pago desde el chat

Vendedor legal: **Kionas IA** (aparecerá en Términos y Privacidad).

## 1. Páginas legales (requisito de Paddle antes de publicar)

Paddle revisa el sitio y exige tres páginas públicas, fuera del login:

- `/terminos` — Términos y Condiciones: identifica a Kionas IA como vendedor, aceptación, uso indebido, propiedad intelectual, sin garantía de servicio ininterrumpido, remisión a los Buyer Terms de Paddle, divulgación de Paddle como Merchant of Record, suspensión/terminación. Cláusulas obligatorias para productos de IA generativa: uso prohibido, responsabilidad del usuario sobre prompts y resultados, derechos sobre entradas/salidas y vía de reclamo, moderación de contenido, y aviso de que las respuestas pueden ser inexactas y no sustituyen asesoría profesional.
- `/reembolsos` — Política de Reembolsos: garantía de devolución de 30 días, solicitudes gestionadas por Paddle (paddle.net) más contacto de soporte. Sin lenguaje de "todas las ventas son finales".
- `/privacy` — actualizar la página existente: nombrar a Kionas IA como responsable de datos, categorías de datos, finalidades y base legal, destinatarios (hosting/backend, analítica, Paddle como MoR, autoridades), retención, derechos, seguridad y cookies.

Enlaces a las tres páginas en el pie de página y en `/planes`.

## 2. Publicación y verificación

- Publicar el sitio con las páginas legales incluidas.
- Guiarte al panel de Pagos para completar el formulario de verificación (menos de 10 minutos) y seguir la revisión de dominio, identificación de negocio e identidad.
- Registrar el webhook del entorno **live** apuntando al dominio publicado (`/api/public/payments/webhook?env=live`) y replicar producto y precios en live cuando Paddle apruebe la cuenta.
- Mientras la cuenta no esté aprobada, el checkout en vivo devuelve `transaction_checkout_not_enabled`: el checkout mostrará un aviso claro en lugar de un error crudo.

## 3. Correo de confirmación de compra

- Configurar envío transaccional (Resend) con remitente de la marca.
- Nueva plantilla "Compra confirmada": saludo, plan adquirido (Beta / Delta / Alpha), precio y moneda, fecha de renovación o mención de acceso permanente para el Vitalicio, enlace a `/umbral` y nota de que el recibo fiscal lo emite Paddle.
- Se dispara desde el webhook al confirmarse `transaction.completed` / `subscription.created`, una sola vez por transacción (control de idempotencia), usando el correo del usuario en el backend.
- Bilingüe ES/EN según el idioma del usuario.

## 4. Botón de pago dentro del chat

- Nuevo componente mini-selector de planes que se abre desde el chat: muestra los tres planes con precio, sin salir de la conversación.
- Aparece como botón "Desbloquear acceso" en dos puntos ya existentes del chat: el bloqueo al agotar los 12 mensajes gratis y la barra de mensajes restantes.
- Al elegir un plan abre el overlay de Paddle con el mismo flujo de `/planes` (validación previa en servidor, `customData` con usuario y plan, cupo de 51 vitalicios).
- Tras el pago exitoso se refresca el estado de suscripción y el chat se desbloquea sin recargar la página.

## Detalles técnicos

- Rutas nuevas: `src/routes/terminos.tsx`, `src/routes/reembolsos.tsx` (públicas, con `head()` propio); actualización de `src/routes/privacy.tsx` y `src/components/site-footer.tsx`.
- Extraer la lógica de checkout de `src/routes/_authenticated/planes.tsx` a un hook reutilizable (`usePaddleCheckout` + datos de planes compartidos) para que el chat y `/planes` usen el mismo camino.
- Nuevo `src/components/plan-picker-dialog.tsx` montado en `src/components/chat-window.tsx`.
- Correo: función de servidor de envío + llamada desde `src/routes/api/public/payments/webhook.ts`, con marca en la tabla de suscripciones para no duplicar envíos.
- Registro del webhook live vía la herramienta de pagos una vez publicado.  
  
  
  
Incorpora la politicas standard de privacidad, de pago y devoluciones
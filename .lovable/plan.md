# Conectar los pagos de Lemon Squeezy y salir en vivo

El código de pagos ya está listo. Falta guardar la configuración de tu tienda y probar una compra real.

## 1. Seguridad primero

La clave de API quedó escrita en el chat, así que hay que darla por comprometida.

- Entra a Lemon Squeezy, borra esa clave y crea una nueva.
- La nueva clave se guarda solo en el formulario seguro, nunca en el chat.

## 2. Datos que ya tengo (no son secretos)

- Tienda: **#469370** (pneum32.lemonsqueezy.com)
- Plan mensual (US$5,50): variante **2101976**
- Plan semestral (US$26): variante **2101990**
- Plan vitalicio (US$36, 51 cupos): variante **2102005**

Estos cuatro valores los guardo yo directamente.

## 3. Datos que pegas tú en el formulario seguro

- La **nueva clave de API** de Lemon Squeezy.
- El **secreto de firma** del webhook que ya creaste.

## 4. Webhook en Lemon Squeezy

En la configuración del webhook debe quedar esta dirección:

```text
https://pneum.app/api/public/payments/lemon
```

Eventos a marcar: `order_created`, `order_refunded`, `subscription_created`,
`subscription_updated`, `subscription_cancelled`, `subscription_resumed`,
`subscription_expired`, `subscription_paused`, `subscription_payment_success`,
`subscription_payment_failed`, `subscription_payment_refunded`.

El enlace de Make no se usa: los avisos de pago llegan directo a la web.

## 5. Comprobación final

- Verifico que la web responda correctamente en esa dirección de webhook.
- Reviso que la página de planes abra la ventana de pago sin errores.
- Tú haces una compra de prueba y confirmamos que el acceso Premium se activa y llega el correo de confirmación.

## Detalles técnicos

Variables de entorno a crear:

| Nombre | Origen |
|---|---|
| `LEMON_SQUEEZY_API_KEY` | formulario seguro (clave nueva) |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | formulario seguro |
| `LEMON_SQUEEZY_STORE_ID` | `469370` |
| `LEMON_SQUEEZY_VARIANT_MONTHLY` | `2101976` |
| `LEMON_SQUEEZY_VARIANT_SEMIANNUAL` | `2101990` |
| `LEMON_SQUEEZY_VARIANT_LIFETIME` | `2102005` |

No hay cambios de código ni de base de datos: `src/lib/lemon.server.ts`,
`src/lib/billing.functions.ts`, `src/hooks/use-lemon-checkout.ts` y
`src/routes/api/public/payments/lemon.ts` ya leen exactamente estos nombres.

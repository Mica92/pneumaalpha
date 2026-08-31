# Pasarela Whop + muro de 12 mensajes + analítica propia

## Modelo de negocio a implementar

| Plan | Precio | Acceso |
|---|---|---|
| Libre | 0 | 12 mensajes en total (de por vida), cualquier filósofo. Sin historial completo, sin reporte, sin podcast |
| Mensual | USD 5,5 (~$5.000 CLP) | Todos los filósofos, historial completo, reporte, podcast |
| Semestral | USD 26 (~$25.000 CLP) | Lo mismo, 6 meses (ahorra un mes) |
| Vitalicio | USD 36 (~$35.000 CLP) | Acceso para siempre — solo las primeras 51 personas |

Cobro en dólares vía Whop; la web muestra el precio en USD y su referencia en CLP.

## Qué verá el usuario

- **Página `/planes`**: los tres planes en estilo editorial, con contador real "quedan N de 51 cupos vitalicios". Botón que abre el checkout de Whop.
- **Contador en el chat**: aviso discreto "te quedan N de 12 mensajes"; al llegar a 0, el compositor se bloquea con una invitación a suscribirse.
- **Historial completo, reporte y podcast**: quedan tras el muro para usuarios libres, con una tarjeta de invitación en lugar del contenido.
- **Perfil**: estado de la suscripción (plan, vigencia) y acceso al portal de Whop para gestionarla.
- Todo bilingüe ES/EN y con el sistema visual actual (ink/paper/bronce).

## Analítica de retención y conversión

Panel interno propio (sin terceros, sin cookies) en `/admin/analitica`, visible solo para el rol `admin`:

- Eventos registrados: visita, primer mensaje, mensajes 1–12, muro alcanzado, vista de planes, checkout iniciado, compra completada, cancelación.
- Métricas: embudo de conversión (visita → primer mensaje → muro → checkout → pago), tasa de conversión por plan, retención por cohorte semanal (D1/D7/D30), mensajes por usuario, cupos vitalicios vendidos.

## Detalle técnico

**Base de datos (migración con GRANT + RLS)**
- `subscriptions`: `user_id`, `plan` (`monthly` | `semiannual` | `lifetime`), `status`, `whop_membership_id`, `current_period_end`, timestamps. SELECT propio; escritura solo service role (webhook).
- `usage_counters`: `user_id`, `free_messages_used`. SELECT propio; incremento server-side.
- `analytics_events`: `user_id` (nullable), `session_id`, `event`, `props jsonb`, `created_at`. INSERT propio/anon; SELECT solo admin vía `has_role`.
- Función `public.lifetime_seats_taken()` para el contador de 51 cupos.

**Whop**
- Secretos: `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, y los IDs de plan (`WHOP_PLAN_MONTHLY`, `WHOP_PLAN_SEMIANNUAL`, `WHOP_PLAN_LIFETIME`). Los pediré con el gestor de secretos; mientras no existan, `/planes` muestra un estado "próximamente" en vez de romperse.
- `src/lib/billing.functions.ts`: `createCheckout` (crea la sesión de pago de Whop con `metadata.user_id` y devuelve la URL), `getEntitlement` (plan activo + mensajes restantes + cupos vitalicios).
- `src/routes/api/public/whop-webhook.ts`: verifica la firma HMAC de Whop antes de procesar; sobre `membership.went_valid` / `went_invalid` / `payment.succeeded` escribe en `subscriptions` con `supabaseAdmin` y registra el evento de conversión. Rechaza el vitalicio nº 52 (reembolso manual + aviso).

**Aplicación del muro (server-side, no solo UI)**
- `sendChat` en `src/lib/chat.functions.ts` consulta la titularidad: si no hay plan activo y `free_messages_used >= 12`, devuelve error de muro; si pasa, incrementa el contador.
- `loadFullHistory`, `report.functions.ts` y `podcast.functions.ts` exigen plan activo.
- Hook `useEntitlement` para el estado en pantalla.

**Analítica**
- `src/lib/analytics.functions.ts` con `track` (inserta evento) y `getFunnel` / `getRetention` (agregaciones SQL, solo admin).
- Pequeño helper cliente `track(event, props)` llamado en los puntos clave del recorrido.

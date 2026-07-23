## Objetivo
Bloquear el acceso a los filósofos de pago con un **desbloqueo de por vida** por usuario:
- **Gratis siempre**: Heidegger, Max Pohlenz.
- **De pago individual**: $3 USD por cada uno de los otros 13 (Schopenhauer, James, Nietzsche, Marx, Bentham, Einstein, Racionalismo, Pascal, Kierkegaard, Yannaras, Levinas, Maimónides, Aquinas).
- **Pack**: $30 USD que desbloquea los 13 restantes.
- **Oráculo y Reporte**: solo con el pack.

Compra única → se registra en la base de datos y el acceso queda ligado a la cuenta.

## 1. Proveedor de pagos
Como paso previo ejecutaré `recommend_payment_provider` para clasificar el producto (SaaS/contenido digital) y luego habilitaré **Stripe** (`enable_stripe_payments`) — es el fit natural para desbloqueos digitales con Checkout hospedado. Confirmo con el usuario antes de ejecutar el enable tool.

Configuración fiscal por defecto (según reglas de plataforma): **full compliance handling** si el país del seller lo permite, si no, tax calculation only. Se ajusta en el momento del setup.

## 2. Catálogo de productos (Stripe)
Se crearán 14 productos con `batch_create_product` después de habilitar Stripe:
- 13 × `Acceso a {Filósofo}` — $3 USD, one-time.
- 1 × `Pack completo · 13 filósofos + Oráculo + Reporte` — $30 USD, one-time.
Cada producto lleva su `tax_code` y un `metadata.philosopher_id` (o `metadata.kind = "pack"`) para que el webhook sepa qué desbloquear.

## 3. Modelo de datos (Lovable Cloud)
Nueva tabla `public.entitlements`:

```
id uuid pk
user_id uuid not null references auth.users(id) on delete cascade
kind text not null check (kind in ('philosopher','pack'))
philosopher text null            -- lleno cuando kind='philosopher'
stripe_session_id text unique    -- idempotencia del webhook
created_at timestamptz default now()
unique (user_id, kind, philosopher)
```

- RLS: `SELECT` propio para `authenticated`; `INSERT/UPDATE/DELETE` solo `service_role`.
- GRANTs estándar de plataforma.
- Función `public.has_access(_user uuid, _philosopher text)` (`security definer`) que devuelve `true` si es filósofo libre, si el usuario tiene el pack, o si tiene el entitlement individual.

## 4. Backend — server functions y ruta pública
Todo dentro del stack existente (TanStack Start), sin edge functions nuevas.

- `src/lib/entitlements.functions.ts`:
  - `getMyEntitlements()` (auth) → `{ freeIds, unlockedIds, hasPack }`.
  - `createCheckoutSession({ kind, philosopher? })` (auth) → crea Stripe Checkout Session con `success_url`/`cancel_url` de vuelta al filósofo o a `/desbloquear`, `client_reference_id = userId`.
- `src/lib/access.server.ts`: helper `assertAccess(supabase, userId, philosopher)` reutilizado por `sendChat`, `loadMessages`, `loadFullHistory`, `migrateConversation`, `runOracle`, `buildReport`. Devuelve 403 si no procede. Esto blinda la API aunque el paywall visual se saltee.
- `src/routes/api/public/stripe-webhook.ts` (`createFileRoute` bajo `/api/public/`): valida firma con `STRIPE_WEBHOOK_SECRET`, en `checkout.session.completed` lee metadata y hace `INSERT` idempotente en `entitlements` usando `supabaseAdmin` (importado dentro del handler).

Secretos nuevos que se pedirán vía `add_secret` cuando corresponda: `STRIPE_WEBHOOK_SECRET` (el `STRIPE_SECRET_KEY` y demás los provee `enable_stripe_payments`).

## 5. Frontend — paywall y estados
Nuevo hook `useEntitlements()` (React Query) que cachea el resultado de `getMyEntitlements` por sesión.

- `src/routes/$philosopher.tsx`: al montar, si el filósofo no está desbloqueado → render de `<Paywall philosopher={...} />` en vez de `<ChatWindow>`. Nada de "vista previa" del chat: paywall completo (según tu elección).
- `src/components/paywall.tsx`: pantalla en el mismo lenguaje "Arrival fog" con:
  - Nombre y glifo del filósofo.
  - Dos CTAs: **Desbloquear por $3** y **Pack completo · $30 (13 filósofos + Oráculo + Reporte)**.
  - Copy bilingüe (nuevas claves en `src/lib/i18n.tsx`).
  - Ambos botones llaman `createCheckoutSession` y redirigen a Stripe.
- `src/routes/oraculo.tsx` y `src/routes/reporte.tsx`: si `!hasPack` → `<PackPaywall />` (solo muestra el CTA de $30, ya que individual no habilita estas secciones).
- `src/routes/index.tsx` (home / bento):
  - Heidegger y Pohlenz: sin cambios.
  - Otras tarjetas: badge sutil con candado + precio ("$3" o "Incluido en pack").
  - Tarjetas de Oráculo/Reporte: badge "Pack · $30" cuando el usuario no tiene el pack.
- Nueva ruta pública `src/routes/desbloquear.tsx` (`/desbloquear`) con la parrilla completa de compras y estado (desbloqueado / bloqueado) — accesible desde el header o el paywall.
- Al volver del Checkout con `?checkout=success`, refrescar `useEntitlements()` e invalidar la query para que el filósofo cargue ya desbloqueado; toast bilingüe "Acceso desbloqueado".

## 6. i18n
Nuevas claves en `src/lib/i18n.tsx`:
- `paywall.title`, `paywall.subtitle`, `paywall.unlockOne`, `paywall.unlockPack`, `paywall.free`, `paywall.locked`, `paywall.included`, `paywall.oraculoLocked`, `paywall.reporteLocked`, `paywall.success`, `paywall.cancel`, `paywall.price.single`, `paywall.price.pack`.

## 7. Verificación
- `tsgo` para tipos.
- Playwright headless: entrar a `/schopenhauer` sin entitlement → paywall; simular entitlement en DB (vía server-fn admin de prueba) → chat carga. Confirmar que `/heidegger` y `/pohlenz` siguen abiertos siempre. Confirmar que `/oraculo` y `/reporte` bloquean sin pack.
- Probar el webhook con `stripe listen` (documentado, no ejecutado por mí).

## Fuera de alcance
- Reembolsos, precios regionales, cupones, regalar accesos, suscripción recurrente (elegiste compra única).
- Rediseño visual global — el paywall reutiliza tokens existentes.

## Detalle técnico rápido
- Free IDs en constante compartida `FREE_PHILOSOPHERS = ["heidegger","pohlenz"]` en `src/lib/philosophers.ts`; el resto es "de pago". Cambiar aquí = cambiar en todos lados.
- `assertAccess` es la fuente de verdad; el UI solo la refleja.
- Idempotencia del webhook vía `stripe_session_id UNIQUE`.

Al aprobar, ejecuto en este orden: `recommend_payment_provider` → confirmar → `enable_stripe_payments` → migración de `entitlements` + `has_access` → productos → backend + webhook + secreto → frontend + i18n → verificación.
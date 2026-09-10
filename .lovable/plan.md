# Plan: Verificación end-to-end de pagos con Lemon Squeezy

## Contexto
El usuario confirmó que los tres productos en Lemon Squeezy ya están publicados, los precios están correctos y la configuración del plan semestral es la adecuada. Los secretos del proyecto (`LEMON_SQUEEZY_API_KEY`, `LEMON_SQUEEZY_STORE_ID`, `LEMON_SQUEEZY_WEBHOOK_SECRET` y los tres `LEMON_SQUEEZY_VARIANT_*`) están configurados.

El objetivo es verificar que todo el flujo de pagos funcione correctamente, desde la creación del checkout hasta la activación de la suscripción en la base de datos.

## Pasos

1. **Verificar variantes contra la API de Lemon Squeezy**
   - Consultar cada variante configurada (`2113020`, `2113021`, `2113022`) usando la API.
   - Confirmar que existen, están publicadas, pertenecen a la tienda `469370` y tienen los precios esperados (mensual, semestral, vitalicio).
   - Si alguna variante falla, reportar el error exacto y pedir corrección.

2. **Probar creación de checkouts (server-side)**
   - Ejecutar `createCheckoutUrl` para cada uno de los tres planes.
   - Confirmar que se genera una URL válida de Lemon Squeezy para cada plan.
   - Si falla, diagnosticar si es por variante, tienda, moneda o configuración.

3. **Verificar endpoint de webhook**
   - Confirmar que la ruta `/api/public/payments/lemon` responde `401` ante una firma inválida (comportamiento esperado).
   - Revisar logs del servidor para asegurar que no hay errores de build ni de runtime en la ruta.

4. **Validar flujo de suscripción en la base de datos**
   - Simular o realizar un pago de prueba.
   - Verificar que el webhook crea/actualiza la fila en `public.subscriptions` con `status = active`, `plan` correcto, `ls_order_id`/`ls_subscription_id` y `current_period_end`.
   - Verificar que `lifetime_seats_taken` no excede el límite de 51.

5. **Verificar entitlement del usuario**
   - Después de una compra/simulación, llamar `getEntitlement` y confirmar que el usuario obtiene acceso premium.
   - Verificar que el chat deja de contar mensajes gratuitos y permite conversación ilimitada según el plan.

6. **Probar UI de `/planes` y diálogo de pago**
   - Abrir `/planes` en el preview.
   - Confirmar que los botones de pago muestran los precios correctos y abren el overlay de Lemon Squeezy.
   - Verificar que el botón de pago dentro del chat (`PlanPickerDialog`) también funciona.

7. **Publicar la aplicación**
   - Si todas las verificaciones anteriores pasan, publicar la aplicación para que el endpoint de webhook esté disponible en producción (`https://pneum.app/api/public/payments/lemon`).
   - Configurar el webhook en Lemon Squeezy apuntando a la URL de producción.

## Resultado esperado
Los usuarios pueden pagar por los tres planes (mensual, semestral, vitalicio) y, tras el pago, su suscripción se activa automáticamente, desbloqueando el acceso premium en la aplicación.

## Notas técnicas
- No se modificarán otros hallazgos de seguridad ni funcionalidades ajenas al pago.
- Si Lemon Squeezy no ofrece modo de prueba directo, se usará un pago real de bajo monto o se validará con un evento de webhook simulado de forma controlada.
- La API key expuesta previamente ya fue rotada; se usará el secreto actual configurado.

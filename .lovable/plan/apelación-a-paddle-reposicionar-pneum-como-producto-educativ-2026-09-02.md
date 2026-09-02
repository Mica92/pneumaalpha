# Apelación a Paddle: reposicionar Pneum como producto educativo, no como "chatbot de IA"

Stripe integrado no admite Chile como país del vendedor, así que la vía es apelar el rechazo de Paddle. El motivo del rechazo fue la categoría detectada ("Artificial Intelligence/Bots & Chatbots") y la falta de garantías explícitas sobre el uso de IA. La apelación tiene sentido solo si el sitio deja de leerse como un chatbot genérico y pasa a leerse como un producto cultural y educativo con controles claros.

## Qué cambia en la web

**1. Página pública de producto (nueva sección en la landing `/`)**
- Bloque "Qué es Pneum": producto editorial y educativo de filosofía — biblioteca de pensadores, mapa de ideas, rutas de lectura, análisis de textos, podcast. El diálogo es una de las funciones, no el producto.
- Bloque "Qué recibes con cada plan": lista concreta y verificable de entregables (historial completo, reporte de pensamiento, podcast, acceso a todo el catálogo).
- Bloque "Qué NO es": no es asesoría psicológica, médica, legal ni financiera; no genera compañía emocional ni relaciones simuladas; no suplanta a personas vivas.
- Datos del vendedor visibles: Kionas IA, país, correo de soporte.

**2. Página nueva `/uso-de-ia` (Política de uso aceptable de IA)**
- Cómo se generan las respuestas (modelo de lenguaje sobre personajes históricos de dominio público, con estilo documentado).
- Prohibiciones explícitas: contenido ilegal, sexual, de odio, deepfakes de personas vivas, autolesión, consejo médico/legal/financiero, jailbreaking.
- Moderación: filtrado de entradas y salidas, restricción y cierre de cuentas reincidentes.
- Aviso de seguridad: mensaje de derivación a ayuda profesional ante señales de crisis.
- Sin compañeros virtuales, sin roleplay romántico, sin personas reales vivas.

**3. Refuerzos en las páginas legales existentes**
- `/terminos`: reforzar la sección 6 con el detalle anterior y enlazar `/uso-de-ia`; edad mínima 18 años; sin uso por menores.
- `/reembolsos`: ya cumple; se añade enlace visible desde el pie y desde el checkout.
- `/privacy`: declarar explícitamente qué se envía a los proveedores de IA, retención y borrado a petición.
- Pie de página: enlaces a Términos, Privacidad, Reembolsos, Uso de IA y Contacto en todas las páginas.

**4. Página `/planes`**
- Precio, moneda, periodicidad y renovación automática explícitos por plan.
- Aviso "Paddle.com es el Comerciante Registrado" y garantía de 30 días junto al botón, no solo al pie.
- Enlace de contacto de soporte visible.

**5. Contacto y soporte**
- Página `/contacto` (o bloque en `/nosotros`) con correo de soporte, nombre legal del vendedor y país. Paddle penaliza la ausencia de datos de contacto verificables.

## Texto de apelación

Se prepara un borrador de respuesta al correo de Paddle (español e inglés) que argumenta:
- El producto es una plataforma educativa de filosofía con contenido curado propio; la IA es la interfaz, no el producto vendido.
- No entra en las categorías prohibidas: sin compañía virtual, sin contenido adulto, sin suplantación de personas vivas, sin consejo regulado.
- Lista de cambios concretos ya publicados, con URLs.

## Detalles técnicos

- Nueva ruta `src/routes/uso-de-ia.tsx` reutilizando `LegalPage` con copia ES/EN, `head()` propio (título, descripción, og, canonical).
- Nueva ruta `src/routes/contacto.tsx` (o sección en `nosotros`), mismo patrón de metadatos.
- Enlaces añadidos en `src/components/site-footer.tsx`.
- Ediciones de copia en `src/routes/terminos.tsx`, `src/routes/privacy.tsx` y en el bloque legal de `src/routes/_authenticated/planes.tsx`.
- Nuevos bloques de contenido en la landing pública, con strings bilingües vía `useI18n`.
- No se toca la lógica de facturación: `PLAN_PRICE_IDS`, el webhook y `entitlement.server.ts` quedan igual, listos para cuando Paddle apruebe.
- El borrador de apelación se guarda como documento descargable, no como página del sitio.

## Después de implementar

Publicar el sitio y enviar la apelación desde el correo de Paddle con las URLs actualizadas.

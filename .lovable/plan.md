# Mejoras a PneumaA — Umbral

## Estado actual verificado

Antes de proponer, revisé el proyecto. Algunas cosas del pedido ya existen y no hace falta rehacerlas:

- El Umbral (inicio) ya no es solo un título: tiene descripción, grilla de instrumentos, tarjeta de cita del día y tarjetas de las 19 mentes con retrato, nombre, eslogan y 3 temas de expertise.
- El chat ya tiene barra de temas, dilema del día, preguntas raíz y chips de continuación (rompehielos).
- La tipografía ya es Sora para títulos y Manrope para cuerpo (no existe CameraPlainVariable en el proyecto; si la quieres, hay que subir el archivo de fuente).
- Ya existe `sitemap.xml`.

Así que el trabajo real se concentra en lo nuevo.

## 1. Inicio y chat (prioridad)

- **Conversación aleatoria**: botón destacado en el Umbral que elige una mente al azar y entra directo al chat con una pregunta de apertura ya sugerida.
- **Descripción del proyecto**: bloque breve "qué son las conciencias reconstruidas" — cómo se construye cada voz (biografía, obra, estilo, fuentes indexadas) — visible en el Umbral, bilingüe.
- **Sugerencias por filósofo**: al abrir un chat vacío, 3–4 preguntas concretas de esa mente ("Pregúntale a Nietzsche sobre el eterno retorno"), no genéricas.
- **Estados de carga**: esqueletos (skeletons) para las tarjetas del Umbral y burbuja "pensando" durante la respuesta, en lugar del glifo a pantalla completa.

## 2. Nuevas modalidades

- **Mesa redonda** (`/mesa`): eliges un tema y hasta **3 filósofos**; responden **por turnos**, cada uno puede replicar al anterior. Cada intervención se muestra con su retrato y voz. Puedes pedir otra ronda o cerrar con una síntesis.
- **Modo Sócrates** (`/socrates`): un guía que casi no afirma; responde con preguntas para que aclares tu propia idea, y al final devuelve un resumen de a qué llegaste.
- Ambos entran como nuevos "Instrumentos" en el Umbral, con su acento de color propio.

## 3. Comunidad

- **Compartir fragmento**: botón en cada respuesta del chat que genera una tarjeta con la cita, el nombre del filósofo y la marca; se puede copiar, descargar como imagen o compartir en redes. Anónimo, nunca incluye tus datos.
- **Biblioteca de Ideas** (`/biblioteca`): los fragmentos compartidos quedan **pendientes de tu aprobación**; solo los que apruebes se muestran públicamente. Incluye un panel privado de moderación (aprobar / rechazar) accesible solo para ti.
- **Newsletter**: formulario de suscripción ("la pregunta de la semana"). Por ahora **solo capta correos** y los guarda; el envío queda para después.

## 4. Técnico

- Quitar el badge de Lovable (ajuste de publicación).
- Carga perezosa de lo no crítico: mapa de conocimiento, retratos y escenas fuera de pantalla, paneles pesados.
- Imágenes optimizadas (tamaños responsivos, `loading="lazy"`, `decoding="async"`).
- SEO: palabras clave (filosofía, IA conversacional, pensadores) en las descripciones, microdatos schema.org (`WebSite`, `Person` por filósofo, `ItemList` en la biblioteca), y sitemap ampliado con las rutas nuevas.

## Detalle técnico

- Rutas nuevas bajo `src/routes/_authenticated/`: `mesa.tsx`, `socrates.tsx`, `biblioteca.tsx`.
- Server functions nuevas: `roundtable.functions.ts` (orquesta los turnos con el mismo gateway y prompts de `philosophers.ts`), `socratic.functions.ts`, `library.functions.ts` (enviar fragmento, listar aprobados, moderar), `newsletter.functions.ts`.
- Base de datos: tablas `shared_fragments` (con `status` pendiente/aprobado/rechazado) y `newsletter_subscribers`, ambas con RLS + GRANTs; lectura pública solo de fragmentos aprobados vía política `TO anon` con columnas acotadas; moderación restringida por tabla de roles (`user_roles` + `has_role`), nunca por rol en el perfil.
- Roles: como hoy la app entra con sesión anónima silenciosa, el panel de moderación requerirá una cuenta con rol `admin`; se agregará una vía de acceso mínima para ti.
- Compartir: render de la tarjeta en canvas, sin dependencias pesadas nuevas.
- Reutilizar los tokens existentes (`glacier`, `sage`, `mist`, `font-display`) para que todo lo nuevo se vea como el resto.

## Fuera de alcance por ahora

- Envío automático del newsletter (requiere configurar dominio de correo).
- CameraPlainVariable: no está en el proyecto; se puede integrar si subes el archivo.

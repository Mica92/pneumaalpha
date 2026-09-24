# Pneum — privacidad de marca y sección editorial

## Objetivo
Convertir la privacidad en una promesa visible de Pneum y abrir una sección editorial pública, bilingüe y navegable, con contenido sustantivo, conversación moderada y la marca actualizada en toda la experiencia.

## 1. Privacidad como parte del producto
- Incorporar en la portada un manifiesto breve y visible, integrado al lenguaje editorial de Pneum:
  - **Tú controlas tu pensamiento.**
  - **Tus datos son tuyos.**
  - **Pneum no decide por ti.**
  - **Tu información no se utiliza para manipularte.**
- Reforzar esas cuatro promesas en el espacio de reflexión y en el área de memoria, justo donde la persona guarda, edita o elimina información.
- Enlazar cada promesa con explicaciones concretas de control, uso de datos y límites de la IA, sin convertir la interfaz en una página legal.
- Mantener la Política de privacidad como documento completo y alinear su lenguaje con estas promesas verificables.

## 2. Nueva sección Editorial
- Crear una portada pública en `/editorial`, con navegación por ocho categorías:
  1. Preguntas y respuestas filosóficas
  2. Filosofía
  3. Conceptos
  4. Claridad del pensamiento
  5. Podcast
  6. Ensayos
  7. Investigaciones
  8. Perspectivas de filósofos y movimientos filosóficos
- Sustituir “Decisiones” por **“Claridad del pensamiento”**, coherente con el posicionamiento definido: Pneum ayuda a estructurar y ver con claridad, no decide por la persona.
- Publicar cinco contenidos completos por categoría, 40 piezas en total, en español e inglés.
- Cada contenido tendrá título, entradilla, cuerpo editorial, categoría, autoría Pneum, fecha, tiempo de lectura, referencias cuando corresponda y enlaces relacionados.
- Crear páginas individuales compartibles e indexables con dirección estable, metadatos propios, descripción social y datos estructurados de artículo.
- Añadir filtros por categoría, búsqueda editorial y relaciones entre piezas, perspectivas, conceptos y herramientas existentes.

## 3. Podcast dentro de Editorial
- Trasladar la experiencia actual a `/editorial/podcast`, conservando catálogo, generación de episodio, voces, reproducción y transcripción.
- Redirigir `/podcast` a la nueva dirección para no romper enlaces guardados o compartidos.
- Presentar cada episodio como contenido editorial y conectarlo con artículos, conceptos y perspectivas relacionadas.

## 4. Comentarios con cuenta y moderación
- Añadir una conversación pública al final de cada artículo y episodio.
- Permitir comentar únicamente a personas con una cuenta identificada; una sesión anónima no contará como cuenta pública.
- Mostrar una invitación para entrar cuando un visitante quiera comentar, sin bloquear la lectura.
- Los comentarios nuevos quedarán **pendientes de moderación** antes de aparecer públicamente.
- Cada persona podrá editar o borrar sus propios comentarios pendientes o publicados; moderadores y administradores podrán aprobar, rechazar u ocultar comentarios.
- Incluir estados claros, contador, fecha, nombre visible y reporte de abuso; no mostrar correos ni otros datos privados.
- Validar longitud y contenido tanto en pantalla como en el servidor, con protección contra spam y sin renderizar HTML introducido por usuarios.

## 5. Marca, correos y documentos
- Cambiar “Pneuma Alpha” y “Pneum Alpha” por **Pneum** o **Pneum.app**, según el contexto.
- Actualizar los seis correos de autenticación: `SITE_NAME`, asuntos y textos visibles pasarán a “Pneum”.
- Mantener el remitente operativo ya verificado `noreply@pneum.app`.
- Cambiar en toda la web:
  - `soporte@pneumaalpha.app` → `soporte@pneum.app`
  - `privacy@pneumaalpha.app` → `privacy@pneum.app`
- Actualizar Términos, Privacidad, Contacto y Uso de IA con el nombre **Pneum.app**, los correos nuevos y fecha de revisión actual.
- Retirar la frase obsoleta “conciencias filosóficas reconstruidas” de textos visibles, manifiesto web, metadatos, descripción instalable y documentación pública.
- Reemplazarla por el posicionamiento: **un espacio para estructurar y comprender tu pensamiento con mayor claridad, usando la filosofía como instrumento**.

## 6. Navegación y footer
- Añadir **Editorial** a la navegación principal sin perder Pensar, Explorar, Mapa, Red y Perspectivas.
- Actualizar el footer para reflejar la arquitectura actual:
  - Pensar: espacio de reflexión, Oráculo, instrumentos.
  - Explorar: Editorial, perspectivas, ideas, rutas, situaciones, Red.
  - Tu espacio: mapa, recorrido, biblioteca, perfil.
  - Pneum.app: Nosotros, Contacto, Privacidad, Términos y Uso de IA.
- Usar los nuevos correos `@pneum.app` y retirar referencias a secciones antiguas o nombres anteriores.

## 7. Datos y seguridad
- Mantener los 40 contenidos editoriales en una fuente versionada y bilingüe para garantizar que existan desde el primer despliegue y sean indexables sin depender de una sesión.
- Crear una tabla `editorial_comments` con artículo, autor, texto, estado de moderación y fechas.
- Conceder acceso explícito a los roles necesarios, activar seguridad por fila y aplicar reglas para lectura pública de comentarios aprobados, gestión propia y moderación por roles.
- Reutilizar `profiles` para el nombre visible y `user_roles` para moderadores/administradores; no guardar roles en perfiles.
- Añadir funciones autenticadas para crear, editar, borrar, reportar y moderar comentarios, con validación estricta.
- Registrar vistas, categoría seleccionada y envío de comentarios sin almacenar el texto leído o escrito en analítica.

## 8. Diseño y experiencia
- Mantener la estética editorial actual: tinta, papel cálido, bronce, tipografía serif/sans y profundidad bajo demanda.
- Evitar tarjetas anidadas y una apariencia de blog genérico; la portada editorial funcionará como una publicación contemporánea conectada al producto.
- Diseñar lectura cómoda en escritorio y móvil, índice de artículo, foco visible, navegación por teclado y movimiento reducido.
- Mostrar las promesas de privacidad como lenguaje de confianza de la marca, no como avisos técnicos.

## 9. Verificación
- Recorrer de extremo a extremo: portada → manifiesto de privacidad → Editorial → cada categoría → artículo → comentario → moderación → Podcast.
- Verificar que los 40 contenidos existan en ambos idiomas, que todas las direcciones antiguas redirijan y que no queden menciones públicas a Pneuma Alpha ni correos `@pneumaalpha.app`.
- Probar lectura pública, comentario con cuenta, bloqueo de sesión anónima, edición/borrado propio y aprobación por moderador.
- Revisar metadatos únicos, sitemap, enlaces internos, escritorio, móvil, accesibilidad, errores y compilación.

## Detalles técnicos
- Rutas públicas: `/editorial`, `/editorial/$category/$slug` y `/editorial/podcast`.
- Redirección permanente desde `/podcast`.
- Contenido editorial tipado con campos localizados `{ es, en }`; comentarios persistentes en Lovable Cloud.
- La migración incluirá tabla, índices, permisos explícitos, seguridad por fila, políticas y validación de estados en una sola operación.
- Las acciones de comentarios usarán funciones de servidor autenticadas; las lecturas públicas expondrán únicamente comentarios aprobados y campos seguros.
- Se conservarán las funciones actuales del Podcast y el sistema de autenticación existente.

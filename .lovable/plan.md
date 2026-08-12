# Auditoría de PneumaA — qué mejorar y optimizar

Revisé rutas, componentes, funciones de servidor y la base de datos. Abajo va lo detectado, ordenado por impacto. Nada de esto está aplicado todavía: dime qué bloques quieres y los ejecuto.

## 1. Experiencia de entrada (alto impacto, bajo esfuerzo)

- **Parpadeo al entrar.** `/` y `/$philosopher` deciden si estás logueado en el navegador y recién ahí redirigen a `/auth`. Se ve un glifo cargando y luego un salto. Se soluciona moviendo la protección a un layout de rutas autenticadas, de modo que la redirección ocurra antes de pintar.
- **Ruta inexistente = rebote silencioso.** `/cualquiercosa` te manda al inicio sin explicación. Mejor una pantalla "esa mente no existe" con la lista de filósofos.
- **Primera conversación vacía.** Al abrir un filósofo sin historial la pantalla queda muda. Propongo un saludo breve en su voz + 3 aperturas sugeridas.

## 2. Rendimiento

- **La pantalla de chat es un solo archivo de 762 líneas** que carga historial, migración, temas, dilema y dictado. Conviene separar los paneles (archivo, migración) en módulos que se carguen sólo al abrirlos.
- **Historial completo sin paginación:** trae todos los mensajes del filósofo de una vez. Con conversaciones largas eso se vuelve lento. Paginar de 50 en 50.
- **Índice faltante en memoria del usuario:** las consultas filtran por `user_id + philosopher`, pero el índice actual sólo cubre `user_id + created_at`. Un índice compuesto acelera cada respuesta.
- **Dependencias pesadas sin uso aparente** (gráficos, carrusel, date-picker, resizable panels). Limpiar reduce el peso del bundle.
- **Imagen/íconos y fuentes:** precargar la fuente del display y marcar prioridad al primer render.

## 3. Calidad de las respuestas

- **RAG sólo para Santo Tomás.** El resto responde de memoria del modelo. Se puede extender el corpus indexado a Heidegger, Nietzsche y Kierkegaard (los más citables) con el mismo mecanismo ya construido.
- **Memoria del usuario:** se leen hasta 40 notas pero no hay proceso que las escriba de forma resumida; conviene un resumen periódico de la conversación para que el filósofo recuerde sin inflar el prompt.
- **Sin manejo visible de errores del modelo** (límite de uso, saturación): hoy sólo aparece un toast genérico. Mejor mensaje específico y botón de reintento.

## 4. Producto pendiente

- **Monetización:** los 3 USD por filósofo y el pack de 30 USD no están implementados; sólo el bot de Telegram distingue filósofos libres. Falta la tabla de desbloqueos, el bloqueo en la web y el proveedor de pago.
- **Telegram:** el código está listo pero falta activar el conector y registrar el webhook.
- **PWA sin modo offline** (hoy sólo es instalable). Se puede agregar si lo quieres.

## 5. Detalles finos

- Accesibilidad: foco visible en el compositor, `aria-live` para las respuestas que van llegando, y objetivos táctiles más grandes en móvil.
- SEO: `og:image` real en portada y fichas de filósofos (hoy no hay imagen de vista previa al compartir).
- Textos duros: revisar que todo pase por `t()` (quedan cadenas fijas en algunos paneles nuevos).

## Orden sugerido

1. Entrada sin parpadeo + estado vacío del chat + ruta inválida.
2. Rendimiento: separar paneles, paginar historial, índice en base de datos, limpiar dependencias.
3. Accesibilidad y SEO.
4. Monetización o RAG ampliado, según prioridad tuya.

### Notas técnicas

- Layout `_authenticated` con `beforeLoad` que redirige a `/auth`; mover `/` y `/$philosopher` bajo él, cuidando que `/auth` y `/privacy` sigan públicos.
- `React.lazy` para los paneles de archivo/migración dentro de `chat-window.tsx`.
- Migración: `create index on public.user_memory (user_id, philosopher, created_at desc)`.
- `loadFullHistory` con `range()` y scroll incremental.

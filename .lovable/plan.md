# Diálogos accesibles y eliminación de Mesa redonda

## Diagnóstico confirmado

- `/dialogos/$id` depende de la página `/dialogos`, pero esta no renderiza el espacio donde debe aparecer el diálogo seleccionado. Por eso seleccionar una corriente puede cambiar la dirección sin abrir su conversación.
- Los bloques «Dialogar», «Contrastar» y «Confrontar» de la portada son informativos, no controles: no abren ningún modo.
- El catálogo muestra las 16 corrientes existentes bajo nueve familias abiertas, sin búsqueda ni filtros, lo que obliga a desplazarse demasiado.
- Mesa redonda y Comparar perspectivas utilizan las mismas funciones de generación. Retirar Mesa no debe eliminar esas funciones, porque Comparar las necesita.

La generación de respuestas todavía no se ha probado en este diagnóstico: no se atribuye el fallo a la IA ni a la sesión sin comprobarlo.

## 1. Hacer que los diálogos se abran y funcionen

- Corregir la navegación para que cada corriente abra su propia pantalla, tanto desde el catálogo como mediante un enlace directo.
- Convertir los tres modos en controles reales. Elegir un modo y una corriente abrirá esa combinación; dentro del diálogo se podrá cambiar de modo o corriente sin volver a recorrer el catálogo.
- Mantener separados los mensajes y resultados de cada corriente para evitar mezclarlos al cambiar de selección.
- Comprobar Dialogar, Contrastar y Confrontar con entradas reales, incluida una segunda pregunta que use el contexto de la conversación.
- Corregir los fallos que se confirmen: conservar la pregunta si un envío falla, impedir envíos duplicados, mostrar el estado de espera en el modo correspondiente y no presentar una respuesta vacía como éxito.
- Alinear los límites del formulario con los del servicio y gestionar el historial para que una conversación no se rompa al superar los 40 mensajes permitidos por petición.
- Presentar las respuestas con títulos, párrafos y listas legibles, sin marcas de formato visibles. Mostrar errores comprensibles sin detalles internos.

## 2. Explorar corrientes sin una página interminable

- Cabecera breve, seguida inmediatamente por el selector de modo, buscador y filtro por familia.
- Un único listado compacto con nombre y descripción breve de cada corriente, ordenado alfabéticamente; sin las nueve secciones abiertas una debajo de otra.
- Mostrar hasta ocho corrientes por página, con contador de resultados y navegación anterior/siguiente. Buscar o cambiar de familia vuelve a la primera página.
- Mantener todas las corrientes existentes, con la opción «Todas» y un estado claro cuando no haya coincidencias.
- Reutilizar esta búsqueda y filtro en Contrastar, manteniendo visibles las dos o tres corrientes elegidas aunque el filtro las oculte.
- Dejar la ficha extensa de cada tradición plegada por defecto, para que la pregunta y las respuestas sean lo principal.
- Conservar la identidad editorial de Kionas y traducir los controles y avisos al español e inglés.

## 3. Eliminar Mesa redonda

- Retirar su pantalla, accesos y menciones del pie de página, Mi mapa y Umbral, además de su entrada en el mapa del sitio.
- Evitar accesos duplicados donde ya exista Comparar perspectivas.
- Mantener `/mesa` únicamente como redirección a `/comparar`, conservando los parámetros compatibles `qid` y `seats` si están presentes.
- Conservar Comparar perspectivas y sus funciones compartidas sin modificar su comportamiento.

## Detalles técnicos

- Separar `/dialogos` en una ruta contenedora con `Outlet` y una página índice `dialogos.index.tsx`; conservar la ruta de detalle y las direcciones actuales.
- Incorporar un selector de corrientes compartido para el catálogo y Contrastar, usando los componentes y tokens existentes.
- Sin cambios de modelo de IA, pagos, permisos ni estructura de datos. Solo reparar llamadas o sesión si las pruebas demuestran un fallo concreto.
- Actualizar los metadatos de las páginas afectadas y registrar las reglas estructurales en `AGENTS.md`; llevar las tareas en `roadmap.md` durante la implementación.

## Verificación

- Abrir una corriente desde el catálogo, recargar su dirección y comprobar que aparecen su nombre, modos y formulario, no el catálogo.
- Enviar una pregunta y una continuación en Dialogar; contrastar dos corrientes y confrontar una tesis con respuestas reales. Verificar la sesión que requiere la aplicación, sin introducir un inicio de sesión obligatorio.
- Probar búsqueda, familias, paginación, cambio de corriente, selección máxima y recuperación de errores en español e inglés.
- Revisar escritorio y móvil, errores de ejecución y resultado de compilación.
- Comprobar que Mesa ya no figura entre los instrumentos, que `/mesa` redirige y que Comparar sigue funcionando.
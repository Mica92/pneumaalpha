# Integración visual global: arquitectura clásica

## Objetivo

Reemplazar la red neuronal que hoy aparece detrás de todas las páginas por un sistema visual de arquitectura clásica, coherente con la nueva portada: piedra, columnas, arcos, bibliotecas y luz natural contenida. La web conservará su identidad editorial oscura, marfil y bronce, pero se sentirá como un único producto y no como pantallas diseñadas en momentos distintos.

## Dirección visual

- Mantener Cormorant Garamond + Manrope, la paleta tinta/papel/bronce y el logo actual.
- Sustituir el fondo neuronal global por una escena arquitectónica panorámica, oscura y serena, sin texto ni figuras protagonistas.
- Crear una pequeña familia de imágenes coherentes, no una sola foto repetida:
  - **Fondo global:** galería clásica abstracta y desenfocada, muy tenue, para páginas de lectura y herramientas.
  - **Exploración y catálogo:** biblioteca/archivo monumental con piedra y profundidad.
  - **Oráculo, análisis y comparación:** espacio de estudio clásico, más íntimo y concentrado.
  - **Mapa de conocimiento:** arquitectura cenital o bóveda con geometría radial, apropiada para representar relaciones.
- Aplicar velos oscuros y tratamientos monocromos para garantizar legibilidad; el color bronce aparecerá sólo en luz, líneas y acciones importantes.
- Eliminar el cambio aleatorio de color del fondo global. La experiencia tendrá una atmósfera estable y reconocible.

## Cambios en toda la web

### 1. Nuevo fondo global
- Reemplazar `NeuralBackground` por un fondo arquitectónico ambiental reutilizable.
- Mantenerlo fijo y discreto detrás del contenido, con textura de papel/grano muy leve.
- Reducir su presencia bajo formularios, conversaciones y textos largos para evitar ruido visual.
- Respetar `prefers-reduced-motion`; cualquier movimiento será un desplazamiento de luz casi imperceptible, no una animación decorativa.

### 2. Sistema común de páginas
- Crear estilos compartidos para encabezados interiores, franjas oscuras, franjas claras tipo papel, superficies editoriales, formularios y divisores.
- Unificar anchos, márgenes verticales, jerarquías y estados de interacción.
- Sustituir transparencias y tarjetas redondeadas inconsistentes por superficies más planas, bordes finos y radios contenidos.
- Mantener tarjetas sólo donde representan elementos individuales; las secciones principales serán franjas o composiciones abiertas.

### 3. Navegación y pie
- Afinar la barra superior para que funcione sobre imagen, fondo oscuro y franjas claras, conservando su estructura actual.
- Homogeneizar menús, buscador, selector de idioma, perfil y acceso con la nueva estética.
- Ajustar el pie para cerrar todas las páginas con una composición editorial más limpia y coherente con la portada.

### 4. Aplicación por familias de pantallas
- **Portada:** conservar la fotografía actual de columnas y el orden recién aprobado; ajustar transiciones hacia las secciones siguientes para que conecte con el nuevo sistema global.
- **Explorar, Perspectivas, Ideas, Rutas y Biblioteca:** encabezados con profundidad arquitectónica, filtros más sobrios y cuadrículas editoriales consistentes.
- **Oráculo, Análisis, Mesa Redonda, Comparar y Modo Sócrates:** formularios con mayor presencia, resultados en bloques de lectura claros y acciones jerarquizadas.
- **Conocimiento Universal y Mi mapa:** conservar las visualizaciones interactivas; integrarlas sobre un marco arquitectónico geométrico, sin reducir su legibilidad ni interacción.
- **Chats de filósofos:** mantener los retratos/fondos particulares de cada pensador, pero alinear controles, mensajes, paneles e historial con el nuevo sistema.
- **Perfil, Retrato, Podcast, Recorrido, Nosotros y páginas legales:** aplicar el mismo ritmo tipográfico, encabezados, superficies y fondo tenue sin alterar contenido ni funciones.

### 5. Imágenes
- Generar imágenes originales de arquitectura clásica en alta resolución y con una dirección fotográfica consistente con el hero actual.
- Usar formatos optimizados y carga diferida fuera del primer viewport.
- Evitar ruinas turísticas, clichés grecorromanos brillantes o imágenes que parezcan stock; el resultado será contemporáneo, intelectual y sobrio.

## Alcance técnico

- Actualizar el fondo global, los estilos compartidos y los componentes de navegación/pie.
- Incorporar un componente reutilizable de encabezado o ambiente de sección para evitar repetir estilos en cada página.
- Aplicar el sistema a todas las rutas de contenido e instrumentos, sin tocar su lógica, datos, autenticación ni funciones de IA.
- Conservar el bilingüismo ES/EN y los metadatos actuales; sólo se modificarán si una página necesita reflejar un nombre visual actualizado.
- No se cambiarán flujos, textos sustantivos, catálogo de filósofos ni comportamiento de herramientas.

## Verificación

- Revisar las rutas principales y una muestra de cada familia de pantallas en escritorio y móvil.
- Comprobar contraste, legibilidad, ausencia de solapamientos, menús, formularios, resultados, mapas y chats.
- Confirmar que las imágenes cargan correctamente, que el peso visual no ralentiza la experiencia y que la compilación queda limpia.

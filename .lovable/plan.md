# Portada con estética "lujo silencioso"

Rediseño visual de la portada siguiendo la maqueta que enviaste, manteniendo el posicionamiento actual y el campo de pregunta como acción principal.

## Decisiones tomadas

- El titular sigue siendo **"Claridad para preguntas difíciles."**
- El campo **"¿Qué estás intentando comprender?"** se queda en el hero, como acción principal.
- No se crea sección ni página "Para empresas".
- La foto del hero la envías tú; hasta entonces el hero usa la imagen de fondo actual con el nuevo tratamiento (degradado oscuro, viñeta lateral).

## Hero

- Alto de pantalla completa, foto a sangre con degradado oscuro de izquierda a derecha para que el texto se lea con nitidez.
- Contenido alineado a la izquierda: titular en serif grande, bajada de dos líneas, la línea bronce "Filosofía aplicada + inteligencia artificial + análisis intelectual".
- Debajo, el campo de pregunta con el botón "Pensarlo con Pneum", el selector de tono y las sugerencias rápidas, con más contraste que ahora (campo con fondo translúcido y borde fino claro).
- A la derecha, en pantallas grandes, la nota vertical "Más perspectiva. Mejores preguntas. Mejores decisiones."
- Cuando envíes la fotografía la coloco como fondo del hero sin más cambios de estructura.

## Barra superior

- Fija, con desenfoque y fondo oscuro translúcido; se vuelve sólida al bajar.
- Se mantienen los grupos actuales (Explorar, Producto, Nosotros) y el botón "Comenzar".

## Secciones

1. **Capacidades en cuatro columnas** — Explora · Analiza · Decide · Aprende, sobre fondo claro tipo papel, con iconos de línea fina y separadores verticales. Sustituye al bloque actual de tres capacidades (Comprende/Analiza/Decide), conservando los enlaces existentes.
2. **La inteligencia detrás de tu pensamiento** — franja oscura con el diagrama de nodos alrededor de "PNEUM" (Oráculo, Text Intelligence, Decision Intelligence, Philosophical Engine, Analysis Engine, Intellectual Graph) y la cadena Claridad → Juicio → Acción. A un costado, la cita "El pensamiento no es un lujo, es una herramienta de supervivencia."
3. **Demostración** — el ejemplo escrito actual ("Quiero renunciar, pero necesito el sueldo") con el nuevo tratamiento de tarjetas y sin el hueco vertical que tiene hoy.
4. **Cómo funciona** — se mantiene, con más aire.
5. **El motor: filosofía aplicada** — se mantiene con las doce perspectivas de entrada.
6. **Diseñado para cada tipo de pensador** — Personal · Académico · Ejecutivo, sobre fondo claro, tarjetas muy sobrias con imagen, título, descripción y enlace "Explorar →". Sin la tarjeta Empresarial y sin enlace a planes.
7. Se conservan Grandes ideas, Rutas, Qué es Pneum y Perspectiva del día, más abajo.
8. **Pie** — alineación limpia, enlaces ordenados por columnas, nota "Una empresa de Kionas".

## Estilo

- Se mantienen los colores y tipografías actuales (Cormorant + Manrope); no se cambian las fuentes.
- Se alternan franjas oscuras y franjas claras tipo papel, como en la maqueta.
- Bordes finos, esquinas apenas redondeadas, sin sombras marcadas.
- Transiciones suaves en enlaces y tarjetas, y aparición al hacer scroll, ligera.

## Alcance técnico

- Cambios en `src/routes/_authenticated/index.tsx`, `src/components/site-nav.tsx`, `src/components/site-footer.tsx` y utilidades de `src/styles.css` (franja clara, campo de hero, animación de aparición).
- Nuevas imágenes para las tres tarjetas de audiencia, generadas en el mismo tratamiento visual.
- El diagrama de nodos se construye con HTML y CSS, sin librerías nuevas.
- Sin cambios en el Oráculo, el chat, el grafo, la autenticación ni la base de datos.

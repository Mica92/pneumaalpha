# Portada como experiencia de producto

Rediseño de la portada (`/`) y simplificación del menú. Sin funciones nuevas, sin tocar el Oráculo, el chat ni el grafo: es trabajo de estructura, texto y diseño.

## Orden nuevo de la portada

1. **Hero** — Titular "Claridad para preguntas difíciles". Debajo: "Pneum te ayuda a comprender preguntas, problemas y decisiones complejas con mayor claridad." Segunda línea fina: "Filosofía aplicada + inteligencia artificial + análisis intelectual." Inmediatamente el campo "¿Qué estás intentando comprender?", con el texto de ejemplo "Escribe una pregunta, problema, decisión o idea…", el botón "Pensarlo con Pneum" y el selector de tono actual. Se conservan las sugerencias rápidas.
2. **Demostración** — Ejemplo fijo escrito (sin llamar a la inteligencia artificial), con el caso "Quiero renunciar, pero necesito el sueldo" mostrado en cuatro pasos: Interpretación, Reencuadre, Perspectivas (Camus · Aristóteles · Marx) y Una forma distinta de verlo. Botón "Explorar esta pregunta" que lleva al Oráculo con esa pregunta.
3. **Tres capacidades** — Comprende / Analiza / Decide, cada una enlazando a la sección existente correspondiente.
4. **Cómo funciona** — Secuencia en lenguaje humano: Escribes → Comprendemos → Confrontamos perspectivas → Ves el problema de otra manera.
5. **La filosofía aplicada es el motor** — Bloque destacado con el texto del brief; aquí entran las doce perspectivas de entrada (las tarjetas de mentes actuales), presentadas como perspectivas, no como producto.
6. **La inteligencia detrás de Pneum** — Bloque de infraestructura: Oráculo, análisis de texto, motor filosófico, grafo de ideas. Presentado como interno, sin lenguaje de perfilamiento psicológico.
7. **Usos** — Personal, Académico, Ejecutivo, Empresarial como una sola franja de texto ("Una misma infraestructura. Diferentes caminos."). Sin página de empresas ni enlaces nuevos.
8. **Resto** — Se conservan Ideas, Rutas, "Qué es Pneum" (con el legal) y Mente del día, movidos hacia abajo. Se retiran duplicaciones de "¿Qué estás buscando?" y "Para lo que te está pasando ahora" fusionándolas con las capacidades y la demostración.

## Menú

Menú visible corto: **Explorar · Producto · Nosotros** + botón destacado **Comenzar**, que lleva directamente al campo de pregunta. "Producto" despliega las secciones existentes (Oráculo, Análisis, Mesa redonda, Comparar, Modo Sócrates, Biblioteca, Podcast, Mi mapa, Retrato, Perfil) para que nada quede inaccesible. El pie mantiene todos los enlaces.

## Texto

- Se refuerzan: claridad de pensamiento, preguntas difíciles, comprender antes de decidir, más perspectivas.
- Se eliminan como mensaje principal: hablar con filósofos, mentes digitalizadas, reporte psicológico, cualquier tono de autoayuda o bienestar.
- Todo bilingüe español/inglés.

## Diseño

Se mantiene la línea editorial oscura actual (serif, marfil, bronce, líneas finas, fotografía de fondo). Mejoras: más contraste en el campo de entrada y el botón principal, más aire entre secciones, jerarquía tipográfica más marcada y revisión en móvil.

## Detalles técnicos

- `src/routes/_authenticated/index.tsx`: reestructuración completa de secciones reutilizando `card-editorial`, `btn-gold`, `PhilosopherCard`, `ToneSelect` y los datos de `src/lib/discovery.ts`. La demostración es contenido estático bilingüe local al archivo.
- `src/components/site-nav.tsx`: nuevos grupos visibles y botón "Comenzar" enlazado a `/#home-inquiry`.
- `src/lib/i18n.tsx`: claves de texto nuevas donde corresponda.
- Metadatos de la portada actualizados al nuevo titular.
- Sin cambios en `oracle.functions.ts`, chat, grafo, autenticación ni base de datos.

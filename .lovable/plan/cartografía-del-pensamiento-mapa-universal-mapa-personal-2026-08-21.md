# Cartografía del pensamiento: mapa universal + mapa personal

Dos experiencias nuevas, conectadas entre sí y con el chat, construidas por fases sin tocar el sistema actual de conversaciones. La sección actual **Conocimiento Universal** (`/conocimiento`) se mantiene tal cual.

## Qué se construye

**Explora el pensamiento humano** (`/explorar`)
- Arranca con ~10 grandes dominios (Existencia, Moral, Política, Conocimiento, Realidad, Religión, Ética, Estética, Sociedad, Mente). Nada de cientos de nodos a la vez.
- Al hacer clic, la red se expande progresivamente: dominio → filósofos y conceptos → conceptos hijos → preguntas.
- Modo foco: el nodo elegido crece, sus conexiones directas quedan nítidas, el resto se atenúa y la cámara se desplaza.
- Barra superior: buscador (filósofo, concepto, pregunta, escuela) que centra el mapa en el nodo encontrado, y filtro por tipo (filósofos / conceptos / escuelas / preguntas / épocas).
- Interruptor **Mostrar mi recorrido**: resalta en el mapa universal lo que el usuario ya exploró.
- Vista alternativa **Lista** para accesibilidad y navegación tradicional.

**Tu mapa filosófico** (`/mi-mapa`)
- Nodo central "TÚ" del que se ramifican tus filósofos, conceptos, temas y preguntas.
- Resumen editorial arriba: filósofos, conceptos, escuelas y conversaciones; y tus temas más explorados, con lenguaje intelectual (nunca puntos ni insignias).
- Estado inicial elegante: red tenue de fondo con dos llamadas — "Explorar una idea" / "Hablar con un filósofo" — nunca una pantalla vacía.
- "¿Por qué aparece aquí?" en cada nodo, con el motivo de su incorporación.
- "Camino recorrido": secuencia cronológica de tu exploración.
- Tras una conversación: aviso discreto "Tu mapa ha crecido" y animación suave de aparición e integración del nuevo nodo.

**Paneles y relaciones (en ambos mapas)**
- Al seleccionar un nodo: panel lateral en escritorio, hoja inferior en móvil, con el mapa siempre visible. Retrato solo en el panel, nunca dentro del nodo grande.
- Contenido del panel: fechas, temas, descripción breve, conceptos para explorar, perspectivas relacionadas y máximo 3–4 acciones (Conversar · Explorar ideas · Ver conexiones · Volver).
- Al seleccionar una conexión: explicación breve de la relación intelectual y CTA "Explorar esta relación".
- "También podrías explorar": sugerencias derivadas de las relaciones reales del grafo, no genéricas.

**Conexión con el chat (en las dos direcciones)**
- Desde cualquier nodo, "Conversar" abre el chat del filósofo con contexto ya cargado (p. ej. hablar con Nietzsche *sobre nihilismo*), reutilizando el `initialPrompt` que ya existe.
- Al terminar una conversación, filósofo, concepto y tema entran en tu mapa automáticamente.

## Lenguaje visual

Se mantiene la línea editorial oscura (tinta, papel, bronce, Cormorant + Manrope). Fondo profundo con textura mínima, líneas luminosas discretas, transiciones lentas: una constelación, no un diagrama de empresa. Cada tipo de entidad se distingue por forma, tamaño, borde y tipografía además del color: filósofo circular, concepto hexagonal, escuela mayor, pregunta en cápsula, usuario como nodo central especial.

## Detalles técnicos

- **Modelo de datos**: nuevo módulo `src/lib/atlas/` con entidades tipadas (filósofo, concepto, escuela, pregunta) y relaciones etiquetadas (`influenced`, `opposedTo`, `developed`, `criticized`, `respondedTo`, `belongsTo`, `explores`, `relatedTo`), todo bilingüe. Se deriva de `philosophers.ts`, `discovery.ts` y `knowledge-graph.ts` en vez de duplicarlos; preparado para cientos de filósofos y miles de aristas. La UI nunca codifica relaciones a mano.
- **Motor de grafo**: canvas 2D propio (misma técnica ya probada en `knowledge-map.tsx`), extraído a un componente reutilizable `AtlasCanvas` con zoom con rueda anclado al cursor, pan, pinch, foco animado y renderizado solo de los nodos expandidos. Sin librería nueva salvo que la escala lo exija.
- **Persistencia en la cuenta**: nueva tabla `journey_nodes` (usuario, tipo de entidad, id, contador, motivo de incorporación, marcas de tiempo) con RLS y GRANTs propios de cada usuario, más funciones de servidor autenticadas para leer y registrar. El registro local actual (`journey.ts`) se conserva como caché y se migra al iniciar sesión.
- **Rendimiento**: expansión progresiva, simulación pausada al estabilizarse, nada de listas completas en el primer render; el mapa móvil arranca en vista de foco con pocos nodos.
- **Navegación y SEO**: entradas nuevas en `SiteNav`/footer, `head()` propio por ruta y ambas rutas en el sitemap.

## Fases

1. Sistema visual del mapa + `AtlasCanvas` + modelo de datos `atlas/`.
2. `/explorar`: dominios, expansión progresiva, foco, buscador y filtros.
3. Paneles laterales, hoja inferior móvil, relaciones explicadas y sugerencias.
4. Integración con el chat en ambos sentidos.
5. `/mi-mapa`: nodo TÚ, resumen, "por qué está aquí", camino recorrido.
6. Persistencia en la cuenta y sincronización del recorrido local.
7. Vista lista, responsive fino y ajustes de rendimiento.
8. Repaso final de todo el recorrido de usuario.

Compartir el mapa como imagen queda fuera de esta entrega; se puede añadir después.

# PneumaA — Rediseño UX/UI (frontend)

Rediseño profundo de la interfaz manteniendo intactos backend, IA, autenticación, Telegram, RAG y datos de los 19 pensadores.

## Decisiones acordadas

- Solo las 19 mentes existentes (Heidegger, Nietzsche, Schopenhauer, Marx, James, Bentham, Pohlenz, Racionalismo, Pascal, Kierkegaard, Yannaras, Levinas, Maimónides, Aquino, Eckhart, Kant, Hegel, Spengler, Jünger). Ninguna ruta, idea ni recomendación mencionará pensadores que no están en la plataforma.
- Se mantienen las URLs actuales en español; las nuevas también en español (`/ideas`, `/rutas`, `/recorrido`, `/explorar`).
- Identidad visual nueva: editorial oscuro con acento dorado. Reemplaza por completo la paleta glaciar actual.
- Entrega en dos fases, con revisión intermedia.

## Nueva identidad visual

- Base: `#0B0B0D`, `#121216`, `#19191F`, `#24242B`. Superficies claras: `#F2EFE8`, `#D9D4C8`, `#A9A49A`. Acento bronce `#B89A62` reservado a CTAs, estados activos e indicadores.
- Tipografía: **Cormorant Garamond** (títulos, nombres, preguntas filosóficas) + **Manrope** (navegación, botones, cuerpo, formularios). Se cargan con `<link>` en la raíz.
- Todos los valores viven como tokens en `src/styles.css` (oklch). Ningún color escrito a mano en los componentes.
- El logo y el glifo de carga se reajustan al dorado; se conserva el nombre PneumaA.

## Arquitectura de navegación

| Ruta | Estado |
|---|---|
| `/` | Home rediseñada (hero + input + descubrimiento) |
| `/explorar` | Nueva — categorías, buscador global, resultados |
| `/umbral` | Se mantiene, reordenada como panel de instrumentos |
| `/filosofos` | Nueva — grid editorial de las 19 mentes |
| `/filosofos/$id` | Nueva — perfil completo (retrato, quién es, temas, CTA) |
| `/$philosopher` | Se mantiene (chat directo, sin romper enlaces existentes) |
| `/ideas`, `/ideas/$id` | Nuevas — grandes conceptos, construidas sobre el grafo de conocimiento existente |
| `/rutas`, `/rutas/$id` | Nuevas — recorridos por una gran pregunta, solo con mentes existentes |
| `/recorrido` | Nueva — diario intelectual del usuario a partir del historial real |
| resto (`/mesa`, `/socrates`, `/oraculo`, `/reporte`, `/analisis`, `/biblioteca`, `/conocimiento`, `/podcast`, `/privacy`) | Se mantienen, restilizadas |

## Fase 1 — Fundamentos y conversión

1. **Design system**: tokens dorados/editoriales en `src/styles.css`, tipografías, variantes de botón, tarjeta y chip; estados focus/hover accesibles.
2. **Navbar + Footer** reutilizables: PneumaA · Conversar · Explorar · Filósofos · Ideas · Mi recorrido · [Comenzar]. Menú móvil simple.
3. **Home** en el orden pedido: hero con input central ("¿Qué tienes en mente?" con ejemplos rotativos), "¿Qué estás buscando?" (6 categorías), filósofo recomendado, "Filosofía para problemas reales", CTA final, footer. El input reutiliza la función existente de emparejamiento (`matchPhilosopher`) para recomendar mentes reales.
4. **Recomendación editorial**: 2–3 mentes sugeridas con su razón, CTA "Conversar con…" y "Ver otra perspectiva".
5. **Filósofos**: listado editorial + perfil por filósofo (retrato, época, temas, pregunta central, "¿Quién es?" en lenguaje simple con "Leer más", "Habla con él sobre…" que abre el chat con contexto).
6. **Chat**: header con nombre y temas, cambiar filósofo/perspectiva visible, sugerencias contextuales bajo el último mensaje, loading contextual ("Heidegger está pensando…"), error humano con reintento, estado vacío elegante. Se conserva toda la lógica actual (historial, migración, compartir fragmento, dictado).
7. **Modos de conversación** (Conversación · Profesor · Debate · Reflexión · Provocación): selector previo al chat, implementado como directiva de estilo añadida al prompt existente, sin tocar el motor de IA.

## Fase 2 — Descubrimiento y retención

8. **Ideas** (`/ideas`): conceptos derivados del grafo de conocimiento ya existente, con explicación simple, mentes relacionadas, preguntas y CTA a conversar.
9. **Rutas filosóficas** (`/rutas`): grandes preguntas recorridas paso a paso, únicamente con las 19 mentes.
10. **Comparar perspectivas**: una pregunta, respuestas de 2–3 mentes en paralelo, CTA para continuar con una de ellas.
11. **Mi recorrido** (`/recorrido`): conversaciones, mentes exploradas, temas e historial reales; tono de diario intelectual, sin gamificación.
12. **Buscador global**: filósofos, ideas, preguntas y conversaciones, accesible desde la navbar.

## Transversal

- Mobile first: una columna, carruseles horizontales donde tenga sentido, input de chat siempre accesible al pulgar, sin overflow horizontal.
- Accesibilidad: contraste AA, foco visible, navegación por teclado, labels y aria, nunca solo color para comunicar estado.
- Rendimiento: imágenes con `loading="lazy"` y dimensiones, animaciones sutiles (fade/slide) respetando `prefers-reduced-motion`, sin dependencias nuevas salvo las fuentes.
- SEO: `head()` propio por ruta nueva con title/description/og específicos, canonical y sitemap actualizado.
- QA final: desktop, tablet y móvil; navegación, chat, selección de filósofo, buscador, estados de carga y error, autenticación y rutas existentes.

## Notas técnicas

- Fuente de verdad de datos: `src/lib/philosophers.ts` y `src/lib/portraits.ts`. Los campos que falten (época, pregunta central, "quién es" simple, temas) se añaden ahí como extensión de las estructuras actuales, sin duplicar información ni inventar contenido de mentes inexistentes.
- Categorías, rutas e ideas se construyen sobre `src/lib/engagement.ts`, `src/lib/quotes.ts` y `src/lib/knowledge-graph.ts`.
- Todo texto nuevo pasa por `useI18n` (ES/EN), como el resto de la app.
- No se tocan `chat.functions.ts`, `oracle.functions.ts`, autenticación, Supabase ni el webhook de Telegram salvo para exponer datos ya existentes a la nueva UI.
- La memoria de proyecto se actualiza: la identidad "Arrival fog" queda sustituida por la editorial dorada.

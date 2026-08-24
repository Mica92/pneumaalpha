# Integrar 6 nuevas mentes: Sartre, Camus, Berlin, Boström, Krishnamurti, Zubiri

Se suman al registro actual (37 mentes) seis pensadores más, con la misma profundidad psicológica que Heidegger, Cioran o Gadamer. Total resultante: 43 mentes.

- **Jean-Paul Sartre** — libertad, mala fe, náusea, compromiso.
- **Albert Camus** — absurdo, rebeldía, Sísifo, mediodía mediterráneo.
- **Isaiah Berlin** — pluralismo de valores, dos conceptos de libertad, erizo y zorro.
- **Christopher Jacob Boström** — idealismo racional sueco, personalismo, jerarquía de ideas vivas.
- **Jiddu Krishnamurti** — atención sin autoridad, disolución del observador, libertad de lo conocido.
- **Xavier Zubiri** — inteligencia sentiente, realidad, religación, la persona.

## Qué recibe cada nueva mente

- Nombre, subtítulo, lugar/atmósfera, glifo único, frase de apertura y blurb — todo bilingüe ES/EN.
- Prompt de sistema extenso en primera persona con la arquitectura ya usada: identidad, núcleos, mapa psicológico, forma de hablar, relación con el usuario, reglas absolutas (bloque `CORE`), instrucción final. Mantiene la directiva global de estilo (respuestas breves y contrapregunta final).
- Pregunta central para la capa de descubrimiento.
- Ficha de perfil: años, origen, 3+ temas de expertise y nota biográfica bilingüe.
- Retrato de archivo B/N y fondo de escena (su lugar, sin personas), en el mismo lenguaje visual existente.
- Aparición automática en Filósofos, Comparar, Mesa redonda, Oráculo, Explorar, Buscador y Telegram (esas vistas ya se alimentan del registro).

Notas de contenido: Boström se reconstruye desde su idealismo personalista de Uppsala (poco conocido, se trata con rigor histórico). Krishnamurti no adopta tono de gurú: interroga, no adoctrina. Sartre y Camus se mantienen distintos entre sí, incluida su ruptura.

## Fases

1. Registro y prompts: ampliar `ExtraPhilosopherId` y añadir las 6 entradas con sus prompts completos.
2. Descubrimiento y perfiles: preguntas centrales, expertise, biografías, y su inclusión en los grupos temáticos existentes.
3. Imágenes: generar 6 retratos y 6 escenas, y registrarlas en los mapas de retratos/escenas.
4. Verificación: build y revisión de que cada mente carga chat, perfil y aparece en las secciones.

## Detalles técnicos

- `src/lib/philosophers-extra.ts`: nuevos ids (`sartre`, `camus`, `berlin`, `bostrom`, `krishnamurti`, `zubiri`) en la unión `ExtraPhilosopherId` + entradas en `EXTRA_PHILOSOPHERS` (`PhilosopherId`, `PHILOSOPHERS`, `PHILOSOPHER_LIST` y los contadores dinámicos se propagan solos).
- `src/lib/chat.functions.ts`: sin cambios — la validación usa `isPhilosopherId`, no un enum literal.
- `src/lib/discovery.ts`: `CENTRAL_QUESTIONS` es un `Record` exhaustivo — requiere una entrada por id nuevo; además se suman a los grupos temáticos relevantes (existencia, política, religión, conocimiento).
- `src/lib/portraits.ts`: imports, `PORTRAITS`, `PROFILES` (años, origen, expertise, bio) y `PORTRAIT_FOCUS` si hace falta.
- `src/lib/scenes.ts`: import y registro de cada fondo nuevo.
- `src/lib/knowledge-graph.ts` / `src/lib/atlas/data.ts`: se añaden como miembros de los dominios y preguntas donde encajan (`d_existence`, `d_politics`, `d_mind`, `q_free`, `q_meaning`).
- Sin cambios de base de datos: `philosopher_id` se guarda como texto.
- Las nuevas mentes quedan fuera del set gratuito (Heidegger y Pohlenz siguen siendo las libres).

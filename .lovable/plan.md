# Integrar 18 nuevas mentes al mapa filosófico

Se suman al registro actual (19 mentes) estos pensadores, con el mismo nivel de profundidad psicológica que Heidegger o Schopenhauer:

Cioran · Rousseau · Burke · Emerson · Thoreau · Stirner · Bakunin · Arendt · Negri & Hardt (mapa dual, como Racionalismo) · Ayn Rand · Gadamer · Ibn Jaldún · Kitaro Nishida · Muhammad Iqbal · Mircea Eliade · Julius Evola · Al-Jabri · Michel Quoist

Total resultante: 37 mentes.

## Qué recibe cada nueva mente

- Nombre, subtítulo, lugar/atmósfera, glifo único, frase de apertura y blurb — todo bilingüe ES/EN.
- Prompt de sistema extenso en primera persona con la misma arquitectura ya usada: identidad, arquitectura cognitiva, mapa psicológico, interioridad filosófica, forma de hablar, relación con el usuario, temas, reglas absolutas. Mantiene la directiva global de estilo (respuestas breves y contrapregunta final).
- Pregunta central para la capa de descubrimiento.
- Ficha de perfil con 3+ temas de expertise y una nota biográfica bilingüe.
- Retrato de archivo B/N y fondo de escena (el lugar de esa mente, sin personas), en el mismo lenguaje visual existente.
- Aparición automática en Filósofos, Comparar, Mesa redonda, Oráculo, Explorar, Buscador y Telegram (esas vistas ya se alimentan del registro).

Notas de contenido: Evola y Rand se integran como reconstrucciones fieles a su pensamiento, sin apología, igual que se trató a Jünger y Spengler. Negri & Hardt es un único mapa de pensamiento en común (Imperio, multitud, trabajo inmaterial).

## Fases

1. Registro y prompts: ampliar `PhilosopherId`, el enum de validación y las 18 entradas nuevas con sus prompts completos.
2. Capa de descubrimiento y perfiles: preguntas centrales, expertise, biografías, y su inclusión en las rutas temáticas existentes.
3. Imágenes: generar 18 retratos y 18 escenas, y registrarlas en los mapas de retratos/escenas.
4. Verificación: build, revisión de que cada mente carga chat, perfil y aparece en las secciones.

## Detalles técnicos

- `src/lib/philosophers.ts`: nuevos ids en la unión `PhilosopherId` + entradas en `PHILOSOPHERS` (`PHILOSOPHER_LIST` y los contadores dinámicos se actualizan solos).
- `src/lib/chat.functions.ts`: el `z.enum` de filósofos se amplía (es el punto que ya rompió antes con Pohlenz).
- `src/lib/discovery.ts`: `CENTRAL_QUESTIONS` es un `Record` exhaustivo — requiere una entrada por id nuevo; además se suman a los grupos temáticos relevantes (política, religión, existencia, historia).
- `src/lib/portraits.ts`: `PORTRAITS`, `PROFILES` (expertise + bio) y, si hace falta, `PORTRAIT_FOCUS`.
- `src/lib/scenes.ts`: import y registro de cada fondo nuevo.
- `src/routes/api/public/telegram/webhook.ts`: sin cambios de lógica; las nuevas mentes quedan fuera del set gratuito (Heidegger y Pohlenz siguen siendo las libres), salvo indicación contraria.
- Sin cambios de base de datos: `philosopher_id` se guarda como texto.

# Filtro de tono en el chat de la portada

## 1. Terminar lo pendiente

El wordmark "Pneuma Alpha" debe quedar siempre en una sola línea (hoy puede partirse en dos en pantallas estrechas y en el nav móvil).

## 2. Nuevo desplegable "¿Cómo quieres que te hablen?"

Junto al campo de la portada ("¿Qué pregunta llevas contigo hoy?") aparece un desplegable discreto con tonos de conversación:

- Analítico — argumentos, distinciones, precisión.
- Poético — imagen, metáfora, ritmo.
- De mando — directo, imperativo, sin rodeos.
- Pragmático — pasos concretos y aplicables.
- Estoico — sobriedad, aceptación, disciplina.
- Socrático — casi solo preguntas.
- Compasivo — cercano, cuidadoso.
- Provocador — incomoda para hacer pensar.

Comportamiento:

- Estilo del panel igual al resto: vidrio oscuro, borde bronce fino, chips seleccionables; bilingüe ES/EN.
- Opción por defecto "Sin preferencia"; la elección se recuerda entre visitas en el navegador.
- Al enviar la pregunta, el tono viaja a Oráculo y de ahí al chat con el filósofo asignado.
- Efecto real: 1) el Oráculo lo usa como criterio adicional al elegir la voz, 2) el filósofo asignado responde con ese registro, sin perder su personalidad ni su contrapregunta final.
- En Oráculo el mismo selector queda visible y editable, para cambiar de registro sin volver a la portada.

## Detalle técnico

- Nuevo `src/lib/tones.ts`: `ToneId`, etiquetas `{es,en}` y una directiva de estilo por tono para el prompt; helper de persistencia en `localStorage`.
- Nuevo componente `src/components/tone-select.tsx` (desplegable accesible: `aria-expanded`, cierre con Escape/click fuera).
- `src/routes/_authenticated/index.tsx`: montar el selector en el formulario del héroe y añadir `tone` a la navegación hacia `/oraculo`.
- `src/routes/_authenticated/oraculo.tsx`: `validateSearch` acepta `tone?`; selector visible; se pasa a `matchPhilosopher` y al chat.
- `src/lib/oracle.functions.ts`: input opcional `tone`, incluido en el prompt del curador como criterio secundario (nunca por encima del tema).
- `src/lib/chat.functions.ts` + `buildSystemPrompt` en `src/lib/philosophers.ts`: parámetro opcional `tone` que añade la directiva del tono después de `STYLE_DIRECTIVE`, respetando la voz del pensador.
- Sin cambios de base de datos ni de backend.

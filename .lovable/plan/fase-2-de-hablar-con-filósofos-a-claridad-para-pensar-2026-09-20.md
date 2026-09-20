# Fase 2 — De "hablar con filósofos" a "claridad para pensar"

El objetivo: que en el primer minuto quede claro que Pneum ayuda a **comprender mejor una pregunta**, y que la filosofía es el motor, no el producto. Sin funciones nuevas: se reutiliza lo que ya existe.

## 1. El Oráculo pasa a ser la demostración de valor

Hoy el Oráculo devuelve una sola cosa: un nombre de filósofo y un párrafo explicando por qué. Se amplía la misma respuesta (una sola llamada, sin pantallas nuevas) para que muestre, en orden:

1. **Lectura de la pregunta** — "Esto parece ser sobre…", en lenguaje interpretativo ("parece", "podría"), nunca diagnóstico.
2. **Reencuadre** — "Lo que preguntas" / "Lo que también parece estar en juego". Solo aparece cuando la pregunta lo amerita.
3. **Perspectivas** — 2 a 4 voces relevantes, cada una con una línea que explica de qué trata esa mirada. No listas largas de nombres.
4. **Por qué estas perspectivas** — una frase con el criterio de elección.
5. **Una forma distinta de verlo** — bloque destacado con la nueva comprensión posible; no se presenta como "la respuesta".
6. **¿Qué quieres hacer con esta idea?** — cuatro accesos: Profundizar (chat con la voz principal), Comparar perspectivas, Analizar mi situación, Seguir preguntando.

Estados de carga con el texto "Estamos leyendo tu pregunta…".

## 2. Portada

- Se mantiene el titular y el campo actuales (ya siguen la dirección correcta).
- Se añade bajo el campo el mensaje: qué hace Pneum con tu pregunta + "La filosofía aplicada es el motor. La claridad es el resultado."
- Se corrige el bloque que dice "Seis mentes" mostrando doce: pasa a presentarlas como perspectivas de entrada, con la descripción de cada una como enfoque intelectual, no como interlocutor.
- Se revisan los textos descriptivos y metadatos de la portada para que hablen de claridad y no de "conversar con conciencias".

## 3. Lenguaje del resto del producto

- **Análisis** → "Analiza cómo estás pensando" · CTA "Analizar mi texto".
- **Mesa redonda** → "Pon tu idea a prueba".
- **Comparar** → "Mira el problema desde perspectivas diferentes".
- **Modo Sócrates** → "Hazte mejores preguntas".
- **Fichas de pensadores** → cada uno se describe como una perspectiva sobre ciertos temas.
- Se eliminan como mensaje principal: "habla con filósofos", "elige una mente", "conciencias reconstruidas", y cualquier lenguaje de terapia, coaching o bienestar.
- Etiquetas de navegación alineadas a esa jerarquía, sin agregar ni quitar secciones.

## 4. Medición

Se aprovechan los eventos ya existentes para seguir el recorrido pregunta → lectura → perspectiva → acción siguiente, añadiendo solo los que falten en los pasos nuevos del Oráculo.

## Detalles técnicos

- `src/lib/oracle.functions.ts`: el esquema de salida pasa de `{philosopher, reason}` a `{reading, reframe?, perspectives[], why, aha, philosopher}`, validado con Zod y con degradación segura si el modelo devuelve campos incompletos (se conserva el comportamiento actual como mínimo garantizado). Se mantienen el modelo, el tono y el catálogo cerrado de ids.
- `src/routes/_authenticated/oraculo.tsx`: se renderizan los bloques nuevos reutilizando `card-editorial`, `btn-gold`, `GreekGlyph` y los enlaces existentes a `/$philosopher`, `/comparar`, `/analisis`.
- `src/routes/_authenticated/index.tsx`, `analisis.tsx`, `mesa.tsx`, `comparar.tsx`, `modo-socrates.tsx`, `site-nav.tsx`, `site-footer.tsx` y las claves de `src/lib/i18n.tsx`: solo cambios de copy ES/EN.
- Sin cambios en autenticación, base de datos, rutas ni componentes de chat.

## Fuera de alcance

Memoria, grafo nuevo, nuevos pensadores, comunidad, app móvil o cualquier función mayor.

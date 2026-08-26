# Integrar 16 nuevas mentes (cuarta ola)

Se añaden estos pensadores, con el mismo tratamiento que los 43 ya existentes: prompt de conciencia viva, retrato realista B/N, escena de fondo, ficha de perfil, pregunta central y nodo en la Red neuronal.

1. Mary Wollstonecraft — derechos de la mujer, razón y educación
2. Mary Astell — proto-feminismo cartesiano, amistad y retiro intelectual
3. John Stuart Mill — libertad, utilitarismo cualitativo, sujeción de la mujer
4. Simone Weil — atención, desarraigo, gravedad y gracia
5. Rodolfo Kusch — pensamiento seminal americano, "estar" frente a "ser"
6. Humberto Giannini — filosofía de la vida cotidiana, la calle y el regreso
7. Jacques Derrida — deconstrucción, huella, différance
8. Margarita Porete — mística del alma aniquilada
9. Lucrezia Marinella — nobleza y excelencia de las mujeres
10. Madame Deshoulières — escepticismo lírico, naturaleza y desengaño
11. Madame de Sablé — máximas, moral de salón, autoconocimiento
12. Alice von Hildebrand — realismo fenomenológico, amor y persona
13. Eleonora Ziemięcka — filosofía cristiana polaca, fe y razón
14. Edith Stein — empatía, fenomenología y mística carmelita
15. Elizabeth Anscombe — intención, acción y filosofía moral
16. Matthew Lipman — filosofía para niños, comunidad de indagación

(La lista original repetía a Mill; se integra una sola vez.)

## Qué se construye

- **Prompts**: un archivo nuevo `src/lib/philosophers-wave4.ts` con la misma profundidad que las olas anteriores: identidad, arquitectura cognitiva, mapa psicológico, interioridad, forma de hablar y ritmo interno, más `subtitle`, `place`, `glyph`, `opening` y `blurb` bilingües.
- **Registro**: se añaden los ids al tipo `PhilosopherId` y al registro en `src/lib/philosophers.ts`.
- **Fotografías**: retrato realista en blanco y negro, 832×1024, mismo lenguaje visual de archivo histórico (grano analógico, estudio, sin texto), guardado en `src/assets/portraits/`. Para las figuras anteriores a la fotografía (Porete, Marinella, Astell, Deshoulières, de Sablé, Wollstonecraft) se usa el mismo tratamiento que ya se aplicó a Aquino, Pascal o Maimónides: retrato pictórico de época reproducido como placa de archivo en B/N, coherente con el resto.
- **Escenas**: fondo de chat sin personas para cada mente (`src/assets/scenes/`), registrado en `src/lib/scenes.ts`.
- **Perfil y descubrimiento**: entrada en `src/lib/portraits.ts` (años, bio, 3 temas de expertise) y pregunta central en `src/lib/discovery.ts`.
- **Red neuronal**: nodo por pensador en `src/lib/knowledge-graph.ts` enlazado a sus corrientes (feminismo, utilitarismo/liberalismo, fenomenología, misticismo, deconstrucción, pensamiento latinoamericano, filosofía analítica, educación), de modo que aparezcan en `/conocimiento`, `/explorar` y dejen huella en Tu Mapa Filosófico.

## Notas técnicas

- Se crean corrientes nuevas en el grafo cuando no existan (p. ej. `feminism`, `deconstruction`, `latin-american`, `analytic-ethics`, `philosophy-for-children`) con sus enlaces `belongs` / `influence`.
- El acceso sigue la regla actual de suscripción: libres sólo Heidegger y Pohlenz.
- Verificación final: build limpio y revisión visual de la lista de filósofos y de un chat nuevo.

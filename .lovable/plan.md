# Filtros por categorías en Comparar y Mesa Redonda

Hoy ambas pantallas muestran la lista completa de perspectivas como una fila larga de botones, sin orden ni filtro. Se añade el mismo panel de filtros que ya existe en Filósofos, adaptado al selector de asientos.

## Qué verá el usuario

En **Comparar perspectivas** y en **Mesa redonda**, encima de la lista de perspectivas:

1. Un buscador por nombre.
2. Un botón **Filtros** con contador de filtros activos que despliega un panel con grupos:
   - **Movimiento** (existencialismo, estoicismo, marxismo, liberalismo, etc.)
   - **Origen** (país o región cultural de cada pensador)
   - **Religión o tradición** (cristianismo, judaísmo, islam, budismo, hinduismo, secular, etc.)
   - **Espectro político** (izquierda, centro, derecha)
   - **Ámbito** (política, religión, ética, existencia, conocimiento, sociedad)
   - **Época** (antigua y medieval, moderna, siglo XIX, siglos XX–XXI)
   - **Nivel** (principiante, intermedio, avanzado)
3. Un **Ordenar por**: A–Z, Z–A, época antigua/reciente primero, nivel.
4. Resumen de resultados y **Limpiar filtros**.

Las perspectivas ya elegidas se mantienen visibles y quitables aunque el filtro las oculte, para no perder la selección. Todo en español e inglés.

Los ejes de origen y religión son una lectura orientativa y editable; quien no tenga una posición clara (por ejemplo, política) queda fuera al aplicar ese filtro concreto, no del resto.

## Detalle técnico

- `src/lib/discovery.ts`: añadir dos ejes nuevos junto a `POLITICS`:
  - `type RegionId` con `REGION_LABELS` y mapa `REGIONS` por pensador (Grecia, Roma, Alemania, Francia, Reino Unido, EE. UU., España/Hispanoamérica, Rusia/Europa del Este, Escandinavia, Mundo árabe, India, China, Japón, Israel/judaísmo).
  - `type TraditionId` con `TRADITION_LABELS` y mapa `TRADITIONS` (cristianismo católico, cristianismo ortodoxo, cristianismo protestante, judaísmo, islam, budismo, hinduismo, confucianismo, taoísmo, secular/ateo).
  - Helpers `regionOf(id)` y `traditionOf(id)`. Sin tocar `Facet`, `FACETS` ni datos existentes.
- Nuevo componente compartido `src/components/perspective-picker.tsx`: encapsula búsqueda, panel colapsable de filtros, orden, chips de selección y llamada `onToggle`. Recibe `selected`, `max`, `disabled`. Reutiliza la lógica de filtrado de `filosofos.index.tsx` (misma semántica: OR dentro de un grupo, AND entre grupos) y los tokens existentes (`card-editorial`, `page-form`, `focus-mist`, borde bronce, `backdrop-blur`), con `aria-expanded`/`aria-controls` y cierre con `Escape`.
- `src/routes/_authenticated/comparar.tsx` y `src/routes/_authenticated/mesa.tsx`: sustituir la lista plana de botones por `<PerspectivePicker>`, conservando `MAX_COMPARE` / `MAX_SEATS`, la preselección por `?seats=` y el resto del flujo (síntesis, rondas, medición) sin cambios.
- Sin cambios en backend, prompts, autenticación ni funciones de servidor.

## Verificación

Typecheck y build limpios; recorrido con navegador en escritorio y móvil de `/comparar` y `/mesa`: filtrar por movimiento y espectro político, comprobar que la preselección desde el Oráculo sigue intacta, que el tope de asientos se respeta y que no hay errores de consola.

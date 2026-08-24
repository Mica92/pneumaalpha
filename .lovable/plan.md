# Nuevo logo: manzana pixel-art que cambia de color con el fondo

## Qué se ve

- El chevron bronce/papel del logo se reemplaza por una **manzana en estilo pixel-art de 8 bits** (tipo Mario Bros): cuerpo de bloques cuadrados, brillo pixelado arriba a la izquierda, hoja y tallo pixelados, contorno oscuro nítido, sin bordes suaves.
- La manzana **toma el mismo color aleatorio que la red neuronal del fondo**: si en esta visita el fondo es cian, la manzana es cian; la hoja usa una variante verde/oscura del mismo tono para que siempre lea como manzana.
- El wordmark "PneumAlpha" se mantiene igual, con la "Alpha" pintada en el color del turno en lugar del bronce fijo.
- Se usa en nav, footer y cualquier lugar donde ya aparece el logo, sin cambios de tamaño ni de layout.

## Cómo funciona

- Hoy el color del fondo se sortea dentro de `NeuralBackground`. Se extrae ese sorteo a un pequeño contexto de tinte (`src/lib/tint.tsx`) montado en `__root.tsx`: elige un color de la lista existente después de la hidratación y lo expone como variable CSS global (`--tint`).
- `NeuralBackground` consume el contexto en vez de tener su propio `useState` (misma lista de 7 colores, mismo comportamiento por visita).
- `PneumaMark` se reescribe: SVG de manzana pixelada dibujada con rectángulos en una malla (viewBox 16x16, `shape-rendering: crispEdges`), rellenada con `var(--tint)` y mezclas (`color-mix`) para el brillo, la sombra y la hoja. Mantiene `role="img"` y `aria-label="PneumAlpha"`, y las mismas props (`size`, `withWordmark`, `className`).
- Antes de la hidratación el tinte cae al bronce actual, así no hay parpadeo ni desajuste SSR.

## Detalles técnicos

- Nuevo: `src/lib/tint.tsx` — `TintProvider` + `useTint()`, lista `TINTS` movida aquí.
- Editado: `src/components/neural-background.tsx` (usa `useTint`), `src/routes/__root.tsx` (envuelve con `TintProvider`), `src/components/pneuma-mark.tsx` (manzana pixel-art).
- Sin colores hardcodeados en componentes: el tinte viaja como variable CSS; el fallback es el token `--bronze`.
- El favicon y los iconos PWA (`public/favicon.png`, `icon-*.png`) son estáticos y quedan como están, salvo que pidas regenerarlos con la manzana.

# Manzana del logo: silueta plana

Simplificar la manzana pixel-art del logo a una silueta plana de una sola tinta, para que se lea nítida a 16-28px y encaje con el estilo editorial oscuro.

## Qué cambia

- La manzana pasa a ser **una sola tinta**: el mismo color aleatorio de la visita que tiñe la red neuronal del fondo.
- Se eliminan el contorno oscuro, el brillo especular y la sombra inferior (eran los que generaban ruido en tamaños pequeños).
- La hoja se mantiene como único acento: el mismo tinte al ~60% de opacidad, para que se distinga sin introducir un verde ajeno a la paleta.
- El tallo se dibuja en el tinte al ~45%, un pixel de ancho.
- La forma pixel se conserva igual (mismo grid 16x16 y misma silueta), solo cambia el relleno.
- El wordmark "Pneum**Alpha**" no cambia: sigue en Cormorant con "Alpha" en el tinte.

## Detalle técnico

- Único archivo a editar: `src/components/pneuma-mark.tsx`.
  - Quitar `HIGHLIGHT`, las constantes `shade` / `light` / `outline` y la lógica de detección de borde dentro del recorrido de `BODY_ROWS`.
  - Todos los píxeles del cuerpo se pintan con `base` (el tinte de `useTint()`, con `var(--bronze)` como fallback antes de la hidratación).
  - Hoja: `color-mix(in oklab, base 60%, transparent)`; tallo: `color-mix(in oklab, base 45%, transparent)`.
  - Se mantienen `shapeRendering="crispEdges"`, `role="img"` y `aria-label="PneumAlpha"`.
- Sin cambios en `src/lib/tint.tsx`, `neural-background.tsx`, `styles.css` ni en el favicon.
- Verificación: captura del logo a 28px (nav) y a tamaño grande con Playwright para confirmar que la silueta se lee bien sobre el fondo ink.

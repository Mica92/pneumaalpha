## Objetivo
Elevar la UX de Pneumalpha a un nivel cinematográfico y a la vez cómodo, sin romper la estética "Arrival fog". Claridad + fluidez + accesibilidad, móvil y escritorio.

## 1. Navegación global (nueva capa)
- **Barra superior persistente** (`src/components/app-shell.tsx`): logo Pneumalpha (click → home), breadcrumbs sutiles del filósofo activo, atajos a Oráculo y Reporte con iconografía discreta y estados `active`.
- **Command Palette** (`⌘K` / `Ctrl K`, botón flotante en móvil) para saltar entre filósofos, Oráculo, Reporte y "nueva conversación". Usa `cmdk` que ya trae shadcn.
- **Back gesture / breadcrumb** en `$philosopher.tsx`, `oraculo.tsx`, `reporte.tsx` — hoy el usuario queda "atrapado".
- **Transiciones de ruta** con fade + subtle translate (respetando `prefers-reduced-motion`).

## 2. Home
- Bento: al hover, cada tile respira (glow glacier, escala 1.01, no 1.05). Focus visible con anillo mist.
- Estado vacío del hero → CTA claro "Comenzar diálogo" enfocando el primer filósofo con tecla Enter.
- Chip discreto "Nuevo" para Aquinas/Racionalismo.
- Contador de filósofos animado (fade-up escalonado).

## 3. Chat (mayor impacto)
- **Composer rediseñado**: textarea autogrow, botón enviar solo activo con texto, atajo `⌘/Ctrl + Enter`, contador sutil de caracteres solo si >400. Botón dictado voz mejor posicionado, con estado "escuchando" pulsante.
- **Mensajes**: 
  - Usuario → burbuja `bg-secondary text-secondary-foreground` alineada derecha, radio asimétrico.
  - Asistente → sin burbuja, texto sobre fondo, markdown pulido (`prose`), spacing más generoso, cita en itálica cuando viene de RAG.
  - Copiar mensaje al hover, regenerar última respuesta.
- **Loader**: reemplazar dots por glifo griego con shimmer "Pensando…".
- **Auto-scroll inteligente**: si el usuario scrollea arriba, no forzar scroll; mostrar botón "↓ Volver al presente".
- **Chips de continuación** más compactos, scroll horizontal en móvil.
- **Header del chat**: sticky, con acciones (Migrar, Historial, Corpus) colapsadas en un menú `⋯` en móvil para liberar espacio.
- **Migración**: modal ya funciona; añadir preview con diff visual y confirmación con toast rico.

## 4. Micro-interacciones y motion
- Utilidades nuevas en `styles.css`: `hover-lift`, `focus-ring-mist`, `page-enter`.
- Todo respeta `@media (prefers-reduced-motion: reduce)`.
- Toasts (sonner) con posición `top-center` en móvil, `bottom-right` en desktop.
- Skeleton loaders coherentes (glacier shimmer) en vez de spinners.

## 5. Accesibilidad y ergonomía
- Tamaños táctiles ≥44×44 en botones icónicos primarios (composer, header).
- `aria-label` en todos los icon buttons; live region para streaming del asistente.
- Focus trap correcto en modales (Migrar, Historial, Root questions).
- Contraste AAA: revisar `muted-foreground` sobre `card` y ajustar si es necesario.
- Navegación por teclado completa en el bento (flechas + Enter).

## 6. Móvil
- Bottom sheet para acciones del chat (Migrar/Historial/Corpus) con drag handle.
- Composer sticky respetando safe-area (`env(safe-area-inset-bottom)`).
- Bento en 2 columnas fluidas; hero full-width arriba.

## Detalles técnicos
- Archivos nuevos: `src/components/app-shell.tsx`, `src/components/command-palette.tsx`, `src/components/chat-composer.tsx` (extraído), `src/components/scroll-to-latest.tsx`.
- Archivos modificados: `src/routes/__root.tsx` (shell + transiciones), `src/routes/index.tsx`, `src/routes/$philosopher.tsx`, `src/routes/oraculo.tsx`, `src/routes/reporte.tsx`, `src/components/chat-window.tsx`, `src/styles.css`, `src/lib/i18n.tsx` (nuevas claves ES/EN).
- Sin cambios de backend, sin nuevas dependencias (cmdk ya existe vía shadcn command).

## Fuera de alcance
- Rediseño de tokens de color (se mantiene "Arrival fog").
- Cambios en persistencia, RAG, prompts de filósofos.
- Nuevos filósofos o secciones.

Al aprobar, implemento en un solo pase coherente y verifico con Playwright que composer, navegación y command palette funcionan en móvil y escritorio.
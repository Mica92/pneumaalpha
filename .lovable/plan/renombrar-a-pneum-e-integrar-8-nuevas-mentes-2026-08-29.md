# Renombrar a "Pneum" e integrar 8 nuevas mentes

## 1. Cambio de marca: Pneuma Alpha → Pneum

El nombre visible pasa a ser **Pneum** en toda la aplicación: wordmark del logo, navegación, pie de página, títulos de pestaña, descripciones sociales, manifiesto de la app instalable y textos internos que nombran la marca.

- `src/lib/site.ts`: `SITE_NAME = "Pneum"` (la URL canónica no cambia).
- `src/components/pneuma-mark.tsx`: el wordmark muestra "Pneum" en una sola línea. El cisne de origami y su tinte dinámico se mantienen intactos.
- `src/lib/i18n.tsx`: `app.name` y todas las cadenas ES/EN que mencionan la marca.
- Metadatos por ruta (title, og:title, og:description, JSON-LD), `public/manifest.webmanifest`, `public/llms.txt`, `src/routes/privacy.tsx`, `nosotros`, `perfil`, `podcast`, etc.
- Identificadores técnicos que NO se tocan: `app.pneuma.alpha` de Capacitor, nombres de archivo/componentes, claves de `localStorage`, tablas y rutas.

## 2. Ocho nuevas mentes (quinta oleada)

Gabriel Marcel, Friedrich Hayek, Franco Volpi, Zygmunt Bauman, Jacques Maritain, Ludwig von Mises, José Ortega y Gasset, Simone de Beauvoir.

Cada una recibe el mismo tratamiento completo que las mentes existentes:

- Prompt de encarnación en primera persona con las secciones habituales (reglas absolutas, identidad, arquitectura cognitiva, núcleos, mapa psicológico, forma de hablar), en un nuevo archivo `src/lib/philosophers-wave5.ts` registrado en `src/lib/philosophers.ts`.
- Nombre, glifo, subtítulo y blurb bilingües (ES/EN).
- Retrato fotográfico en blanco y negro, estilo archivo realista, idéntico al del resto (832x1024), más imagen de ambiente para el fondo del chat.
- Ficha de perfil: época, lugar, obras, áreas de expertise (mínimo 3 temas) y pregunta central en `src/lib/portraits.ts` y `src/lib/discovery.ts`.
- Etiquetas de filtro (familia, movimiento, nivel, época, eje político) para que aparezcan correctamente en los filtros de la sección Filósofos.
- Nodos y conexiones en el mapa de la red neuronal (`src/lib/knowledge-graph.ts`).
- Alta en el sitemap y en los conteos dinámicos (ya derivados de `PHILOSOPHER_LIST.length`, se verificará que ningún texto tenga el número escrito a mano).

Supuestos: "Volpi" = Franco Volpi (filósofo e historiador italiano de la filosofía, traductor de Heidegger); "Zygmun Bumann" = Zygmunt Bauman.

## Notas técnicas

- Los prompts nuevos heredan la directiva global de estilo (respuestas breves, asertivas, cerrando con contrapregunta) y el sistema de tonos ya existente.
- Se amplía el enum de `PhilosopherId` en el validador Zod de `src/lib/chat.functions.ts` para evitar el error de validación al conversar con las mentes nuevas.
- Las vistas previas al compartir enlaces pueden tardar en reflejar el nombre nuevo, porque las plataformas guardan en caché la última vista obtenida.

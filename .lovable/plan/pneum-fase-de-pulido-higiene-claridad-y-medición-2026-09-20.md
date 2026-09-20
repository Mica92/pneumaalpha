# Pneum — Fase de pulido: higiene, claridad y medición

Objetivo: no agrandar Pneum, sino hacerlo claro, coherente y medible. No se reconstruye nada, no se añaden funcionalidades grandes, no se tocan los pagos ni la autenticación.

## Hallazgos verificados en la revisión previa

- **Navegación sobrecargada**: la barra superior tiene 11 enlaces (`Explorar, Filósofos, Ideas, Rutas, Red neuronal, Comparar, Instrumentos, Mi mapa, Buscar, Nosotros, Planes`) más idioma, perfil y salir. En pantallas medianas se apiña.
- **Buscador con callejón sin salida**: cuando no hay coincidencia, la única respuesta es "Nada por aquí. Prueba con otra palabra." Sin alternativas ni sugerencias.
- **Dato desactualizado**: la descripción de la página Buscar dice "las 19 mentes" cuando el catálogo real es mucho mayor.
- **Instrumentos incompletos**: la página de Instrumentos muestra 6 tarjetas (Oráculo, Análisis, Podcast, Mesa, Sócrates, Biblioteca). Faltan **Comparar** y el retrato de pensamiento, que sí existen como páginas.
- **Lenguaje clínico**: la sección Reporte se describe como "retrato psicológico-filosófico" en la página y en los textos bilingües.
- **Medición incompleta**: hoy se registran `visit`, `chat_opened`, `message_sent`, `paywall_hit`, `pricing_viewed`, `checkout_started`, `purchase_completed`, `subscription_canceled`, `report_viewed`, `podcast_viewed`, `history_viewed`. No hay ningún evento para pregunta escrita, Oráculo ejecutado ni perspectiva asignada, que son los pasos centrales del embudo pedido.

## Qué se va a hacer

### 1. Navegación consolidada en 4 áreas

La barra pasa a: **Mentes · Ideas · Instrumentos · Mi espacio**, más el buscador y el acceso de cuenta.

```text
Mentes       -> Filósofos, Explorar
Ideas        -> Ideas, Rutas, Red neuronal
Instrumentos -> Oráculo, Análisis, Mesa Redonda, Comparar, Sócrates, Podcast, Biblioteca
Mi espacio   -> Mi mapa, Retrato de tu pensamiento, Perfil, Planes
```

Cada área abre un menú con sus destinos. Todas las direcciones actuales siguen funcionando igual; no se borra ni se renombra ninguna página. En móvil el mismo agrupamiento, como lista plegable. Nosotros y los textos legales pasan al pie.

### 2. Portada con una sola acción

Un solo protagonista: la pregunta **"¿Qué estás intentando comprender?"**, el campo de texto y el botón **"Pensarlo con Pneum"**. El selector de tono se mantiene, discreto. Los bloques que hoy compiten con el campo (filósofos destacados, temas, rutas) bajan claramente por debajo, como exploración secundaria. No se elimina contenido, se reordena la jerarquía.

### 3. Oráculo directo

Al enviar una pregunta: se muestra la perspectiva elegida, un motivo breve y **una sola** acción visible, "Explorar esta perspectiva", que abre la conversación. Se quitan pasos y opciones intermedias que hoy compiten con esa acción.

### 4. El buscador nunca deja sin salida

Cuando no haya coincidencia exacta, en lugar de "Nada por aquí":

- una lectura de la búsqueda ("Esto parece relacionarse con incertidumbre y sentido");
- una **voz relacionada**, una **idea relacionada** y una **ruta relacionada**, elegidas con la misma lógica del Oráculo;
- la opción de llevar el texto directo al Oráculo.

Solo se sugiere contenido que existe realmente en el catálogo.

### 5. Instrumentos visibles

Se añaden las tarjetas que faltan (Comparar y el retrato de pensamiento) y se ordenan por valor: Oráculo y Análisis primero. Análisis se presenta como "Analiza una idea, argumento o texto" — argumento, conceptos, supuestos, contradicciones, influencias — y no como herramienta psicológica.

### 6. Mesa Redonda y Comparar por preguntas

Antes de la lista de nombres, un bloque de mesas y comparaciones prearmadas a partir de tensiones y preguntas ya existentes ("¿Qué significa tener un trabajo con sentido?"). La selección manual de nombres sigue disponible más abajo.

### 7. Mapa e Mi mapa

- Al buscar un nodo en la red neuronal, se centra pero **manteniendo vecinos y conexiones**, no aislado. Se ajustan zoom inicial, legibilidad de etiquetas y el panel de detalle.
- Mi mapa: estado vacío útil ("Tu mapa todavía está comenzando…") con una acción concreta, y se filtra cualquier recomendación que apunte a contenido inexistente.

### 8. Copy, coherencia editorial y capa de cuidado

- Lenguaje unificado: Pneum ayuda a pensar preguntas, problemas y decisiones complejas. Se retiran las formulaciones de "mentes digitalizadas", compañía emocional o terapia.
- Reporte pasa a llamarse **Retrato de tu pensamiento**; se elimina el lenguaje diagnóstico y se describe en términos de patrones observables. La dirección web actual se conserva.
- Revisión de los textos públicos (autores, IA, dominio público, privacidad) para quitar contradicciones. Todo punto que requiera abogado se entrega listado, sin inventar afirmaciones legales nuevas.
- Capa de cuidado **solo en las instrucciones al modelo**: ante señales de malestar intenso, tono respetuoso, sin romantizar el sufrimiento ni el nihilismo. Sin banners ni bloqueos.

### 9. Higiene y responsive

Recorrido por homepage, Oráculo, buscador, chat, Explorar, Filósofos, Ideas, Comparar, Mesa, Instrumentos, Mi mapa, Red neuronal, Planes y Perfil, en móvil, tablet, 1024 px, 1280 px y escritorio. Se corrigen desbordes horizontales, solapamientos, botones sin función, enlaces rotos, estados vacíos sin explicación y jerarquías tipográficas inconsistentes. Se corrige el dato "19 mentes" por el conteo real.

### 10. Medición del embudo

Se añaden los eventos que faltan para poder leer el recorrido completo:

```text
visita -> pregunta escrita -> oráculo ejecutado -> perspectiva asignada
-> primera interacción -> segunda sesión -> acción premium -> suscripción
```

Nuevos eventos: `question_submitted`, `oracle_run`, `perspective_assigned`, `first_interaction`, `return_session`. Se reutilizan los existentes para paywall, precios, checkout y compra. No se inventan métricas que no se puedan medir.

### 11. SEO base

Sin generar páginas nuevas. Se revisan y corrigen sitemap, canonical, direcciones duplicadas, páginas importantes excluidas y metadatos, priorizando filósofos, conceptos y preguntas reales. Cada página de pregunta termina en "Explora esta pregunta en Pneum".

## Detalles técnicos

- `src/components/site-nav.tsx`: `LINKS` se reemplaza por una estructura de 4 grupos con menú desplegable accesible (teclado + ARIA). Sin cambios de rutas ni de `routeTree`.
- Buscador: `src/routes/_authenticated/buscar.tsx` gana un fallback semántico que llama a `matchPhilosopher` (`src/lib/oracle.functions.ts`) cuando `hits.length === 0`, más selección de idea/ruta relacionada desde `src/lib/discovery.ts`.
- Analítica: se amplía `ANALYTICS_EVENTS` en `src/lib/analytics.functions.ts` y se instrumentan portada, `/oraculo`, `chat-window` y la sesión de retorno vía `src/lib/analytics.ts`. La tabla `analytics_events` ya acepta cualquier evento; no hace falta migración.
- Copy bilingüe: todos los textos nuevos entran en `src/lib/i18n.tsx` con claves `es`/`en`.
- Capa de cuidado: directiva añadida al prompt compartido en `src/lib/philosophers.ts` / `chat.functions.ts`. Sin cambios de infraestructura.
- Sin cambios en pagos, autenticación, base de datos ni dependencias nuevas.

## Entrega final

Al terminar entrego: cambios realizados, problemas encontrados, problemas no resueltos y por qué, eventos y embudo preparados, recomendaciones para la fase siguiente (sin implementar) y checklist de QA en escritorio, tablet y móvil.

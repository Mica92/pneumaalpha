# Pneum — Personal Decision Intelligence

Transformación completa de la experiencia en una sola pasada. Se conserva todo lo que ya funciona (71 perspectivas, conversaciones, Oráculo, Comparar, Mesa Redonda, Análisis, Modo Sócrates, Lens, insights guardados, mapa, rutas, ideas, seguridad ante crisis, autenticación anónima y Google, bilingüe ES/EN). Cambia cómo se entra, cómo se ve y cómo se cuenta.

Decisiones tomadas: se retira la estética de arquitectura clásica; menú mínimo de cuatro entradas; acceso totalmente libre, sin planes; entrega completa.

## 1. Posicionamiento y lenguaje

- Pneum se presenta como inteligencia para decidir con filosofía aplicada, no como "chat con filósofos" ni biblioteca.
- Frase central: "No necesitas otra respuesta. Necesitas ver la pregunta de otra manera."
- Verbos permitidos: comprender, examinar, descubrir, distinguir, cuestionar, decidir. Fuera: transformar, sanar, desbloquear, potencial, manifestar.
- Cerca de cada momento decisivo aparece "La decisión sigue siendo tuya".
- Todo el copy nuevo en español e inglés.

## 2. Sistema visual nuevo

- Se retiran los fondos de arquitectura clásica, columnas y todo lo grecolatino: fuera el fondo global y las atmósferas por sección.
- Base sobria: tinta, blanco cálido, gris piedra. Acentos con significado: cobre muy contenido para acciones, oliva oscuro para lo guardado, azul profundo para tensiones.
- Se mantiene el contraste tipográfico serif editorial (titulares) + sans limpia (interfaz).
- "Calm density": mucho aire en lo conceptual, más densidad al explorar información. Menos tarjetas, bordes finísimos, sin degradados ni sombras pesadas.
- Movimiento sutil y con sentido: aparición progresiva de insights, conexión de nodos, microinteracción al guardar. Respeta reducción de movimiento.

## 3. Home como entrada al producto

Orden:

1. **Hero**: "Hay decisiones que no necesitan más consejos. Necesitan más claridad." Subtítulo con filosofía aplicada. Campo de entrada dominante ("¿Qué estás intentando comprender?") y cuatro intenciones: tomar una decisión, entender una situación, examinar una idea, entenderme mejor. La intención enruta internamente; el usuario no elige herramienta.
2. **Demostración interactiva**: con el ejemplo del cambio de trabajo se revela paso a paso qué parece ser la decisión, qué puede haber debajo y una pregunta de clarificación. Se experimenta Pneum sin registrarse.
3. **Qué hace Pneum**: Clarificar · Examinar · Descubrir.
4. **La diferencia**: la transformación de la pregunta, de "¿debería aceptar este trabajo?" a la pregunta que realmente importa.
5. **El motor filosófico**: las perspectivas como instrumentos de pensamiento (Aristóteles → virtud, Nietzsche → valores, Heidegger → existencia…), no como catálogo de fichas.
6. **Mapa de pensamiento**: "Con cada conversación, Pneum aprende algo sobre cómo piensas." Visualización elegante, nunca diagnóstico ni test.
7. **Con el tiempo**: hoy → después → con el tiempo (decisión → insight → patrón → mapa).
8. **Qué quieres comprender**: casos reales (carrera, relaciones, mudanza, emprender, identidad, propósito).
9. **Tu pensamiento te pertenece**: privacidad y control visibles.
10. **Cierre** con el mismo campo de entrada.

Salen de la home: catálogo largo de pensadores, bloques repetidos y secciones sobrantes.

## 4. Navegación mínima

- Público: Decidir · Explorar · Mapa · Perspectivas, con un único botón de inicio de sesión.
- Autenticado: Inicio · Nueva reflexión · Mapa · Historial · Perspectivas · Cuenta.
- Oráculo, Comparar, Mesa Redonda, Análisis y Modo Sócrates siguen existiendo con sus rutas actuales; se llega a ellos desde la conversación y desde una página de instrumentos dentro de Explorar. Ninguna ruta se elimina ni se rompe.
- En móvil, barra inferior: Inicio · Decidir · Mapa · Explorar.

## 5. Conversación como espacio de trabajo

- Cabecera con contexto vivo ("Decisión · Carrera · Identidad") en vez de barra de chatbot.
- Entrada principal: "¿Qué estás intentando comprender?" con texto largo cómodo.
- La respuesta deja de ser un muro de texto y se estructura visualmente: lo que estoy entendiendo · lo que puede estar en juego · una tensión · una pregunta que abre la decisión · perspectivas · siguiente movimiento.
- Pneum Lens ya existente se integra en esta estructura en lugar de vivir aparte; mismas acciones (profundizar, contrastar, guardar insight) más "Explorar esta tensión".
- Progressive revelation: la profundidad aparece cuando hace falta, no toda de golpe.
- La capa de seguridad ante señales de crisis se mantiene intacta y por encima de todo.

## 6. Perspectivas en dos niveles

- Nivel 1: lentes (existencial, ética, pragmática, política, material, espiritual, psicológica, histórica).
- Nivel 2: los pensadores que representan esa lente, con sus conceptos.
- La búsqueda, los filtros por categorías y las fichas actuales se conservan bajo este nuevo acceso.

## 7. Mapa de pensamiento y panel personal

- El mapa personal se presenta como mapa de pensamiento: zoom, nodos, concepto seleccionado, reflexiones asociadas y evolución en el tiempo (ahora, 30 días, 6 meses).
- Al abrir un nodo se muestra en cuántas reflexiones apareció y cómo cambió su sentido, sólo con datos reales del usuario.
- "Thinking Home" reemplaza el panel actual: en qué estás pensando, tensiones activas, conceptos emergentes, decisiones abiertas y una observación de Pneum. Cada bloque aparece sólo con actividad real.
- Sección de control: ver qué recuerda Pneum, corregir, eliminar elementos y exportar.

## 8. Medición, SEO y accesibilidad

- Eventos del recorrido completo: intención elegida, pregunta enviada, primer insight, tensión explorada, contraste, insight guardado, retorno. Nunca se guarda el texto de la pregunta junto al evento.
- Metadatos orientados a decisiones difíciles, claridad para decidir y filosofía aplicada, además de los términos filosóficos actuales.
- Contraste WCAG, navegación por teclado, foco visible, tamaños legibles y responsive completo.

## Detalles técnicos

- Se eliminan `ArchitecturalBackground`, `PageAtmosphere` y los assets de arquitectura asociados; los tokens de color y superficie se redefinen en `src/styles.css` sin colores literales en componentes.
- Nuevos componentes compartidos reutilizables: composer de reflexión, bloque de conversación estructurado, tarjetas de insight/tensión/perspectiva/decisión, nodo y mapa de pensamiento, tarjeta de patrón y línea de tiempo.
- `src/routes/_authenticated/index.tsx`, `site-nav.tsx`, `site-footer.tsx`, `chat-window.tsx`, `pneum-lens.tsx`, `mi-mapa.tsx`, `perfil.tsx`, `filosofos.index.tsx` y `explorar.tsx` se reescriben sobre la lógica existente; sin duplicar sistemas.
- La estructura de la respuesta se obtiene reutilizando el motor de Lens ya presente; no se cambian prompts de seguridad ni el modelo de chat.
- Nueva página de instrumentos y nueva vista de lentes conceptuales, con `head()` propio y canónico; sitemap actualizado.
- Sin cambios en base de datos, autenticación ni funciones de servidor existentes, salvo eventos analíticos nuevos.
- Todo texto nuevo pasa por `useI18n` en ES y EN.

## Verificación

Compilación y typecheck limpios, y recorrido real en escritorio, tablet y móvil: home → intención → conversación estructurada → tensión → contraste → guardar insight → Thinking Home → mapa → perspectivas por lente. Se comprueban contraste, teclado, foco, estados vacíos, seguridad ante señales de crisis y que ninguna función actual quede rota.

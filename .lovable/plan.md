# Pneum — Rearquitectura de experiencia

Evolución del producto actual, no una web nueva. Se conserva todo el motor existente (conversaciones, catálogo, grafo, mapa personal, análisis, seguridad, autenticación) y se reorganiza la experiencia alrededor de un solo recorrido: una pregunta real se vuelve una pregunta mejor.

Decisiones tomadas: titular "Hay preguntas que no se resuelven con otro consejo."; sin página de planes (todo sigue libre); "perspectivas" como palabra oficial en ES y EN; entrega completa en una sola pasada.

## 1. Lenguaje y datos únicos

- "Perspectivas" reemplaza mentes, voces, conciencias, interlocutores y personajes en toda la interfaz, en español e inglés.
- Un solo dato con el total real de perspectivas, consumido por portada, catálogo, filtros y textos. Se elimina cualquier número escrito a mano.
- Se retira todo lo que sugiera conciencia digitalizada. Cada perspectiva se declara como construcción editorial basada en obra publicada.

## 2. Portada

Orden nuevo:

1. Hero con el titular, subtítulo y el campo de pregunta como elemento dominante ("¿Qué estás intentando comprender?"), con ejemplos breves debajo y un solo botón: "Pensar con Pneum".
2. Demostración del método: pregunta → supuestos → tensiones → perspectivas → contraste → nueva pregunta, revelada paso a paso con un ejemplo real.
3. Los tres instrumentos: Oráculo (encuentra perspectivas), Mesa Redonda (pone la pregunta en conflicto), Análisis (descubre qué estás dando por supuesto, útil también para estudiantes, investigadores, periodistas y equipos).
4. Situaciones reales en vez de perfiles Personal/Académico/Ejecutivo: tomar una decisión difícil, cambiar de trabajo, entender una relación, justificar una decisión ya tomada, examinar una idea, entender un conflicto.
5. Descubrimiento: ideas, rutas, perspectivas.
6. Confianza: cómo se construye una perspectiva (fuentes, criterio editorial, estructura, comportamiento, límites). Sin inventar equipo, credenciales ni instituciones; queda la estructura para completarla.
7. Cierre con el mismo campo de pregunta.

Al enviar la pregunta, el usuario entra directo al Oráculo con lectura, tensiones y perspectivas sugeridas. Nunca se le pide elegir un filósofo primero. La pregunta no viaja en la dirección web.

## 3. Navegación

Un solo menú en toda la web:

- Explorar: Ideas, Perspectivas, Rutas, Mapa
- Pensar: Nueva pregunta, Oráculo, Mesa Redonda, Análisis
- Mi espacio: Historial, Mi mapa, Retrato, Biblioteca
- Nosotros

Con un único botón destacado: "Pensar una pregunta". Pie unificado con la misma estructura. En móvil, menú simplificado y campo de pregunta siempre a un toque.

## 4. Recorrido entre instrumentos

- Oráculo devuelve lectura, tensiones detectadas, perspectivas sugeridas y el siguiente paso.
- Comparar / Mesa Redonda abre con perspectivas ya propuestas ("Pneum encontró perspectivas que podrían discrepar sobre esto") y una línea que explica por qué discrepan. El usuario puede cambiarlas.
- Toda comparación cierra con: qué está en conflicto, en qué coinciden, en qué se contradicen, qué supuesto queda en cuestión y qué nueva pregunta aparece, más "Continuar pensando".
- Desde ahí se puede seguir en conversación, guardar en el mapa o abrir el grafo como descubrimiento, nunca como paso obligatorio.
- Mesa Redonda gana presencia propia como instrumento central.

## 5. Descubrimiento

- Ideas sigue siendo la puerta principal: conceptos como existencia, libertad, sentido, poder, identidad, amor, muerte, justicia, verdad, voluntad, virtud, Dios, el otro. Cada idea lleva a perspectivas, pensadores, rutas y preguntas relacionadas.
- Perspectivas conserva búsqueda y filtros, y suma tres entradas: por persona, por idea y por problema (duelo, trabajo, identidad, poder).
- Cada ficha responde: quién es, qué ideas representa, conceptos centrales, en qué temas sirve, influencias, preguntas relacionadas, conversar y comparar con.
- Rutas se presentan como preguntas ("¿Qué significa vivir bien?") con cuatro perspectivas, la tensión entre ellas, preguntas de continuación y un cierre "¿Qué piensas tú ahora?".

## 6. Mi espacio

Un solo lugar con conversaciones, preguntas anteriores, ideas exploradas, perspectivas consultadas, rutas completadas, mapa personal y retrato de pensamiento. El mapa se agrupa por temas de vida (trabajo, relaciones, sentido) para responder "¿qué he estado pensando?". Lenguaje descriptivo, nunca clínico ni diagnóstico.

## 7. Nosotros

Se reescribe empezando por el problema: muchas decisiones difíciles están mal formuladas. Luego método, criterio editorial, cómo se construye una perspectiva, límites y misión. Sin grandilocuencia ni afirmaciones sobre entrenar modelos propios.

## 8. Conversación

- Autoscroll hacia la respuesta nueva sin interrumpir la lectura.
- Estados de espera que describen fases reales (leyendo la pregunta, buscando perspectivas, comparando puntos de vista), sin inventar actividad.
- "No sé" se acepta con calma y se pide contexto en vez de fabricar profundidad.
- Envío único con Enter y Ctrl+Enter, botón bloqueado mientras procesa.
- La capa de seguridad ante señales de crisis se mantiene intacta y por encima de cualquier perspectiva.

## 9. Diseño

Se mantiene la dirección editorial actual (marfil, tinta, bronce, Cormorant + Manrope, arquitectura clásica de fondo) y se unifica: menos tarjetas, más composición editorial, más aire, jerarquías tipográficas consistentes, animaciones suaves de aparición, sin brillos ni degradados. Botones, campos, encabezados y estados se consolidan en un solo conjunto reutilizable, sin estilos sueltos por página.

## 10. Páginas indexables por situación

Páginas reales con contenido propio, no generadas en masa: cuatro a seis situaciones (por ejemplo "debería renunciar", "cambiar de trabajo", "entender un conflicto") con título, descripción, contenido único, llamada a la acción y navegación relacionada. Las páginas de ideas y perspectivas existentes se refuerzan con metadatos propios.

## 11. Medición

Eventos del recorrido: visita, pregunta iniciada, pregunta enviada, primer insight, perspectiva vista, comparación iniciada, mesa redonda iniciada y completada, análisis iniciado, ruta iniciada y completada, cuenta creada. La métrica de activación es el primer insight, no el registro. Nunca se guarda el texto de la pregunta junto al evento.

## Detalles técnicos

- Fuente única de datos: constante derivada de `PHILOSOPHER_LIST` para el total; se eliminan literales en componentes.
- Navegación y pie unificados en `site-nav.tsx` / `site-footer.tsx`; se elimina cualquier variante duplicada.
- Nuevos componentes compartidos: campo de pregunta, ejemplos, vista previa de insight, tarjeta de perspectiva, selector de perspectivas, bloque de síntesis, sección de confianza, bloque de CTA.
- Tokens en `src/styles.css`: se consolidan espaciados, radios, bordes, anchos máximos y transiciones; sin colores literales en componentes.
- Rutas nuevas bajo `src/routes/_authenticated/situaciones.*`, con `head()` propio y canónico; se actualiza el sitemap.
- Sin cambios en autenticación, base de datos, prompts de seguridad ni funciones de servidor existentes salvo lo descrito (síntesis y sugerencias reutilizan la infraestructura ya presente).
- Todo el texto nuevo pasa por `useI18n` en ES y EN.
- No se crea página de planes ni se activa cobro.

## Verificación

Compilación limpia, revisión de errores, y recorrido visual en escritorio, tablet y móvil de: portada, Oráculo, Comparar, Mesa Redonda, Análisis, Ideas, Perspectivas, Rutas, Mi espacio, Mapa, Nosotros y una conversación completa. Se comprueba contraste, navegación con teclado, foco visible, estados vacíos y que ninguna función actual quede rota.

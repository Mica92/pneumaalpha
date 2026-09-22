# Pneum — Una interfaz para pensar

Evolución del producto actual. Se conserva todo lo que ya funciona (conversaciones, catálogo de 71 perspectivas, Oráculo, Comparar, Mesa Redonda, Análisis, mapa, rutas, ideas, seguridad ante crisis, autenticación, estética arquitectónica) y se reorganiza la experiencia alrededor de un solo recorrido continuo: pregunta → tensión → perspectiva → contraste → nueva pregunta → insight guardado.

Lo que ya está hecho de este documento y no se rehace: terminología "perspectivas", envío único en el chat, capa de seguridad, la pregunta fuera de la URL, síntesis en Comparar, estados de espera reales, portada con el titular y el campo de pregunta, páginas por situación, filtros por categorías.

## 1. Pneum Lens (lo nuevo central)

Un panel contextual que muestra lo que está emergiendo, no el razonamiento del modelo.

- En escritorio: conversación al centro, Lens a la derecha. En móvil: hoja inferior que se abre con un botón discreto.
- Contenido: **En juego** (conceptos), **Tensión**, **Perspectivas relacionadas**, **Pregunta abierta**, **Nueva pregunta**. Cada bloque aparece sólo cuando existe contenido real.
- Se alimenta de una llamada ligera al motor ya existente que devuelve esa síntesis en formato estructurado después de cada respuesta. No se muestran prompts ni pasos internos.
- Mismo componente reutilizado, con distintos estados, en Oráculo (lectura + perspectivas), Comparar (acuerdo, desacuerdo, síntesis) y Rutas (evolución de la pregunta).

## 2. La conversación como espacio de pensamiento

- Dos voces distinguibles: la perspectiva (por ejemplo Camus) y **Pneum**, que aporta la lectura de la estructura ("Parece haber una tensión entre libertad y seguridad").
- Bloques visuales propios para respuesta, pregunta de continuación, insight, tensión, contraste y nueva pregunta, en vez de burbujas iguales.
- Acciones contextuales bajo la respuesta, sólo las pertinentes: **Profundizar**, **Contrastar**, **Guardar insight**.
- "Contrastar" sugiere una o dos perspectivas que discreparían y abre el contraste conservando pregunta, contexto y tensión, sin volver al menú.
- Autoscroll hacia la respuesta nueva sin interrumpir la lectura, con retorno fácil.

## 3. Nueva pregunta como objeto

Cuando aparece una pregunta emergente se muestra el par original → emergente, con tres acciones: explorar, guardar y convertirla en una conversación nueva. Es la pieza que cierra cada experiencia importante.

## 4. Insights guardados

- Nueva forma de guardar momentos intelectuales sueltos (una frase, su contexto, la perspectiva y la pregunta de origen), no sólo el chat completo.
- Se acumulan en Mi espacio y en la Biblioteca personal.

## 5. Mi espacio — "Lo que has estado pensando"

Una sola pantalla que reúne preguntas exploradas, ideas y tensiones recurrentes, perspectivas consultadas, insights guardados, preguntas abiertas, mapa personal y retrato. Cada bloque aparece sólo con actividad real; nada inventado, nada clínico.

## 6. Portada más corta

Se reduce a seis bloques: hero con el campo de pregunta; demostración del método con una pregunta real; "Pneum hace cinco cosas" (entiende, detecta, pone en perspectiva, contrasta, reformula); una pregunta y tres movimientos (Oráculo, Mesa Redonda, Análisis) como un solo recorrido; explorar (ideas, rutas, perspectivas) compactado; confianza y cierre con el campo de pregunta.

Salen de la portada, sin desaparecer del producto: catálogo grande de pensadores, perspectiva del día, bloques técnicos repetidos y los perfiles Personal/Académico/Ejecutivo, que se sustituyen por intenciones ("Quiero entenderme", "Tengo que tomar una decisión", "Quiero analizar una idea", "Estoy intentando entender un conflicto", "Quiero explorar filosofía").

## 7. Navegación

Un único menú en todo el sitio: Explorar (Ideas, Perspectivas, Rutas, Mapa) · Pensar (Nueva pregunta, Oráculo, Comparar, Análisis, Mesa Redonda) · Mi espacio (Mi mapa, Mi recorrido, Biblioteca, Retrato) · Nosotros, con el botón permanente "Pensar una pregunta". El pie repite la misma estructura.

## 8. Comparar

Abre con "Pneum encontró perspectivas que podrían discrepar sobre esto" y las propone ya elegidas con el motivo; el usuario puede cambiarlas con los filtros actuales. Cierra siempre con conflicto, coincidencias, contradicciones, supuesto cuestionado, nueva pregunta y "Continuar pensando".

## 9. Coherencia y medición

- Ideas, Rutas y Perspectivas conectan de vuelta al recorrido central con "Llevar esta pregunta a Pneum".
- Textos de Nosotros y Uso de IA alineados: perspectivas conversacionales construidas desde obra publicada, con fuentes, método y límites.
- Eventos del recorrido completo hasta insight guardado y retorno; nunca se guarda el texto de la pregunta junto al evento.

## Detalles técnicos

- Nuevo componente `PneumLens` con subbloques (conceptos, tensión, perspectivas, pregunta) y estados por contexto; se monta en la conversación, el Oráculo, Comparar y Rutas sin duplicar lógica.
- Nueva función de servidor que devuelve la síntesis estructurada del turno, reutilizando el gateway y los prompts existentes; ejecución diferida para no retrasar la respuesta visible.
- Nueva tabla `saved_insights` (usuario, texto, contexto, perspectiva, pregunta de origen, fecha) con RLS por usuario y los GRANT correspondientes; el resto del esquema no se toca.
- `chat-window.tsx` se refactoriza en componentes de turno tipados (respuesta, insight, tensión, contraste, nueva pregunta) reutilizando el streaming y el historial actuales.
- Portada y navegación se reescriben sobre los componentes ya existentes; nada se duplica y ninguna ruta se elimina.
- Sin cambios en autenticación, en la capa de seguridad ni en la lógica de las funciones de IA actuales, salvo la nueva síntesis.
- Todo el texto nuevo pasa por `useI18n` en español e inglés.

## Verificación

Compilación y typecheck limpios, y recorrido real en escritorio, tablet y móvil: portada → pregunta → Oráculo → conversación con Lens → contrastar → síntesis → nueva pregunta → guardar insight → Mi espacio. Se comprueban contraste, teclado, foco, estados vacíos, seguridad ante señales de crisis y que ninguna función actual quede rota.

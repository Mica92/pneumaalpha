# Pneum — Fase de claridad, seguridad y crecimiento

Trabajo sobre el Pneum actual: nada se reconstruye y no se elimina ninguna función que hoy sirva. La entrega cubre el documento completo, ordenada en cuatro tandas para poder verificar cada una antes de seguir.

Lo que confirmé revisando el producto: al enviar con Ctrl+Enter el mensaje se manda dos veces; las preguntas personales viajan escritas en la dirección web; no existe ninguna capa de ayuda ante mensajes de riesgo ni límite de temas; Comparar siempre empieza vacío aunque el Oráculo ya haya recomendado voces; y el texto de "Nosotros" afirma que entrenamos inteligencias artificiales propias, lo cual no corresponde a cómo funciona el producto.

## Tanda 1 — Lo crítico

- **Doble envío**: un solo camino de envío en el chat, con bloqueo mientras hay una respuesta en curso. Pruebas con Enter, Ctrl+Enter, clic, doble clic y teclado móvil.
- **Ayuda ante crisis**: detección en el servidor, antes de elegir perspectiva. Si aparece riesgo, se muestra una tarjeta clara y humana con la Línea de Prevención del Suicidio *4141 (MINSAL, gratuita, 24 horas) para Chile, con estructura preparada para agregar otros países. No se estetiza la desesperanza ni se bloquean preguntas filosóficas normales.
- **Privacidad de la pregunta**: la pregunta deja de aparecer en la dirección web. Pasa por un identificador temporal guardado en el navegador; la dirección solo lleva referencias no sensibles. También se revisa que la medición no guarde el texto.
- **Coherencia del discurso**: se corrige "Nosotros", portada y políticas para describir con precisión cómo funciona Pneum (perspectivas construidas desde obra publicada y guiones propios), sin afirmar entrenamiento de modelos ni "mentes digitalizadas".

## Tanda 2 — El recorrido central

- **Oráculo → Comparar**: las perspectivas recomendadas llegan ya seleccionadas a Comparar, junto con la pregunta original. Se pueden cambiar o quitar. El tope sube de 3 a 4 asientos.
- **Síntesis en Comparar**: al final aparece "¿Qué cambia cuando las ponemos juntas?" con acuerdos, contradicciones, supuestos distintos, la tensión central y la pregunta que queda abierta. Cierra con "Seguir pensando esto".
- **Chat más cuidado**: desplazamiento automático hacia la respuesta nueva, sin interrumpir si el usuario está leyendo más arriba, con botón "Ver respuesta nueva". Estados de espera con frases que describen lo que ocurre en vez de "Pensando".
- **"No sé"**: cuando la persona no tiene la pregunta formulada, Pneum no inventa profundidad: lo acepta y pide contexto con preguntas suaves.
- **Límite de tema**: si piden programación, cálculos o información general, Pneum lo dice con claridad y ofrece pensar el problema, sin fingir ser una herramienta general.
- **Catálogo descubrible**: las 76 perspectivas se navegan por búsqueda, temas (existencia, poder, trabajo, sentido, virtud, libertad, conocimiento, tecnología, sociedad, política) y tradiciones (estoicismo, existencialismo, marxismo, budismo, pensamiento japonés, árabe, latinoamericano y otros). No se elimina ninguna voz.

## Tanda 3 — Valor del producto

- **Mesa Redonda visible**: posicionada como "Pon tu problema frente a perspectivas que no están de acuerdo", con ejemplos de tensión y un cierre que entrega perspectivas, contradicciones, síntesis y una pregunta operativa.
- **Exportar síntesis**: descarga en PDF editorial —pregunta, contexto, perspectivas, argumentos, contradicciones, síntesis, pregunta final y marca Pneum—, no una transcripción del chat.
- **Análisis como producto**: "Analiza cómo estás pensando", pensado también para estudiantes, docentes, periodistas, investigadores y equipos; la filosofía aparece como capa de profundidad.
- **Entradas por situación**: una sección "Empieza por la situación que estás viviendo" con seis entradas (evaluar renunciar, una decisión difícil, liderar algo que puede fracasar, dudar de un proyecto, conflicto con el equipo, no saber formular el problema), en lugar de elegir Personal / Académico / Ejecutivo.
- **Continuidad intelectual**: se conserva dilema del día, sugerencias y compartir, y se agrega "Tu pregunta pendiente". Nada de rachas ni gamificación.
- **Retrato del pensamiento**: lenguaje descriptivo de patrones, nunca diagnóstico ni estados clínicos.

## Tanda 4 — Crecimiento y estructura

- **Portada reordenada**: hero "Piensa mejor lo que tienes delante", campo de pregunta inmediato, demostración real del recorrido, tres capacidades (Comprende, Analiza, Decide), Mesa Redonda, filosofía aplicada, Análisis, cómo funciona, situaciones, arquitectura, para quién y cierre "Trae tu pregunta". Se mantiene la estética actual: serif editorial, arquitectura clásica, oscuro y marfil.
- **Páginas por situación**: cuatro páginas indexables (`/situaciones/...`) que describen la situación, explican cómo ayuda Pneum y abren el Oráculo. Estructura escalable, sin generar páginas en masa.
- **Medición completa**: eventos del embudo desde la visita hasta la intención de pago, separando siempre el evento del contenido privado.
- **Podcast distribuible**: metadatos y estructura preparados para YouTube, Spotify y Apple Podcasts.
- **Bilingüe**: todo lo nuevo pasa por el sistema de idiomas, incluidos avisos, cargas, errores y textos de seguridad.
- **Preparación de cobro**: se deja la arquitectura lista para que Oráculo y conversación sigan libres y las funciones profundas (Mesa Redonda, análisis extenso, retrato, exportables) puedan volverse de pago más adelante. No se activa ningún cobro ahora.

## Detalles técnicos

- Envío del chat: un único `submit` con guardia de petición activa; el `keydown` deja de disparar dos veces al combinar Ctrl y Enter.
- Seguridad: capa de clasificación server-side (riesgo y dominio) previa al ruteo filosófico, con recursos por país en configuración, no incrustados en el prompt.
- Privacidad: se reemplaza `?q=` en Oráculo, Comparar, Buscar, Rutas y chat de filósofo por un identificador opaco con el texto en almacenamiento de sesión; se mantienen enlaces compartibles sin contenido sensible.
- Síntesis y PDF: nuevas funciones de servidor sobre la infraestructura de Mesa Redonda existente; generación del PDF en el cliente para no cargar el servidor de borde.
- Situaciones: nuevas rutas bajo `src/routes/_authenticated/situaciones.*` con metadatos propios y canónicos.
- Sin cambios en autenticación, base de datos ni en el sistema de diseño salvo lo indicado.

## Verificación

Compilación y revisión de errores en cada tanda; pruebas en escritorio, tablet y móvil de: Enter / Ctrl+Enter / clic / doble clic, red lenta, respuestas largas, estados vacíos, búsqueda sin resultados, Oráculo con una y con cuatro perspectivas, preselección y síntesis de Comparar, exportación, señal de riesgo, pregunta fuera de tema, "no sé", enlaces directos, volver atrás, recargar e inicio y cierre de sesión.

Al final entrego el listado de cambios, errores corregidos, cambios de texto, seguridad, privacidad, eventos de medición, pruebas realizadas y lo que quede pendiente.

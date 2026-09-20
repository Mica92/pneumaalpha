# Rediseño de la barra de sesión del filósofo

Refinar la cabecera del chat de cada filósofo hacia un lenguaje de "lujo silencioso": tres filas limpias, monocromo grafito y bronce, sin ruido visual. Solo cambia la presentación; la conversación, el historial, la migración y los idiomas siguen funcionando igual.

## Fila 1 — Perfil y acciones

- Flecha de retorno fina (ícono de línea) seguida del retrato circular en escala de grises.
- Junto al retrato: nombre del pensador en serif y, debajo, un enlace discreto "VER FICHA" en mayúsculas muy pequeñas.
- A la derecha: selector de idioma ES / EN reducido a texto, y acciones solo texto: HISTORIAL, MIGRAR, LIMPIAR, SALIR. Sin cajas ni botones pesados; solo cambio de color al pasar el cursor.
- En móvil se conserva el menú desplegable actual, con el mismo tratamiento sobrio.

## Fila 2 — Temas

- Las seis píldoras (Trabajo, Amor, Miedo, Propósito, Aventura, Crecimiento) pasan a borde finísimo, forma redondeada, texto pequeño en mayúsculas espaciadas.
- Se reemplazan los símbolos tipográficos actuales por íconos de línea minimalistas y uniformes.
- El tema activo se marca solo con borde y texto más claros, sin relleno de color.

## Fila 3 — Dilema del día

- Barra ancha y elegante: contenedor ligeramente elevado, borde casi imperceptible, esquinas suaves.
- Izquierda: ícono geométrico pequeño, encima el rótulo "DILEMA DE HOY" y debajo la pregunta en serif de mayor tamaño.
- Derecha: botón "CONVERSAR" como contorno redondeado, y una "X" discreta para ocultar la barra (mantiene el comportamiento actual de minimizar por sesión).

## Detalles técnicos

- Archivos: `src/components/chat-window.tsx` (cabecera) y `src/components/chat-engagement.tsx` (`TopicBar`, `DilemmaBanner`).
- Se usan los tokens existentes del sistema (ink / paper / bronce, `font-serif` Cormorant y `font-sans` Manrope) en lugar de los colores y fuentes literales del brief, para no romper el tema ni el modo oscuro; el resultado visual es el mismo grafito-pergamino pedido.
- Íconos con `lucide-react` (ya instalado): `ArrowLeft`, `X`, además de formas neutras para las píldoras de tema.
- Se eliminan los degradados azulados heredados (`mist` / `glacier`) de la barra de dilema y las píldoras; quedan bordes `border-white/10` equivalentes en tokens.
- Sin cambios en estado, llamadas al servidor, i18n ni analítica; se reutilizan todos los textos traducidos actuales.
- Verificación: typecheck/build y capturas en escritorio y móvil de una conversación.

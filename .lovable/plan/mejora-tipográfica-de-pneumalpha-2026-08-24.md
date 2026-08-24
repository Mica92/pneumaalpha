# Mejora tipográfica de PneumAlpha

Solo tipografía. No cambio paleta, layout, componentes ni lógica. La estructura visual queda exactamente igual: mejora la escala, el ritmo y la legibilidad del texto.

## Qué cambia

1. **Escala tipográfica coherente**
   Hoy los tamaños se eligen suelto en cada página (`text-3xl`, `text-7xl`, `text-2xl`…). Defino una escala fluida con tokens en `src/styles.css` (display, título, subtítulo, cuerpo, cuerpo pequeño, etiqueta) usando `clamp()`, y las páginas la usan mediante utilidades. Resultado: mismos tamaños en toda la app, sin saltos raros entre móvil y escritorio.

2. **Legibilidad del cuerpo de texto**
   - Ancho de línea máximo (~68 caracteres) en párrafos y respuestas del chat.
   - Altura de línea 1.65 en cuerpo, 1.1–1.2 en titulares grandes.
   - Tamaño mínimo de cuerpo 16px en móvil (hoy hay textos de 12–13px en tarjetas y chips que cuestan leer).

3. **Titulares serif mejor ajustados**
   Cormorant Garamond es de contraste alto: a tamaños grandes se ve elegante, a tamaños pequeños se ve débil. Regla clara: serif solo desde subtítulo hacia arriba; de ahí abajo, Manrope. Además `text-wrap: balance` en titulares y `text-wrap: pretty` en párrafos para evitar líneas huérfanas.

4. **Detalles de ajuste óptico**
   - Interletrado negativo suave en display serif, neutro en tamaños medios.
   - La utilidad `label` (versalitas con 0.28em) baja a 0.18em y sube a 11px: hoy con 10px y tanto espaciado se lee con esfuerzo.
   - Cifras tabulares en números y contadores para que no bailen.
   - Cursiva real de Cormorant donde hoy se sintetiza.

5. **Carga de fuentes**
   Se recortan los pesos que no se usan y se añade `font-display: swap` más precarga del peso principal, para que el primer texto no salte al cargar.

6. **Accesibilidad**
   Contraste AA en textos secundarios (el gris cálido actual queda corto en textos pequeños sobre el fondo tinta), y respeto del tamaño de fuente del sistema.

## Alcance de archivos

- `src/styles.css`: tokens de escala, utilidades tipográficas, ajustes de `label` y de titulares.
- `src/routes/__root.tsx`: enlace de fuentes afinado y precarga.
- Páginas y componentes con texto (home, filósofos, ideas, rutas, explorar, buscar, comparar, mi mapa, perfil, nosotros, chat, tarjetas): se sustituyen tamaños suelto por las clases de la escala. Solo clases de texto; sin tocar estructura ni props.

## Notas técnicas

- Tokens `--text-display`, `--text-title`, `--text-subtitle`, `--text-body`, `--text-small`, `--text-label` en `@theme` con `clamp()`, expuestos como utilidades `@utility` en Tailwind v4.
- `measure` / `measure-wide` para el ancho de lectura; `nums-tabular` para cifras.
- Verificación final con capturas en móvil y escritorio de home, ficha de filósofo y chat, comprobando que no aparece desbordamiento horizontal.

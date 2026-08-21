# Fondo tintado solo en la red + Valores en Nosotros

## 1. El color solo tiñe la red neuronal
Hoy el tinte se aplica sobre toda la imagen, así que el fondo entero cambia de color.

Cambio en el componente de fondo global:
- La imagen se muestra en escala de grises neutra (base oscura sin color).
- El color aleatorio se aplica en una capa separada recortada con la propia imagen como máscara (`mask-image` con la textura de la red), de modo que el color aparece únicamente en las líneas y nodos brillantes de la red y el resto del fondo queda en el tono ink del sitio.
- Se mantiene el tinte aleatorio por visita (azul, rosa, amarillo, verde, violeta, ámbar, cian) y el degradado inferior para legibilidad.

## 2. SEO de /nosotros
La página ya tiene title, description, OpenGraph, twitter:card y canonical. Solo se ajustará:
- `og:title` / `og:description` en inglés cuando corresponda no aplica (metadatos son estáticos), pero se afinará la descripción para incluir "valores" y quedar bajo 160 caracteres.
- Se añadirá JSON-LD de tipo `Organization` (nombre, descripción, URL) para buscadores y motores de IA.

## 3. Sección "Valores" en /nosotros
Nuevo bloque después de Misión y antes (o después) de Visión, con el mismo estilo editorial: encabezado de sección con hairline y una grilla de tarjetas, una por valor:

Conciencia · Pensamiento crítico · Integración · Bienestar colectivo · Accesibilidad · Ética · Sabiduría aplicada

Cada tarjeta: título en serif + párrafo con el texto exacto entregado. Todo bilingüe ES/EN vía `t()`, añadiendo las claves `about.values.*` al diccionario de i18n.

## Detalles técnicos
- `src/components/neural-background.tsx`: capa `mask-image`/`-webkit-mask-image` con la imagen, `backgroundColor` = tinte, más filtro `grayscale` en el `<img>` base.
- `src/lib/i18n.tsx`: 7 títulos + 7 párrafos de valores en es/en.
- `src/routes/_authenticated/nosotros.tsx`: sección `Valores` + script JSON-LD en `head()`.
